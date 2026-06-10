import { Router } from 'express'

import categoryRoutes from '~/modules/categories/category.routes'
import optionRoutes from '~/modules/options/option.routes'
import productRoutes from '~/modules/products/product.routes'
import uploadRoutes from '~/modules/upload/upload.routes'
import userRoutes from '~/modules/users/user.routes'

const router = Router()

router.use('/user', userRoutes)
router.use('/products', productRoutes)
router.use('/upload', uploadRoutes)
router.use('/categories', categoryRoutes)
router.use('/options', optionRoutes)

export default router
