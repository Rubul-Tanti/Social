import jwt, {
  JwtPayload,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken"

import {
  Request,
  Response,
  NextFunction,
} from "express"

import { env } from "../config/config.env"

import { User } from "../Models/userSchema"

import { getsafeUser } from "../controler/user/user_controler"

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken"


// TYPES

interface JwtCustomPayload
  extends JwtPayload {
  userId: string
}


// HELPERS


const extractBearerToken = (
  req: Request
): string | null => {
  const header = req.headers.authorization

  if (!header?.startsWith("Bearer "))
    return null

  const token = header.split(" ")[1]

  return token?.trim() || null
}

const verifyToken = (
  token: string
): JwtCustomPayload => {
  return jwt.verify(
    token,
    env.jwt_access_secret
  ) as JwtCustomPayload
}

// LOGIN ROUTE HANDLER
const handleLoginRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractBearerToken(req)

  if (!token) {
    next()
    return
  }

  try {
    const { userId } = verifyToken(token)

    const user = await User.findById(userId)

    if (!user) {
      res.status(401).json({
        message: "User not found",
      })

      return
    }

    const access_token =
      generateAccessToken(
        user._id.toString()
      )

    const refresh_token =
      generateRefreshToken(
        user._id.toString()
      )

    res
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
        message: "Login successful",
        data: getsafeUser(user),
        access_token,
      })
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      res.status(401).json({
        message: "Token expired",
      })

      return
    }

    if (e instanceof JsonWebTokenError) {
      res.status(401).json({
        message: "Invalid token",
      })

      return
    }

    next()
  }
}


// AUTHORIZATION


const authorizationMiddleware = (
  requiredRole: string[] = []
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Login Route Check
    if (
      req.originalUrl.startsWith(
        "/api/auth/login"
      )
    ) {
      await handleLoginRoute(
        req,
        res,
        next
      )

      return
    }


    const token =extractBearerToken(req)

    if(requiredRole.length==0&&!token){
      next()
      return
    }

    if (!token) {

      res.status(401).json({
        message:
          "No authorization header found",
      })

      return
    }

    try {
      const { userId } =verifyToken(token)

      const user =
        await User.findById(userId)


      if (!user) {
        res.status(401).json({
          message: "User not found",
        })

        return
      }

      // Role Check
      if (
        requiredRole.length > 0 &&
        !requiredRole.includes(user.role)
      ) {
        res.status(403).json({
          message:
            "Insufficient permissions",
        })

        return
      }

      req.user = {
        id: user._id.toString(),
        email: user.email,
      }

      next()
    } catch (e) {
      if (
        e instanceof TokenExpiredError
      ) {
            if(requiredRole.length){
      next()
      return
    }
        res.status(401).json({
          message: "Token expired",
        })

        return
      }

      if (
        e instanceof JsonWebTokenError
      ) {

            if(requiredRole.length){
      next()
      return
    }
        res.status(401).json({
          message: "Invalid token",
        })

        return
      }

      res.status(500).json({
        message:
          "Internal server error",
      })
    }
  }
}

export default authorizationMiddleware