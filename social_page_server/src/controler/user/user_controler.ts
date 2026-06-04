
import jwt, {
  JwtPayload,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken"
import { Request, Response } from "express"
import { getUsersSchema, loginUserSchema } from "../../validation/userValidation"
import { comparePassword } from "../../utils/hashPassword"
import { registerUserSchema } from "../../validation/userValidation"
import { hashPassword } from "../../utils/hashPassword"
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken"

import logger from "../../utils/logger"

import { IUser, User } from "../../Models/userSchema"
import { Otp } from "../../Models/otpSchema"
import { ApiError } from "../../middleware/errorHandler"
import { env } from "../../config/config.env"

interface CustomJwtPayload
  extends JwtPayload {
  userId: string
}


export const getsafeUser=(user:IUser)=>{
return {
                email:user.email,
                profilePicture:user.profilePicture,
                role:user.role,
                id:user._id,
                phoneNumber:user.phoneNumber,
                userName:user.userName,
            }
}

export const registerUser = async (
  req: Request,
  res: Response
) => {
  logger.info("hit register user")

  try {
    const validationResult =
      registerUserSchema.safeParse(req.body)

    if (!validationResult.success) {
      logger.error(
        "validation failed at register user",
        req.body
      )

      return res.status(400).json({
        success: false,
        message: validationResult.error.flatten(),
      })
    }

    const {
      email,
      password,
      otp,
      userName,
    } = validationResult.data

    // Check existing user
    const userAlreadyExist = await User.findOne({
      email,
    })

    if (userAlreadyExist) {
      logger.warn("user already exist")

      return res.status(400).json({
        success: false,
        message: "user already exist",
      })
    }

    // Verify OTP
    const otpObj = await Otp.findOne({
      email,
      otp,
    })

    if (!otpObj) {
      return res.status(402).json({
        success: false,
        message: "otp does not match",
      })
    }

    // Check OTP expiration
    const now = Date.now()

    const createdAt =
      otpObj.createdAt.getTime()

    const remainingTime =
      (now - createdAt) / 1000 / 60

    if (remainingTime > 5) {
      await Otp.deleteMany({ email })

      return res.status(402).json({
        success: false,
        message:
          "otp expired, please try again later",
      })
    }

    // Hash password
    const hashedPassword =
      await hashPassword(password)

    // Create user
    const newUser = await User.create({
      email,
      userName,
      password: hashedPassword,
      authProvider:'EMAIL'    })

    logger.info("new user created", {
      id: newUser._id,
      email: newUser.email,
    })

    // Delete OTP after successful registration
    await Otp.deleteMany({ email })

    // Generate tokens
    const access_token =
      await generateAccessToken(
        newUser._id.toString()
      )

    const refresh_token =
      await generateRefreshToken(
        newUser._id.toString()
      )

    return res
      .status(200)
      .cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: true,
      })
      .json({
        success: true,
        message: "user created successfully",
        data: getsafeUser(newUser),
        access_token,
      })
  } catch (e) {
    logger.error("error registering user", e)

    return res.status(500).json({
      success: false,
      message: "internal server error",
    })
  }
}


// LOGIN USER

