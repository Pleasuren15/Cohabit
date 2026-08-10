import type { FeaturedProfile } from "@/lib/listing-types"

/** Structured search filters used by the Home feed and the filters sheet. */
export interface ListingFilters {
  minPrice?: number
  maxPrice?: number
  minBeds?: number
  minBaths?: number
  /** ISO date `YYYY-MM-DD` — only listings available by this date. */
  moveInBy?: string
  /** Amenity names the listing must include. */
  requireAmenities?: string[]
  /** Home-rule names the listing must include. */
  requireRules?: string[]
}

const KEY_AMENITIES = ["Wi-Fi", "Parking", "Furnished", "Security"]
const KEY_RULES = ["No smoking", "Pets welcome", "No pets", "Guests welcome"]

/** Filter chips offered in the "better search" sheet. */
export const SEARCHABLE_AMENITIES = KEY_AMENITIES
export const SEARCHABLE_RULES = KEY_RULES

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

/** `"2026-09-01"` -> UTC Date. */
export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return Number.isNaN(date.getTime()) ? null : date
}

/** `"1 Sep 2026"` / `"15 Aug 2026"` -> local Date. */
export function parseDisplayDate(value: string): Date | null {
  const parsed = new Date(`${value.trim()} 12:00:00`)
  if (Number.isNaN(parsed.getTime())) return null
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

/** True when a listing is available by the given date. */
export function listingAvailableBy(p: FeaturedProfile, deadline: Date): boolean {
  const raw = p.availableFrom.trim().toLowerCase()
  if (raw === "immediately" || raw === "flexible" || raw === "available now") return true

  const date =
    parseIsoDate(p.availableFrom) ?? parseDisplayDate(p.availableFrom) ?? null
  // Unknown format — keep the listing rather than wrongly filtering it out.
  if (!date) return true
  return date.getTime() <= deadline.getTime()
}

function hasAll(
  values: string[] | undefined,
  required: string[] | undefined
): boolean {
  if (!required || required.length === 0) return true
  const pool = (values ?? []).map(normalizeKey).join(" ")
  return required.every((item) => pool.includes(normalizeKey(item)))
}

/** True when a profile satisfies every configured filter. */
export function matchesListingFilters(
  p: FeaturedProfile,
  filters?: ListingFilters
): boolean {
  if (!filters) return true
  if (filters.minPrice != null && p.price < filters.minPrice) return false
  if (filters.maxPrice != null && p.price > filters.maxPrice) return false
  if (filters.minBeds != null && p.beds < filters.minBeds) return false
  if (filters.minBaths != null && p.baths < filters.minBaths) return false
  if (filters.moveInBy) {
    const deadline = parseIsoDate(filters.moveInBy)
    if (deadline && !listingAvailableBy(p, deadline)) return false
  }
  if (!hasAll(p.amenities, filters.requireAmenities)) return false
  if (!hasAll(p.rules, filters.requireRules)) return false
  return true
}

/** Count of active (non-default) filters, used for the sheet's badge. */
export function countActiveFilters(filters?: ListingFilters): number {
  if (!filters) return 0
  let count = 0
  if (filters.minPrice != null || filters.maxPrice != null) count++
  if (filters.minBeds != null) count++
  if (filters.minBaths != null) count++
  if (filters.moveInBy) count++
  if (filters.requireAmenities?.length) count++
  if (filters.requireRules?.length) count++
  return count
}

/** True when the given object has no active filters (used for "Clear all"). */
export function filtersAreEmpty(filters?: ListingFilters): boolean {
  return countActiveFilters(filters) === 0
}

export function filterFeaturedProfiles(
  profiles: FeaturedProfile[],
  province: string,
  listingFilter: string,
  searchQuery: string,
  filters?: ListingFilters
) {
  const q = searchQuery.trim().toLowerCase()

  return profiles.filter((p) => {
    if (province && p.province !== province) return false
    if (listingFilter === "roommate" && p.type !== "roommate") return false
    if (listingFilter === "rentals" && p.type !== "rentals") return false
    if (q && !`${p.name} ${p.location}`.toLowerCase().includes(q)) return false
    if (!matchesListingFilters(p, filters)) return false
    return true
  })
}

export function toggleFavoriteItem(currentFavorites: Set<string>, id: string) {
  const next = new Set(currentFavorites)

  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }

  return next
}
