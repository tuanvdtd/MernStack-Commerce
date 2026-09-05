export type AddressDTO = {
  id: string
  label?: string
  recipientName: string
  phone: string
  provinceCode: string
  provinceName: string
  wardCode: string
  wardName: string
  detail: string
  isDefault: boolean
}

export type UpsertAddressInput = {
  label?: string
  recipientName: string
  phone: string
  provinceCode: string
  wardCode: string
  detail: string
  isDefault?: boolean
}

export type PatchAddressInput = Partial<UpsertAddressInput>