export const LoginUser = async (
  req: Request,
  res: Response
) => {
  try {
    const validationResult =
      loginUserSchema.safeParse(req.body)

    if (!validationResult.success) {
      logger.warn(
        "error while validation",
        validationResult.error.flatten()
      )

      return res.status(400).json({
        success: false,
        error:
          validationResult.error.flatten(),
        message: "validation error",
      })
    }

    const { email, password } =
      validationResult.data

    // Find User
    const user = await User.findOne({
      email,
      authProvider:'EMAIL',
    })

    if (!user) {
      logger.warn(
        "email or password is incorrect"
      )

      return res.status(401).json({
        success: false,
        message:
          "email or password is incorrect",
      })
    }

    // Compare Password
    const matchedPassword =
      await comparePassword(
        password,
        user.password || ""
      )

    if (!matchedPassword) {
      logger.warn(
        "email or password is incorrect"
      )

      return res.status(401).json({
        success: false,
        message:
          "email or password is incorrect",
      })
    }

    // Generate Tokens
    const access_token =
      generateAccessToken(
        user._id.toString()
      )

    const refresh_token =
      generateRefreshToken(
        user._id.toString()
      )

    logger.info("login successfully", {
      id: user._id,
    })

    return res
      .status(200)
      .cookie(
        "refresh_token",
        refresh_token,
        {
          httpOnly: true,
          secure: true,
        }
      )
      .json({
        success: true,
        message: "login successfully",
        data: getsafeUser(user),
        access_token,
      })
  } catch (e) {
    logger.error(
      "error while login user",
      e
    )

    throw new ApiError(
      "internal server error",
      500
    )
  }
}


// REFRESH USER

export const refreshUser = async (
  req: Request,
  res: Response
) => {
  try {
    logger.info("hit refresh user")

    const refreshToken =
      req.cookies.refresh_token

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "no refresh token found",
      })
    }

    // Verify Token
    const decoded = jwt.verify(
      refreshToken,
      env.jwt_refresh_secret
    ) as CustomJwtPayload

    // Find User
    const user = await User.findById(
      decoded.userId
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      })
    }

    // Generate New Tokens
    const access_token =
      generateAccessToken(
        user._id.toString()
      )

    const new_refresh_token =
      generateRefreshToken(
        user._id.toString()
      )

    return res
      .status(200)
      .cookie(
        "refresh_token",
        new_refresh_token,
        {
          httpOnly: true,
          secure: true,
        }
      )
      .json({
        success: true,
        message:
          "refresh successfully",
        data: getsafeUser(user),
        access_token,
      })
  } catch (e) {
    console.log(e)

    if (
      e instanceof TokenExpiredError
    ) {
      return res.status(401).json({
        success: false,
        message: "token expired",
      })
    }

    if (
      e instanceof JsonWebTokenError
    ) {
      return res.status(401).json({
        success: false,
        message: "invalid token",
      })
    }

    throw new ApiError(
      "internal server error",
      500
    )
  }
}

export const logout = async (
  req: Request,
  res: Response
) => {
  logger.info("Hit logout controller")

  try {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (e) {
    logger.error("Error while logout", e)

    throw new ApiError(
      "Internal Server Error",
      500
    )
  }
}
export const updateUser=async()=>{}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const validationResult = getUsersSchema.safeParse(req.query)

    if (!validationResult.success) {
      logger.error(
        "validation failed at get users",
        validationResult.error.flatten()
      )

      return res.status(400).json({
        success: false,
        message: "Input validation error",
        error: validationResult.error.flatten(),
      })
    }

    const {
      page = 1,
      limit = 10,
      userName = "",
    } = validationResult.data

    const users = await User.find({
      userName: {
        $regex: userName,
        $options: "i",
      },
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-password")

    const totalUsers = await User.countDocuments({
      userName: {
        $regex: userName,
        $options: "i",
      },
    })

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    })
  } catch (e) {
    throw new ApiError("Internal Server Error", 500)
  }
}

export const assignRole = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { role } = req.body

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      })
    }

    const exists = await User.findById(id)

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      {
        new: true,
      }
    ).select("-password")

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updatedUser,
    })
  } catch (e) {
    throw new ApiError("Internal Server Error", 500)
  }
}
export const deleteUser=async(req:Request,res:Response)=>{
  try{
    const id=req.params.id as string
    const exists=await User.findById(id)
    if(!exists){
      return res.status(404).json({message:"User not found",success:false})
    }
    if(exists.role==="ADMIN"){
      return res.status(400).json({message:"Admin user cannot be deleted",success:false})
    }
    await User.findByIdAndDelete(id)
    return res.status(200).json({message:"User deleted successfully",success:true})
  }catch(e){
    throw new ApiError("Internal Server Error", 500)
  }}