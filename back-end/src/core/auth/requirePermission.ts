import { Response, NextFunction } from 'express'

import { hasPermission } from '~/config/rbacConfig'
import { AuthRequest } from '~/core/auth/auth.middleware'
import { ApiError } from '~/core/http/ApiError'

export function requirePermission(...requiredPermissions: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role

    const allowed = requiredPermissions.some((permission) =>
      hasPermission(userRole, permission),
    )

    if (!allowed) {
      throw ApiError.Forbidden('You do not have permission to access this resource')
    }

    next()
  }
}
