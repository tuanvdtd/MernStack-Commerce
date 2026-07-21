import axios from "./axiosConfig"
import type { User } from "~/types/user"

export interface UserProfileResponse {
  id: string
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

/** Map the API response to the User shape in the store. */
export function mapProfileToUser(
  profile: UserProfileResponse,
  existing?: User | null
): User {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    profilePic: profile.avatarUrl,
    role: profile.role,
    token: existing?.token,
  }
}

/** Get the user API error message from the response. */
export function getUserApiError(error: unknown): string {
  const err = error as { response?: { data?: { message?: string } } }
  return err.response?.data?.message ?? "Something went wrong, please try again"
}

/** GET /user/me: current signed-in user profile. */
export async function fetchMyProfile(): Promise<UserProfileResponse> {
  const response = await axios.get<UserProfileResponse>("/user/me")
  return response.data
}

/** PATCH /user/me: partially update the profile. */
export async function patchMyProfile(
  payload: PatchProfilePayload
): Promise<UserProfileResponse> {
  const response = await axios.patch<UserProfileResponse>("/user/me", payload)
  return response.data
}
