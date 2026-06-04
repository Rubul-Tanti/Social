import mongoose, { Schema, Document, Model } from "mongoose"

// USER INTERFACE

export interface IUser extends Document {
  // Auth
  email: string
  password?: string

  role:'ADMIN'|'USER'
  authProvider: 'EMAIL'|'GOOGLE'

  googleId?: string

  resetPasswordToken?: string
  resetPasswordTokenExpires?: Date

  twoFactorSecret?: string
  twoFactorEnabled: boolean

  // Profile
  profilePicture?: string
  userName: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  dateOfBirth?: Date

  // Security
  lastLoginAt?: Date
  lastLoginIp?: string
  loginAttempts: number
  lockedUntil?: Date
  isActive: boolean

  // Timestamps
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}


// USER SCHEMA


const userSchema = new Schema<IUser>(
  {

    // Auth
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
    },

    role: {
      type: String,
      enum:['ADMIN','USER'],
      default:'USER',
    },

    authProvider: {
      type: String,
      enum: ['EMAIL','GOOGLE'],
      default:'EMAIL',
    },

    googleId: String,

    resetPasswordToken: {
      type: String,
      unique: true,
      sparse: true,
    },

    resetPasswordTokenExpires: Date,

    twoFactorSecret: String,

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // Profile
    profilePicture: String,

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    firstName: String,
    lastName: String,
    phoneNumber: String,

    dateOfBirth: Date,

    // Security
    lastLoginAt: Date,

    lastLoginIp: String,

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockedUntil: Date,

    isActive: {
      type: Boolean,
      default: true,
    },

    deletedAt: Date,
  },
  {
    timestamps: true,
  }
)


// INDEXES
userSchema.index({ role: 1 })
userSchema.index({ deletedAt: 1 })
// MODEL
export const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema)