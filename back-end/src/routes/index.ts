import { Router } from 'express'

import userRoutes from '~/modules/users/user.routes'

const router = Router()

router.use('/user', userRoutes) // /api/user

export default router
