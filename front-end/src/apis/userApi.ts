import axios from "./axiosConfig"
import type { User } from "~/types/user"

export interface UserProfileResponse {
  id: number
  email: string
  name: string
  phone?: string
  avatarUrl?: string
  joinAt: string
  role: string
}

export type PatchProfilePayload = {
  name?: string
  phone?: string | null
}

/** Map response API sang User trong store. */
export function mapProfileToUser(
  profile: UserProfileResponse,
  existing?: User | null
): User {
  return {
    id: String(profile.id),
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    profilePic: profile.avatarUrl,
    role: profile.role,
    token: existing?.token,
  }
}

/** Lấy lỗi message từ response API user. */
export function getUserApiError(error: unknown): string {
  const err = error as { response?: { data?: { message?: string } } }
  return err.response?.data?.message ?? "Đã xảy ra lỗi, vui lòng thử lại"
}

/** GET /user/me — profile user đang đăng nhập. */
export async function fetchMyProfile(): Promise<UserProfileResponse> {
  const response = await axios.get<UserProfileResponse>("/user/me")
  return response.data
}

/** PATCH /user/me — cập nhật partial profile. */
export async function patchMyProfile(
  payload: PatchProfilePayload
): Promise<UserProfileResponse> {
  const response = await axios.patch<UserProfileResponse>("/user/me", payload)
  return response.data
}
