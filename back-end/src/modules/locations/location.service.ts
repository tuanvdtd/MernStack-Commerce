import { ApiError } from '~/core/http/ApiError'
import { toProvinceDTO, toWardDTO } from '~/modules/locations/location.mapper'
import { LocationRepo } from '~/modules/locations/location.repo'

export const LocationService = {
  async listProvinces() {
    const provinces = await LocationRepo.listProvinces()
    return provinces.map(toProvinceDTO)
  },

  async listWards(provinceCode: string) {
    const province = await LocationRepo.findProvince(provinceCode)
    if (!province) {
      throw ApiError.NotFound('Province not found', undefined, 'LOCATION_NOT_FOUND')
    }
    const wards = await LocationRepo.listWardsByProvince(provinceCode)
    return wards.map(toWardDTO)
  },
}
