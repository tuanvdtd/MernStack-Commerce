import { Request, Response } from 'express'

import { LocationService } from '~/modules/locations/location.service'

export const LocationController = {
  listProvinces: async (_req: Request, res: Response) => {
    const provinces = await LocationService.listProvinces()
    return res.json(provinces)
  },

  listWards: async (req: Request, res: Response) => {
    const wards = await LocationService.listWards(String(req.params.code))
    return res.json(wards)
  },
}
