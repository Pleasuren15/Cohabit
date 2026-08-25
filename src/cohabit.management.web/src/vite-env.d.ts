/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the Cohabit API, e.g. `http://localhost:5001`. */
  readonly VITE_API_URL?: string
  /** Supabase project URL used for authentication. */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase anon (public) key used for authentication. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
