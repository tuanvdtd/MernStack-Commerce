import { hasPermission as checkPermission } from '~/config/rbacConfig'

export const usePermission = (userRole: string | undefined) => {
  const hasPermission = (permission: string) => checkPermission(userRole, permission)

  return { hasPermission }
}
