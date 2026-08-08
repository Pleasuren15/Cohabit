/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the Cohabit API, e.g. `http://localhost:5001`. Injected by Aspire. */
  readonly VITE_API_URL?: string
  /** Set to "true" to use the bundled mock dataset instead of the live API. */
  readonly VITE_USE_MOCK_DATA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
