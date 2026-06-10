import type { AdminCategory } from "~/types/admin/index"
import api from "./axiosConfig"

export async function fetchCategories(): Promise<AdminCategory[]> {
  const response = await api.get<AdminCategory[]>("/categories")
  return response.data
}

export async function createCategory(name: string): Promise<AdminCategory> {
  const response = await api.post<AdminCategory>("/categories", { name })
  return response.data
}
