/**
 * User profile data-access layer.
 *
 * Two implementations are selected at boot time:
 *
 * - `MockUserService` — edits are kept purely in client state (flag ON).
 * - `HttpUserService` — persists profile edits to the Cohabit API via
 *   `PUT /api/users/{userId}` (flag OFF/default).
 */

import { API_BASE_URL, USE_MOCK_DATA } from "@/services/config"
import type { UserData } from "@/components/ui/user-profile"

/** Wire shape of the Cohabit API user DTO (camelCase JSON). */
export interface UserDto {
  id: string
  firstName: string
  lastName: string
  cellphone: string | null
  email: string | null
  dateOfBirth: string
  gender: string
  bio: string | null
  avatarUrl: string | null
  isOtpVerified: boolean
  addressId: string | null
  timestamp: string
}

interface UpdateUserRequest {
  firstName: string
  lastName: string
  cellphone: string
  email: string
  dateOfBirth: string
  gender: string
  bio: string
  addressId: string
}

export interface UserService {
  updateUser(updated: UserData): Promise<UserData>
}

/** Mock implementation: profile edits live only in the client store. */
class MockUserService implements UserService {
  async updateUser(updated: UserData): Promise<UserData> {
    return updated
  }
}

/** Persists profile edits to the Cohabit API. */
class HttpUserService implements UserService {
  private url(path = ""): string {
    return `${API_BASE_URL}/api/users${path}`
  }

  async updateUser(updated: UserData): Promise<UserData> {
    const users: UserDto[] = await (await fetch(this.url())).json()
    const current = users.find((u) => u.id === updated.id)
    if (!current) throw new Error(`User '${updated.id}' was not found.`)
    if (!current.addressId)
      throw new Error("User has no saved address; profile cannot be updated.")

    const res = await fetch(this.url(`/${updated.id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: updated.firstName,
        lastName: updated.lastName,
        cellphone: updated.cellphone,
        email: updated.email,
        dateOfBirth: updated.dateOfBirth,
        gender: toGenderChar(updated.gender, current.gender),
        bio: updated.bio,
        addressId: current.addressId,
      } satisfies UpdateUserRequest),
    })
    if (!res.ok) throw new Error(`Failed to update profile (${res.status})`)

    const dto: UserDto = await res.json()
    return fromDto(dto)
  }
}

/** Maps the API's `'M'`/`'F'` char to the form's lowercase values. */
function fromDto(dto: UserDto): UserData {
  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    cellphone: dto.cellphone ?? "",
    email: dto.email ?? "",
    dateOfBirth: dto.dateOfBirth,
    gender: dto.gender === "M" ? "male" : dto.gender === "F" ? "female" : "other",
    bio: dto.bio ?? "",
    isOtpVerified: dto.isOtpVerified,
    avatarUrl: dto.avatarUrl ?? undefined,
    timestamp: dto.timestamp,
  }
}

/**
 * Maps the form's gender to the API's `'M'`/`'F'` char. `'other'` is not
 * representable in the API, so the current stored value is kept.
 */
function toGenderChar(gender: string, fallback: string): string {
  const value = gender.toLowerCase()
  if (value.startsWith("m")) return "M"
  if (value.startsWith("f")) return "F"
  return fallback || "M"
}

/** Picks the implementation backing the app at boot time. */
export function createUserService(): UserService {
  return USE_MOCK_DATA ? new MockUserService() : new HttpUserService()
}

export const userService: UserService = createUserService()
