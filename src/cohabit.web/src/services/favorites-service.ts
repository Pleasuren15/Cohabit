/**
 * Favorites (watchlist) data-access layer.
 *
 * Like `listingService`, two implementations are selected at boot time:
 *
 * - `MockFavoritesService` — no-ops; the UI keeps favorites purely in memory
 *   (flag ON).
 * - `HttpFavoritesService` — persists to the Cohabit API under
 *   `/api/users/{userId}/favorites` (flag OFF/default). The signed-in demo
 *   account maps to the deterministic `DEMO_USER_ID` seeded by
 *   `DemoDataSeeder`, so favorites survive restarts.
 */

import { API_BASE_URL, USE_MOCK_DATA } from "@/services/config"
import {
  fromSummary,
  type FeaturedProfile,
  type ListingSummaryDto,
} from "@/services/listing-service"

/** Fixed account the web signs in as in real-API mode (see DemoDataSeeder). */
export const DEMO_USER_ID = "11111111-1111-1111-1111-111111111111"

export interface FavoritesService {
  loadFavorites(): Promise<FeaturedProfile[]>
  addFavorite(listingId: string): Promise<void>
  removeFavorite(listingId: string): Promise<void>
}

/** Mock implementation: favorites live only in the client store. */
class MockFavoritesService implements FavoritesService {
  async loadFavorites(): Promise<FeaturedProfile[]> {
    return []
  }

  async addFavorite(_listingId: string): Promise<void> {}

  async removeFavorite(_listingId: string): Promise<void> {}
}

/** Persists favorites to the Cohabit API. */
class HttpFavoritesService implements FavoritesService {
  private url(path = ""): string {
    return `${API_BASE_URL}/api/users/${DEMO_USER_ID}/favorites${path}`
  }

  async loadFavorites(): Promise<FeaturedProfile[]> {
    const res = await fetch(this.url())
    if (!res.ok) throw new Error(`Failed to load favorites (${res.status})`)
    const items: ListingSummaryDto[] = await res.json()
    return items.map(fromSummary)
  }

  async addFavorite(listingId: string): Promise<void> {
    const res = await fetch(this.url(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    })
    if (!res.ok) throw new Error(`Failed to add favorite (${res.status})`)
  }

  async removeFavorite(listingId: string): Promise<void> {
    const res = await fetch(this.url(`/${listingId}`), {
      method: "DELETE",
    })
    if (!res.ok) throw new Error(`Failed to remove favorite (${res.status})`)
  }
}

/** Picks the implementation backing the app at boot time. */
export function createFavoritesService(): FavoritesService {
  return USE_MOCK_DATA ? new MockFavoritesService() : new HttpFavoritesService()
}

export const favoritesService: FavoritesService = createFavoritesService()
