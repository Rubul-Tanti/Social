

import { HashResetPasswordToken } from "../../utils/resetPasswordToken"

import { hashPassword } from "../../utils/hashPassword"
import { emailValidation } from "./email_verification_controler"
import { Request, Response } from "express"
import { z } from "zod"

import { ApiError } from "../../middleware/errorHandler"

import logger from "../../utils/logger"

import { generateResetPasswordToken } from "../../utils/resetPasswordToken"

import sendResetPasswordToken from "../../services/emailService/sendResetToken"

import { getsafeUser } from "../user/user_controler"

import { User } from "../../Models/userSchema"





// REQUEST PASSWORD CHANGE


export const requestPasswordChange = async (
  req: Request,
  res: Response
) => {
  try {
    const validationResult =
      emailValidation.safeParse(
        req.body
      )

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "validation error",
        error:
          validationResult.error.flatten(),
      })
    }

    const { email } =
      validationResult.data

    // Find User
    const user = await User.findOne({
      email,
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      })
    }

    // Generate Reset Token
    const { token, hashedToken } =
      generateResetPasswordToken()

    // Update User
    user.resetPasswordToken =
      hashedToken

    user.resetPasswordTokenExpires =
      new Date(
        Date.now() + 15 * 60 * 1000
      )

    await user.save()

    // Send Email
    await sendResetPasswordToken(
      token,
      email
    )

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
      data: getsafeUser(user),
    })
  } catch (e) {
    logger.error(
      "error while requesting password reset",
      e
    )

    throw new ApiError(
      "internal server error",
      500
    )
  }
}

// VALIDATION
const validationSchema = z.object({
  url: z.string(),
  newPassword: z
    .string()
    .min(3)
    .max(12),

  email: z
    .string()
    .email("invalid email"),
})


// RESET PASSWORD


export const resetPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const validationResult =
      validationSchema.safeParse(
        req.body
      )

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "validation error",
        error:
          validationResult.error.flatten(),
      })
    }

    const {
      email,
      url,
      newPassword,
    } = validationResult.data

    // Hash Reset Token
    const token =
      HashResetPasswordToken(url)

    // Find User
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordTokenExpires: {
        $gt: new Date(),
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "reset token expired please try again",
      })
    }

    // Hash Password
    const hashedPassword =
      await hashPassword(newPassword)

    // Update User
    user.password = hashedPassword

    user.resetPasswordToken = undefined

    user.resetPasswordTokenExpires =
      undefined

    await user.save()

    return res.status(200).json({
      success: true,
      message:
        "password reset successfully",
      data: getsafeUser(user),
    })
  } catch (e) {
    console.log(e)

    throw new ApiError(
      "internal server error",
      500
    )
  }
}
