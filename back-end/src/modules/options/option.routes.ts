import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { OptionController } from '~/modules/options/option.controller'

const r = Router()

r.use(authenticate, requirePermission(permissions.VIEW_ADMIN))

r.get('/', asyncHandler(OptionController.list))

export default r
