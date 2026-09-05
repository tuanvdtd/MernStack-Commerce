import type { Province, Ward } from '~/generated/prisma/client'
import type { ProvinceDTO, WardDTO } from '~/modules/locations/location.types'

export function toProvinceDTO(province: Province): ProvinceDTO {
  return { code: province.code, name: province.name }
}

export function toWardDTO(ward: Ward): WardDTO {
  return { code: ward.code, name: ward.name, provinceCode: ward.provinceCode }
}
