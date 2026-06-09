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

/** Map tên role trong DB (USER, ADMIN) sang role API (user, admin) */
export const dbRoleToApiRole: Record<string, string> = {
  USER: roles.USER,
  ADMIN: roles.ADMIN,
}

export function hasPermission(userRole: string | undefined, permission: string): boolean {
  if (!userRole) return false
  return (rolePermissions[userRole] ?? []).includes(permission)
}
