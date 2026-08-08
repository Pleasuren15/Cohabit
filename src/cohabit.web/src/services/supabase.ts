/**
 * Supabase client singleton.
 *
 * Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the
 * environment. When either is missing the client is `null` — the app keeps
 * working, but auth operations throw a helpful "not configured" error.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined

export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null
