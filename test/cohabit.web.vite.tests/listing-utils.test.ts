import { describe, expect, it } from "vitest"
import {
  filterFeaturedProfiles,
  toggleFavoriteItem,
  matchesListingFilters,
  countActiveFilters,
  filtersAreEmpty,
} from "@/lib/listing-utils"
import { makeProfile, SAMPLE_PROFILES } from "./fixtures"

describe("filterFeaturedProfiles", () => {
  it.each([
    { province: "wc", filter: "all", query: "", expected: 3 },
    { province: "wc", filter: "roommate", query: "", expected: 2 },
    { province: "wc", filter: "rentals", query: "", expected: 1 },
    { province: "kzn", filter: "all", query: "", expected: 1 },
    { province: "kzn", filter: "rentals", query: "", expected: 0 },
    { province: "gp", filter: "rentals", query: "", expected: 1 },
    { province: "mp", filter: "all", query: "", expected: 0 },
  ])(
    "returns $expected profiles for province $province, filter $filter",
    ({ province, filter, query, expected }) => {
      const results = filterFeaturedProfiles(
        SAMPLE_PROFILES,
        province,
        filter,
        query
      )
      expect(results).toHaveLength(expected)
      if (province) {
        expect(results.every((p) => p.province === province)).toBe(true)
      }
      if (filter === "roommate" || filter === "rentals") {
        expect(results.every((p) => p.type === filter)).toBe(true)
      }
    }
  )

  it("treats an empty province as no province filter", () => {
    const results = filterFeaturedProfiles(
      SAMPLE_PROFILES,
      "",
      "rentals",
      ""
    )
    expect(results).toHaveLength(2)
    expect(results.every((p) => p.type === "rentals")).toBe(true)
  })

  it.each([
    { query: "alice", expected: ["Alice Waters"] },
    { query: "SEA POINT", expected: ["Alice Waters"] },
    { query: "sea", expected: ["Alice Waters"] },
    { query: "cape", expected: ["Alice Waters", "Bob Zondo", "Carol Smith"] },
    { query: "durban", expected: ["David Naidoo"] },
    { query: "nonexistent", expected: [] },
    {
      query: "   ",
      expected: [
        "Alice Waters",
        "Bob Zondo",
        "Carol Smith",
        "David Naidoo",
        "Emma van Wyk",
      ],
    },
  ])(
    "search '$query' returns $expected",
    ({ query, expected }) => {
      const results = filterFeaturedProfiles(
        SAMPLE_PROFILES,
        "",
        "all",
        query
      )
      expect(results.map((p) => p.name)).toEqual(expected)
    }
  )

  it("matches search against name or location case-insensitively", () => {
    const byName = filterFeaturedProfiles(SAMPLE_PROFILES, "", "all", "bob")
    expect(byName.map((p) => p.id)).toContain("wc-roommate-2")

    const byLocation = filterFeaturedProfiles(
      SAMPLE_PROFILES,
      "",
      "all",
      "umhlanga"
    )
    expect(byLocation.map((p) => p.id)).toContain("kzn-roommate-1")
  })

  it("combines province, type and search filters", () => {
    const results = filterFeaturedProfiles(
      SAMPLE_PROFILES,
      "wc",
      "roommate",
      "sea"
    )
    expect(results.map((p) => p.id)).toEqual(["wc-roommate-1"])
  })

  it("returns an empty array for an empty dataset", () => {
    expect(filterFeaturedProfiles([], "wc", "all", "")).toEqual([])
  })

  it("applies structured filters", () => {
    const results = filterFeaturedProfiles(
      SAMPLE_PROFILES,
      "wc",
      "all",
      "",
      { maxPrice: 7000 }
    )
    expect(results.map((p) => p.id)).toEqual(["wc-roommate-2"])
  })

  it("does not mutate the input array", () => {
    const copy = [...SAMPLE_PROFILES]
    filterFeaturedProfiles(SAMPLE_PROFILES, "wc", "all", "")
    expect(SAMPLE_PROFILES).toEqual(copy)
  })
})

