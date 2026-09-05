import api from "./axiosConfig"

export type Province = { code: string; name: string }
export type Ward = { code: string; name: string; provinceCode: string }

export async function fetchProvinces(): Promise<Province[]> {
  const response = await api.get<Province[]>("/locations/provinces")
  return response.data
}

export async function fetchWards(provinceCode: string): Promise<Ward[]> {
  const response = await api.get<Ward[]>(`/locations/provinces/${provinceCode}/wards`)
  return response.data
}
