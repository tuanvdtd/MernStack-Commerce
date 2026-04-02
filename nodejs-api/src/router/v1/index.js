import { StatusCodes } from 'http-status-codes'
import express from 'express'
import { accessRouter } from './access/index.js' 
import authMiddleware from '~/auth/checkAuth.js'
import { productRouter } from './product/index.js'
import { discountRouter } from './discount/index.js'
import { cartRouter } from './cart/index.js'
import { checkoutRouter } from './checkout/index.js'
import { inventoryRouter } from './inventory/index.js'
import { pushToLogDiscord } from '~/middlewares/index.js'
import { commentRouter } from './comment/index.js'
import { notificationRouter } from './notification/index.js'
import { uploadRouter } from './upload/index.js'
import { profileRouter } from './profile/index.js'
import { rbacRouter } from './rbac/index.js'
import { userRouter } from './user/index.js'

const Router = express.Router()

// log discord mỗi lần có request vào api
Router.use(pushToLogDiscord)

// check api access, nếu có api key trên header thì cho phép truy cập
Router.use(authMiddleware.apiKey)

// check permissions authorization
Router.use(authMiddleware.permission('0000'))

Router.use('/api/shop', accessRouter)
Router.use('/api/product', productRouter)
Router.use('/api/cart', cartRouter)
Router.use('/api/discount', discountRouter)
Router.use('/api/checkout', checkoutRouter)
Router.use('/api/inventory', inventoryRouter)
Router.use('/api/comment', commentRouter)
Router.use('/api/notification', notificationRouter)
Router.use('/api/upload', uploadRouter)
Router.use('/api/profile', profileRouter)
Router.use('/api/rbac', rbacRouter)
Router.use('/api/user', userRouter)


Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: `${StatusCodes.OK}`,
    message: 'Server is running in version 1'
  })
})


export const Router_V1 = Router
