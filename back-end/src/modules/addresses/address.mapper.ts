import type { Address } from '~/generated/prisma/client'
import type { AddressDTO } from '~/modules/addresses/address.types'

export function toAddressDTO(address: Address): AddressDTO {
  return {
    id: address.id,
    label: address.label ?? undefined,
    recipientName: address.recipientName,
    phone: address.phone,
    provinceCode: address.provinceCode,
    provinceName: address.provinceName,
    wardCode: address.wardCode,
    wardName: address.wardName,
    detail: address.detail,
    isDefault: address.isDefault,
  }
}
