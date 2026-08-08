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
    isOtpVerified: Boolean(meta.is_otp_verified ?? false),
    ...(avatarUrl ? { avatarUrl } : {}),
  }
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResult> {
    const client = requireClient()
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return { user: data.user ? toUserData(data.user) : null, emailConfirmationRequired: false }
  },

  async signUp(input: SignUpInput): Promise<AuthResult> {
    const client = requireClient()
    const { data, error } = await client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.name,
          first_name: input.name,
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
    const client = requireClient()
    const { error } = await client.auth.signOut()
    if (error) throw error
  },

  async getSessionUser(): Promise<UserData | null> {
    if (!supabase) return null
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
}
