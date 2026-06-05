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



const AuthGuard = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { loginWithAccessToken } = useAuthentication()

  const { user } = useUserContext()

  const path = useLocation().pathname

  const navigate = useNavigate()

  useEffect(() => {
    const token =
      localStorage.getItem(
        "access_token"
      )
      if(notAllowedWithLogin.includes(path)&&user.isAuthenticated){
        navigate("/")
        return
      }

    // Auto login
    if (
      !user.isAuthenticated &&
      token
    ) {
      loginWithAccessToken.mutate()
      return
    }
  },[user.isAuthenticated])

  if(user.isAuthenticated&&notAllowedWithLogin.includes(path))
    return <></>
    else
  return <>{children}</>
}

export default AuthGuard