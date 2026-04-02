
import express from 'express'
import errorHandle from '~/core/errorHandle.js'
import UserController from '~/controllers/user.controller.js'

const Router = express.Router()
Router.post('/new-user', errorHandle(UserController.createUser))
export const userRouter = Router
