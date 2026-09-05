import { ApiError } from '~/core/http/ApiError'
import { toAddressDTO } from '~/modules/addresses/address.mapper'
import { AddressRepo } from '~/modules/addresses/address.repo'
import { VN_PHONE_REGEX } from '~/modules/addresses/address.validation'
import { LocationRepo } from '~/modules/locations/location.repo'
import type { PatchAddressInput, UpsertAddressInput } from '~/modules/addresses/address.types'

function assertValidPhone(phone: string) {
  if (!VN_PHONE_REGEX.test(phone)) {
    throw ApiError.BadRequest('Invalid Vietnamese phone number', undefined, 'VALIDATION_ERROR')
  }
}

async function resolveLocation(provinceCode: string, wardCode: string) {
  const ward = await LocationRepo.findWard(wardCode)
  if (!ward || ward.provinceCode !== provinceCode) {
    throw ApiError.NotFound('Province or ward not found', undefined, 'LOCATION_NOT_FOUND')
  }
  const province = await LocationRepo.findProvince(provinceCode)
  if (!province) {
    throw ApiError.NotFound('Province or ward not found', undefined, 'LOCATION_NOT_FOUND')
  }
  return { provinceName: province.name, wardName: ward.name }
}

export const AddressService = {
  async list(userId: string) {
    const addresses = await AddressRepo.listByUser(userId)
    return addresses.map(toAddressDTO)
  },

  async create(userId: string, input: UpsertAddressInput) {
    assertValidPhone(input.phone)
    const { provinceName, wardName } = await resolveLocation(input.provinceCode, input.wardCode)
    const existingCount = await AddressRepo.countByUser(userId)
    const makeDefault = existingCount === 0 || Boolean(input.isDefault)

    const address = await AddressRepo.create(
      userId,
      {
        label: input.label,
        recipientName: input.recipientName,
        phone: input.phone,
        provinceCode: input.provinceCode,
        provinceName,
        wardCode: input.wardCode,
        wardName,
        detail: input.detail,
      },
      makeDefault,
    )
    return toAddressDTO(address)
  },

  async update(userId: string, id: string, input: PatchAddressInput) {
    const existing = await AddressRepo.findByIdForUser(id, userId)
    if (!existing) {
      throw ApiError.NotFound('Address not found', undefined, 'ADDRESS_NOT_FOUND')
    }

    if (input.phone) assertValidPhone(input.phone)

    let locationFields: { provinceName: string; wardName: string } | undefined
    if (input.provinceCode || input.wardCode) {
      const provinceCode = input.provinceCode ?? existing.provinceCode
      const wardCode = input.wardCode ?? existing.wardCode
      locationFields = await resolveLocation(provinceCode, wardCode)
    }

    const address = await AddressRepo.update(
      id,
      userId,
      {
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.recipientName ? { recipientName: input.recipientName } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.provinceCode ? { provinceCode: input.provinceCode } : {}),
        ...(input.wardCode ? { wardCode: input.wardCode } : {}),
        ...(input.detail ? { detail: input.detail } : {}),
        ...(locationFields ?? {}),
      },
      input.isDefault,
    )
    return toAddressDTO(address)
  },

  async setDefault(userId: string, id: string) {
    const existing = await AddressRepo.findByIdForUser(id, userId)
    if (!existing) {
      throw ApiError.NotFound('Address not found', undefined, 'ADDRESS_NOT_FOUND')
    }
    const address = await AddressRepo.setAsDefault(id, userId)
    return toAddressDTO(address)
  },

  async remove(userId: string, id: string) {
    const existing = await AddressRepo.findByIdForUser(id, userId)
    if (!existing) {
      throw ApiError.NotFound('Address not found', undefined, 'ADDRESS_NOT_FOUND')
    }
    await AddressRepo.delete(id, userId)
    return { id }
  },
}
