import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
import { ConnectToDb } from './config/db_config'
import authRouter from './routes/auth_routes'
import { requestLogger } from './middleware/req_logger'
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler'
import { corsConfig } from './config/cors_config'
import userRouter from './routes/user_routes'
import postRoutes from './routes/post_routes'
dotenv.config()
export const app=express()
ConnectToDb()
app.use(cors(corsConfig))
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(requestLogger)
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/post",postRoutes)
app.use(notFoundHandler)
app.use(globalErrorHandler)