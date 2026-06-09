export const roles = {
  USER: 'user',
  ADMIN: 'admin',
} as const

export const permissions = {
  VIEW_ADMIN: 'view_admin_dashboard',
  VIEW_USER: 'view_user_dashboard',
} as const

export const rolePermissions: Record<string, string[]> = {
  [roles.USER]: [permissions.VIEW_USER],
  [roles.ADMIN]: [permissions.VIEW_ADMIN],
}

export function hasPermission(userRole: string | undefined, permission: string): boolean {
  if (!userRole) return false
  return (rolePermissions[userRole] ?? []).includes(permission)
}

export function getLoginRedirectPath(userRole: string): string {
  if (hasPermission(userRole, permissions.VIEW_ADMIN)) {
    return '/admin/products'
  }
  if (hasPermission(userRole, permissions.VIEW_USER)) {
    return '/'
  }
  return '/'
}
