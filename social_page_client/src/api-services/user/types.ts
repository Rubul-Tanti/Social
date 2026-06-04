export type UserRole = "ADMIN" | "SALE_USERS"

export type AuthProvider = "GOOGLE" | "EMAIL"

export interface User {
  _id: string
  email: string
  role: UserRole
  authProvider: AuthProvider
  googleId?: string
  twoFactorEnabled: boolean
  profilePicture?: string
  userName: string
  loginAttempts: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  __v: number
}

export interface GetUsersResponse {
  success: boolean
  message: string
  data: User[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}