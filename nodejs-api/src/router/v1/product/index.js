import { StatusCodes } from 'http-status-codes'
import express from 'express'
import ProductController from '~/controllers/product.controller'
import errorHandle from '~/core/errorHandle.js'
import { authentication, authenticationV2 } from '~/auth/authUtils.js'

const Router = express.Router()
Router.get('/search/:keySearch', errorHandle(ProductController.searchProductByUser))
Router.get('/:id', errorHandle(ProductController.getProductById))
Router.get('/', errorHandle(ProductController.getAllProducts))

// Phần thực hiện login, logout, refresh token này khá difficult, để học thôi chứ làm đơn giản như trong project trello cho gọn :))
// Các route dưới đây cần xác thực mới được truy cập
Router.use(authenticationV2)
Router.post('/', errorHandle(ProductController.createProduct))
Router.patch('/:id', errorHandle(ProductController.updateProduct))
Router.post('/publish/:id', errorHandle(ProductController.publishProductByShop))
Router.post('/unpublish/:id', errorHandle(ProductController.unPublishProductByShop))
Router.get('/drafts/all', errorHandle(ProductController.getAllDraftsForShop))
Router.get('/published/all', errorHandle(ProductController.getAllPublishedForShop))


// ----------spu, sku-------------------
Router.post('/spu/new', errorHandle(ProductController.createSpu))
Router.get('/sku/select-variation', errorHandle(ProductController.getOneSku))
Router.get('/spu/get-spu-info', errorHandle(ProductController.getOneSpu))


export const productRouter = Router
