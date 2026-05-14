import { omit } from 'lodash'
import { ApiError } from '~/core/http/ApiError'
import { UserRepo } from '~/modules/users/user.repo'
import { hashPassword, verifyPassword } from '~/utils/password'
import { BrevoProvider } from '~/core/mail/BrevoProdiver'

export const UserService = {
  async register(email: string, name: string, password: string) {
    const existed = await UserRepo.findByEmail(email)
    if (existed) throw new ApiError(409, 'Email already exists')
    const passwordHash = await hashPassword(password)
    const user = await UserRepo.create({
      email,
      name,
      password: passwordHash
    })
    // sau khi tạo user thì gửi email thông báo
    const htmlContent = `
    <h1>Welcome to our website</h1>
    <p>Your account has been created successfully</p>
    `
    //  BrevoProvider.sendEmail(email, 'Welcome to our website', htmlContent)
    return omit(user, ['password'])
  },

  async login(email: string, password: string) {
    const user = await UserRepo.findByEmail(email)
    console.log(user);
    if (!user) throw new ApiError(404, 'User not found')
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) throw new ApiError(401, 'Invalid password')
    // sử dụng jwt để tạo token
    return user
  },

  async list() {
    return UserRepo.list()
  }
}
