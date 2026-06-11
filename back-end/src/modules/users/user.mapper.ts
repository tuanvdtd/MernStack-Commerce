import { dbRoleToApiRole } from '~/config/rbacConfig'
import { TokenService } from '~/core/auth/token'

type UserWithRole = {
  id: number
  email: string
  name: string
  phone: string | null
  avatarUrl: string | null
  joinAt: Date
  role: { name: string }
}

/** Map user DB sang response profile (không kèm token). */
export function toProfileResponse(user: UserWithRole) {
  const role = dbRoleToApiRole[user.role.name] ?? user.role.name.toLowerCase()

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    joinAt: user.joinAt.toISOString(),
    role,
  }
}

export function toAuthResponse(user: UserWithRole) {
  const profile = toProfileResponse(user)
  const { accessToken } = TokenService.generateTokens({ id: user.id, role: profile.role })

  return {
    ...profile,
    token: accessToken,
  }
}
