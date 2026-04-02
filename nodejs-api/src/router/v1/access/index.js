import { StatusCodes } from 'http-status-codes'
import express from 'express'
import AccessController from '~/controllers/access.controller.js'
import errorHandle from '~/core/errorHandle.js'
import { authentication, authenticationV2 } from '~/auth/authUtils.js'

const Router = express.Router()

Router.post('/signup', errorHandle(AccessController.signUp))
Router.post('/signin', errorHandle(AccessController.signIn))


// Phần thực hiện login, logout, refresh token này khá difficult, để học thôi chứ làm đơn giản như trong project trello cho gọn :))
// Các route dưới đây cần xác thực mới được truy cập
Router.use(authenticationV2)
Router.post('/signout', errorHandle(AccessController.signOut))
Router.post('/refresh-token', errorHandle(AccessController.refreshToken))
export const accessRouter = Router
