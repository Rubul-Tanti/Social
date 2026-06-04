import mongoose, { Schema, Document, Model } from "mongoose"

export interface IOtp extends Document {
  email: string
  otp: string
  createdAt: Date
}

const otpSchema = new Schema<IOtp>({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  otp: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
})


export const Otp: Model<IOtp> =
  mongoose.models.Otp ||
  mongoose.model<IOtp>("Otp", otpSchema)