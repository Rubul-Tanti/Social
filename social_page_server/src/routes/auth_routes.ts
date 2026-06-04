import express from 'express'
import { asyncError } from '../middleware/errorHandler'
import { emailverification } from '../controler/auth/email_verification_controler'
import {  LoginUser, logout, refreshUser, registerUser } from '../controler/user/user_controler'
import authorizationMiddleware from '../middleware/authentication'
import { registerWithGoogle } from '../controler/auth/google-oauth_controler'
import { requestPasswordChange, resetPassword } from '../controler/auth/password_controler'
const authRouter=express.Router()
authRouter.post('/email-verification',asyncError(emailverification))
authRouter.post('/register',asyncError(registerUser))
authRouter.post('/login',authorizationMiddleware([]),asyncError(LoginUser))
authRouter.get('/refresh',asyncError(refreshUser))
authRouter.get('/logout',authorizationMiddleware([]),asyncError(logout))
authRouter.post('/register-with-google',asyncError(registerWithGoogle))
authRouter.post('/request-password-change',authorizationMiddleware([]),asyncError(requestPasswordChange))
authRouter.post('/reset-password',authorizationMiddleware([])),asyncError(resetPassword)

export default authRouter