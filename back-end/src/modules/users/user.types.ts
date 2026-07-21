
export type User = {
  id?: string
  email: string
  name: string
  password: string
  role: string
  joinAt?: Date
  phone?: string
  avatarUrl?: string
  googleId?: string
}

export type RegisterUserDto = Pick<User, 'email' | 'name' | 'password'>

/** Body PATCH /user/me — chỉ field profile cho phép cập nhật. */
export type PatchProfileInput = {
  name?: string
  phone?: string | null
}
