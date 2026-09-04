import api from "./axiosConfig"

export type Address = {
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

export type UpsertAddressPayload = {
  label?: string
  recipientName: string
  phone: string
  provinceCode: string
  wardCode: string
  detail: string
  isDefault?: boolean
}

export async function fetchAddresses(): Promise<Address[]> {
  const response = await api.get<Address[]>("/addresses")
  return response.data
}

export async function createAddress(payload: UpsertAddressPayload): Promise<Address> {
  const response = await api.post<Address>("/addresses", payload)
  return response.data
}

export async function updateAddress(
  id: string,
  payload: Partial<UpsertAddressPayload>
): Promise<Address> {
  const response = await api.patch<Address>(`/addresses/${id}`, payload)
  return response.data
}

export async function setDefaultAddress(id: string): Promise<Address> {
  const response = await api.patch<Address>(`/addresses/${id}/default`, {})
  return response.data
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/addresses/${id}`)
}
