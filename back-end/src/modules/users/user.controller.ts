import { Request, Response } from 'express'

import { UserService } from '~/modules/users/user.service'

export const UserController = {
  register: async (req: Request, res: Response) => {
    const { email, name, password } = req.body
    const user = await UserService.register(email, name, password)
    return res.status(201).json(user)
  },

  login: async (req: Request, res: Response) => {
    const { email, password } = req.body
    const user = await UserService.login(email, password)
    return res.status(200).json(user)
  },

  list: async (_req: Request, res: Response) => {
    const users = await UserService.list()
    res.json(users)
  },
}
