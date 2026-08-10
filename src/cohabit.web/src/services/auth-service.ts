/**
 * Auth data-access layer backed by Supabase Auth.
 *
 * Wraps the Supabase client (`supabase.ts`) behind a small surface used by
 * the `Auth3` overlay in `App.tsx`:
 *
 * - `signIn` / `signUp` / `signOut` — credential based email/password auth.
 * - `getSession` / `onAuthStateChange` — session restore + live updates.
 * - `toUserData` — maps a Supabase `User` to the app's `UserData` shape.
 *
 * When Supabase isn't configured (missing `VITE_SUPABASE_URL` / anon key)
 * every call throws a "not configured" error so the UI can surface it.
 */

import { supabase } from "@/services/supabase"
import { API_BASE_URL } from "@/services/config"
import type { UserData } from "@/components/ui/user-profile"
import type { User } from "@supabase/supabase-js"

export interface AuthResult {
  user: UserData | null
  /** True when the provider requires email confirmation before the session is active. */
  emailConfirmationRequired: boolean
}

export interface SignUpInput {
  name: string
  email: string
  password: string
  dateOfBirth: string
  province: string
}

function requireClient() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    )
  }
  return supabase
}

/**
 * Demo sign-in used when Supabase isn't configured (mock mode). Signing in as
 * the demo host lets people experience the landlord journey end-to-end without
 * a real backend. The choice persists so a refresh keeps you signed in.
 */
const MOCK_SIGNED_IN_KEY = "cohabit:mock-signed-in"
const MOCK_USER_ID = "user-1"

function readMockSignedIn(): boolean {
  try {
    return localStorage.getItem(MOCK_SIGNED_IN_KEY) === "true"
  } catch {
    return false
  }
}

function writeMockSignedIn(value: boolean): void {
  try {
    if (value) localStorage.setItem(MOCK_SIGNED_IN_KEY, "true")
    else localStorage.removeItem(MOCK_SIGNED_IN_KEY)
  } catch {
    // ignore storage failures
  }
}

function mockDemoUser(): UserData {
  return {
    id: MOCK_USER_ID,
    firstName: "Thabo",
    lastName: "Mokoena",
    cellphone: "+27 82 123 4567",
    email: "thabo@cohabit.co.za",
    dateOfBirth: "1994-05-12",
    gender: "male",
    bio: "Hosting spaces and finding great tenants across South Africa.",
    address: "Sea Point, Cape Town",
    isOtpVerified: true,
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
    timestamp: "July 2025",
  }
}

/** Maps a Supabase user record to the app's profile shape. */
export function toUserData(user: User): UserData {
  const meta = user.user_metadata ?? {}
  const firstName = String(meta.first_name ?? meta.full_name ?? meta.name ?? "")
  const lastName = String(meta.last_name ?? "")
  const avatarUrl = meta.avatar_url as string | undefined

  return {
    id: user.id,
    firstName,
    lastName,
    cellphone: String(meta.cellphone ?? user.phone ?? ""),
    email: user.email ?? "",
    dateOfBirth: String(meta.date_of_birth ?? "2000-01-01"),
    gender: String(meta.gender ?? "other"),
    bio: String(meta.bio ?? ""),
    address: String(meta.address ?? ""),
    isOtpVerified: Boolean(meta.is_otp_verified ?? false),
    ...(avatarUrl ? { avatarUrl } : {}),
  }
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!supabase) {
      writeMockSignedIn(true)
      return { user: mockDemoUser(), emailConfirmationRequired: false }
    }
    const client = requireClient()
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return { user: data.user ? toUserData(data.user) : null, emailConfirmationRequired: false }
  },

  async signUp(input: SignUpInput): Promise<AuthResult> {
    if (!supabase) {
      writeMockSignedIn(true)
      return { user: mockDemoUser(), emailConfirmationRequired: false }
    }
    const client = requireClient()
    const nameTokens = input.name.trim().split(/\s+/)
    const firstName = nameTokens[0] ?? input.name
    const lastName = nameTokens.slice(1).join(" ")
    const { data, error } = await client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.name,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: input.dateOfBirth,
          province: input.province,
        },
      },
    })
    if (error) throw error

    const user = data.user ?? null
    // When email confirmation is enabled (or the email is already registered)
    // Supabase returns no session — the user must confirm before signing in.
    const emailConfirmationRequired =
      user === null || data.session === null

    return { user: user ? toUserData(user) : null, emailConfirmationRequired }
  },

  async signOut(): Promise<void> {
    if (!supabase) {
      writeMockSignedIn(false)
      return
    }
    const client = requireClient()
    const { error } = await client.auth.signOut()
    if (error) throw error
  },

  /**
   * Persists profile fields (e.g. address) to Supabase user_metadata so they
   * survive reloads and re-logins. Values live in the auth profile rather than
   * the Cohabit API, which has no free-text address column yet.
   */
  async updateProfileMetadata(patch: Record<string, string>): Promise<void> {
    const client = requireClient()
    const { error } = await client.auth.updateUser({ data: patch })
    if (error) throw error
  },

  async getSessionUser(): Promise<UserData | null> {
    if (!supabase) return readMockSignedIn() ? mockDemoUser() : null
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user ?? null
    return user ? toUserData(user) : null
  },

  onAuthStateChange(
    callback: (user: UserData | null) => void
  ): () => void {
    if (!supabase) return () => {}
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? toUserData(session.user) : null)
    })
    return () => subscription.unsubscribe()
  },

  /**
   * Syncs the authenticated user into Cohabit's internal database using their
   * access token. Intended to be called once after login/register. The backend
   * also sends the account's welcome message on first sync.
   */
  async syncUser(): Promise<void> {
    if (!supabase) return
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) throw new Error("No active session to sync.")

    const res = await fetch(`${API_BASE_URL}/api/auth/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    })
    if (!res.ok) throw new Error(`Failed to sync user (${res.status})`)
  },
}
