import type { FeaturedProfile } from "@/lib/listing-types"

export function filterFeaturedProfiles(
  profiles: FeaturedProfile[],
  province: string,
  listingFilter: string,
  searchQuery: string
) {
  const q = searchQuery.trim().toLowerCase()

  return profiles.filter((p) => {
    if (province && p.province !== province) return false
    if (listingFilter === "roommate" && p.type !== "roommate") return false
    if (listingFilter === "rentals" && p.type !== "rentals") return false
    if (q && !`${p.name} ${p.location}`.toLowerCase().includes(q)) return false
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
