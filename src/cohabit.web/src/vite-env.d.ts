/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the Cohabit API, e.g. `http://localhost:5001`. Injected by Aspire. */
  readonly VITE_API_URL?: string
  /** Set to "true" to use the bundled mock dataset instead of the live API. */
  readonly VITE_USE_MOCK_DATA?: string
  /** Supabase project URL used for authentication. */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase anon (public) key used for authentication. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
