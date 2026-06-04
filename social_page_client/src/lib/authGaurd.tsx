import React, { useEffect } from "react"
import {
  useLocation,
  useNavigate,
} from "react-router-dom"

import { useUserContext } from "../contextProvider"

import { useAuthentication } from "../hooks/useAuthentication"

const notAllowedWithLogin = [
  "/signin",
  "/signup",
  "/forgot-password",
]


const adminRoles = ["ADMIN"]

const AuthGuard = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { loginWithAccessToken } = useAuthentication()

  const { user } = useUserContext()

  const path = useLocation().pathname

  const navigate = useNavigate()

  const isProtected = path.startsWith("/admin")

  const isAuthRoute = notAllowedWithLogin.includes(path)



  const hasAdminAccess =
    user.role !== null &&
    adminRoles.includes(user.role)

  useEffect(() => {
    const token =
      localStorage.getItem(
        "access_token"
      )

    // Auto login
    if (
      !user.isAuthenticated &&
      token
    ) {
      loginWithAccessToken.mutate()

      return
    }

    // Protected route
    if (
      !user.isAuthenticated &&
      isProtected
    ) {
      navigate("/signin", {
        replace: true,
      })

      return
    }

    // No admin access
    if (
      user.isAuthenticated &&
      isProtected &&
      !hasAdminAccess
    ) {
      navigate("/", {
        replace: true,
      })

      return
    }

    // Already logged in
    if (
      user.isAuthenticated &&
      isAuthRoute
    ) {
      navigate("/", {
        replace: true,
      })
    }
  }, [
    path,
    user.isAuthenticated,
    user.role,
  ])

  if (
    !user.isAuthenticated &&
    isProtected
  )
    return null

  if (
    user.isAuthenticated &&
    isProtected &&
    !hasAdminAccess
  )
    return null

  if (
    user.isAuthenticated &&
    isAuthRoute
  )
    return null

  return <>{children}</>
}

export default AuthGuard