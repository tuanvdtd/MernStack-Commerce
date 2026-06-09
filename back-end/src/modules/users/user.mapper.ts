import { dbRoleToApiRole } from '~/config/rbacConfig'
import { TokenService } from '~/core/auth/token'

type UserWithRole = {
  id: number
  email: string
  name: string
  phone: string | null
  avatarUrl: string | null
  role: { name: string }
}

export function toAuthResponse(user: UserWithRole) {
  const role = dbRoleToApiRole[user.role.name] ?? user.role.name.toLowerCase()
  const { accessToken } = TokenService.generateTokens({ id: user.id, role })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    role,
    token: accessToken,
  }
}
