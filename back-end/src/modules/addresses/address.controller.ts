import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { AddressService } from '~/modules/addresses/address.service'
import type { PatchAddressInput, UpsertAddressInput } from '~/modules/addresses/address.types'

export const AddressController = {
  list: async (req: AuthRequest, res: Response) => {
    const addresses = await AddressService.list(req.user!.id)
    return res.json(addresses)
  },

  create: async (req: AuthRequest, res: Response) => {
    const address = await AddressService.create(req.user!.id, req.body as UpsertAddressInput)
    return res.status(201).json(address)
  },

  update: async (req: AuthRequest, res: Response) => {
    const address = await AddressService.update(
      req.user!.id,
      String(req.params.id),
      req.body as PatchAddressInput,
    )
    return res.json(address)
  },

  setDefault: async (req: AuthRequest, res: Response) => {
    const address = await AddressService.setDefault(req.user!.id, String(req.params.id))
    return res.json(address)
  },

  remove: async (req: AuthRequest, res: Response) => {
    const result = await AddressService.remove(req.user!.id, String(req.params.id))
    return res.json(result)
  },
}
