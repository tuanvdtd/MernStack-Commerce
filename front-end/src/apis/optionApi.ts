import type { OptionCatalogEntry } from "~/lib/admin/optionCatalog"
import api from "./axiosConfig"

export async function fetchOptionCatalog(): Promise<OptionCatalogEntry[]> {
  const response = await api.get<OptionCatalogEntry[]>("/options")
  return response.data
}