describe("matchesListingFilters", () => {
  const profile = makeProfile({
    price: 7500,
    beds: 2,
    baths: 1,
    availableFrom: "1 Sep 2026",
    amenities: ["Wi-Fi", "Parking"],
    rules: ["No smoking", "Pets welcome"],
  })

  it("matches everything when no filters are provided", () => {
    expect(matchesListingFilters(profile)).toBe(true)
    expect(matchesListingFilters(profile, {})).toBe(true)
  })

  it("filters by price range", () => {
    expect(matchesListingFilters(profile, { minPrice: 5000, maxPrice: 8000 })).toBe(true)
    expect(matchesListingFilters(profile, { minPrice: 8000 })).toBe(false)
    expect(matchesListingFilters(profile, { maxPrice: 7000 })).toBe(false)
  })

  it("filters by minimum beds and baths", () => {
    expect(matchesListingFilters(profile, { minBeds: 2, minBaths: 1 })).toBe(true)
    expect(matchesListingFilters(profile, { minBeds: 3 })).toBe(false)
    expect(matchesListingFilters(profile, { minBaths: 2 })).toBe(false)
  })

  it("filters by move-in date", () => {
    expect(matchesListingFilters(profile, { moveInBy: "2026-09-01" })).toBe(true)
    expect(matchesListingFilters(profile, { moveInBy: "2026-08-31" })).toBe(false)
    expect(matchesListingFilters(profile, { moveInBy: "2027-01-01" })).toBe(true)
  })

  it("treats 'Immediately' listings as always available", () => {
    const immediate = makeProfile({ availableFrom: "Immediately" })
    expect(matchesListingFilters(immediate, { moveInBy: "2026-01-01" })).toBe(true)
  })

  it("filters by required amenities and rules", () => {
    expect(
      matchesListingFilters(profile, {
        requireAmenities: ["Wi-Fi", "Parking"],
      })
    ).toBe(true)
    expect(matchesListingFilters(profile, { requireAmenities: ["Gym"] })).toBe(
      false
    )
    expect(
      matchesListingFilters(profile, {
        requireRules: ["No smoking", "Pets welcome"],
      })
    ).toBe(true)
    expect(matchesListingFilters(profile, { requireRules: ["No parties"] })).toBe(
      false
    )
  })

  it("ignores empty requirement lists", () => {
    expect(
      matchesListingFilters(profile, { requireAmenities: [], requireRules: [] })
    ).toBe(true)
  })
})

describe("countActiveFilters / filtersAreEmpty", () => {
  it("counts zero for an empty filter set", () => {
    expect(countActiveFilters(undefined)).toBe(0)
    expect(countActiveFilters({})).toBe(0)
  })

  it("counts each populated group once", () => {
    expect(countActiveFilters({ minPrice: 1000 })).toBe(1)
    expect(countActiveFilters({ minBeds: 2, minBaths: 1 })).toBe(2)
    expect(
      countActiveFilters({
        minPrice: 1000,
        minBeds: 2,
        moveInBy: "2026-09-01",
      })
    ).toBe(3)
  })

  it("detects empty filter sets", () => {
    expect(filtersAreEmpty({})).toBe(true)
    expect(filtersAreEmpty({ minPrice: 1000 })).toBe(false)
  })
})

describe("toggleFavoriteItem", () => {
  it.each([
    { id: "existing", expectPresent: false },
    { id: "brand-new", expectPresent: true },
  ])("toggles id '$id' correctly", ({ id, expectPresent }) => {
    const favorites = new Set(["existing"])
    const next = toggleFavoriteItem(favorites, id)
    expect(next.has(id)).toBe(expectPresent)
  })

  it("does not mutate the original set", () => {
    const favorites = new Set(["a", "b"])
    const next = toggleFavoriteItem(favorites, "a")
    expect(favorites.has("a")).toBe(true)
    expect(next.has("a")).toBe(false)
    expect(favorites).not.toBe(next)
  })

  it("supports removing then re-adding the same id", () => {
    const removed = toggleFavoriteItem(new Set(["x"]), "x")
    const reAdded = toggleFavoriteItem(removed, "x")
    expect(reAdded.has("x")).toBe(true)
  })

  it("handles a profile-backed favorite round-trip", () => {
    const id = makeProfile().id
    const added = toggleFavoriteItem(new Set(), id)
    expect(added.has(id)).toBe(true)
    const removed = toggleFavoriteItem(added, id)
    expect(removed.has(id)).toBe(false)
  })
})
