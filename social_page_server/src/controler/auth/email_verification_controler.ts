import { Request, Response } from "express"
import { z } from "zod"

import logger from "../../utils/logger"
import { generateOtp } from "../../utils/generateOtp"
import { sendOtp } from "../../services/emailService/sendOtp"

import { User } from "../../Models/userSchema"
import { Otp } from "../../Models/otpSchema"

export const emailValidation = z.object({
  email: z.email(),
})

export const emailverification = async (
  req: Request,
  res: Response
) => {
  logger.info("hit emailverification")

  const result = emailValidation.safeParse(req.body)

  if (!result.success) {
    logger.warn("Invalid email input", {
      error: result.error,
    })

    return res.status(400).json({
      success: false,
      message: "Invalid email",
    })
  }

  const { email } = result.data

  try {
    // Check if user already exists
    const userAlreadyExist = await User.findOne({ email })

    if (userAlreadyExist) {
      logger.warn("user already exist", {
        email,
      })

      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    // Check existing OTP
    const existingOtp = await Otp.findOne({ email })

    if (existingOtp) {
      const diffMinutes =
        (Date.now() - existingOtp.createdAt.getTime()) /
        1000 /
        60

      if (diffMinutes < 5) {
        const remaining = 5 - diffMinutes

        logger.warn("OTP rate limit hit", {
          email,
        })

        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(
            remaining
          )} minutes before requesting another OTP`,
        })
      }

      // Remove old OTP
      await Otp.deleteMany({ email })
    }

    // Generate OTP
    const otp = generateOtp().toString()

    // Save OTP
    await Otp.create({
      email,
      otp,
    })

    // Send Email
    await sendOtp(email, otp)

    logger.info("OTP sent successfully", {
      email,
    })

    return res.status(200).json({
      success: true,
      message:
        "If the email exists, an OTP has been sent for verification.",
    })
  } catch (error) {
    logger.error("Email verification error", {
      email,
      error,
    })

    return res.status(500).json({
      success: false,
      message:
        "An internal server error occurred. Please try again later.",
    })
  }
}