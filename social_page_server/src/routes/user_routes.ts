import express from "express"
import authorizationMiddleware from "../middleware/authentication"
import { asyncError } from "../middleware/errorHandler"
import { assignRole, deleteUser, getUsers } from "../controler/user/user_controler"
const userRouter=express.Router()

userRouter.get("/",authorizationMiddleware(['ADMIN']),asyncError(getUsers))
userRouter.put("/asign-role/:id",authorizationMiddleware(['ADMIN']),asyncError(assignRole))
userRouter.delete('/:id',authorizationMiddleware(['ADMIN']),asyncError(deleteUser))
export default userRouter