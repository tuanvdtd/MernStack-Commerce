import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { OptionService } from '~/modules/options/option.service'

export const OptionController = {
  list: async (_req: AuthRequest, res: Response) => {
    const catalog = await OptionService.listCatalog()
    return res.json(catalog)
  },
}
