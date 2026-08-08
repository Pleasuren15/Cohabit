/**
 * Runtime configuration.
 *
 * - `USE_MOCK_DATA`  — when "true" the app uses the bundled mock dataset
 *   (FEATURED_PROFILES). Otherwise it calls the live API. Set via
 *   `VITE_USE_MOCK_DATA=true` in `.env` / the shell. Off by default.
 *
 * - `API_BASE_URL`   — origin of the Cohabit API, e.g. `http://localhost:5001`.
 *   When running through Aspire this is injected automatically. If unset the
 *   app calls the relative `/api/*` path, which the Vite dev server proxies
 *   (see vite.config.ts -> server.proxy).
 */
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true"

export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(
  /\/+$/,
  ""
)
