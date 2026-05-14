// import type { ObjectId } from 'mongodb'

// export const UserRole = {
//   SUPER_ADMIN: 'super-admin',
//   MODERATOR: 'moderator',
//   USER: 'user',
//   GUEST: 'guest'
// }
// export type UserRole = typeof UserRole[keyof typeof UserRole]

// export type User = {
//   _id?: ObjectId
//   email: string
//   username: string
//   password_hash: string
//   role: UserRole
//   createdAt?: Date
//   updatedAt?: Date
// }

export type User = {
  id?: number
  email: string
  name: string
  password: string
  role: string[]
  joinAt?: Date
  phone?: string
  avatarUrl?: string
  googleId?: string
}

export type RegisterUserDto = Pick<User, 'email' | 'name' | 'password'>
