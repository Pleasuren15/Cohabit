import { describe, expect, it } from "vitest"
import { FEATURED_PROFILES } from "@/App"
import { filterFeaturedProfiles } from "@/lib/listing-utils"
import { PROVINCES } from "@/lib/provinces"
import { AMENITIES } from "@/lib/amenities"

const VALID_TYPES = ["roommate", "rentals"]
const VALID_VERIFICATIONS = ["phone", "email", "id", "credit"]

describe("FEATURED_PROFILES data integrity", () => {
  it("has unique profile ids", () => {
    const ids = FEATURED_PROFILES.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("every listing references a non-empty owner user id", () => {
    for (const profile of FEATURED_PROFILES) {
      expect(profile.userId.trim(), profile.id).not.toHaveLength(0)
    }
  })

  it("references only known provinces", () => {
    for (const profile of FEATURED_PROFILES) {
      expect(PROVINCES[profile.province], profile.id).toBeTruthy()
    }
  })

  it("uses only valid listing types", () => {
    for (const profile of FEATURED_PROFILES) {
      expect(VALID_TYPES, profile.id).toContain(profile.type)
    }
  })

  it("uses only valid verification methods", () => {
    for (const profile of FEATURED_PROFILES) {
      for (const verification of profile.verified) {
        expect(VALID_VERIFICATIONS, profile.id).toContain(verification)
      }
    }
  })

  it("has positive prices, deposits and room counts", () => {
    for (const profile of FEATURED_PROFILES) {
      expect(profile.price, profile.id).toBeGreaterThan(0)
      expect(profile.deposit, profile.id).toBeGreaterThan(0)
      expect(profile.beds, profile.id).toBeGreaterThanOrEqual(1)
      expect(profile.baths, profile.id).toBeGreaterThanOrEqual(1)
    }
  })

  it("has non-empty core fields for rendering", () => {
    for (const profile of FEATURED_PROFILES) {
      expect(profile.name.trim(), profile.id).not.toHaveLength(0)
      expect(profile.location.trim(), profile.id).not.toHaveLength(0)
      expect(profile.mapAddress.trim(), profile.id).not.toHaveLength(0)
      expect(profile.availableFrom.trim(), profile.id).not.toHaveLength(0)
    }
  })

  it("references only known amenities", () => {
    const known = new Set(AMENITIES.map((a) => a.name))
    for (const profile of FEATURED_PROFILES) {
      for (const amenity of profile.amenities ?? []) {
        expect(known.has(amenity), `${profile.id} -> ${amenity}`).toBe(true)
      }
    }
  })

  it("has at least one featured listing", () => {
    expect(FEATURED_PROFILES.some((p) => p.featured === true)).toBe(true)
  })

  it("features listings across more than one province", () => {
    const featuredProvinces = new Set(
      FEATURED_PROFILES.filter((p) => p.featured).map((p) => p.province)
    )
    expect(featuredProvinces.size).toBeGreaterThan(1)
  })
})

describe("FEATURED_PROFILES filtering invariants", () => {
  it("filtering by province returns exactly the matching profiles", () => {
    for (const province of Object.keys(PROVINCES)) {
      const expected = FEATURED_PROFILES.filter(
        (p) => p.province === province
      ).length
      const results = filterFeaturedProfiles(
        FEATURED_PROFILES,
        province,
        "all",
        ""
      )
      expect(results, province).toHaveLength(expected)
    }
  })

  it("filtering by listing type never returns other types", () => {
    for (const type of VALID_TYPES) {
      const results = filterFeaturedProfiles(
        FEATURED_PROFILES,
        "",
        type,
        ""
      )
      expect(results.every((p) => p.type === type)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
    }
  })

  it("a non-matching search returns an empty list", () => {
    const results = filterFeaturedProfiles(
      FEATURED_PROFILES,
      "",
      "all",
      "zzzz-not-a-real-search-term"
    )
    expect(results).toHaveLength(0)
  })

  it("has roommate and rentals listings available to show", () => {
    const roommate = FEATURED_PROFILES.filter(
      (p) => p.type === "roommate"
    ).length
    const rentals = FEATURED_PROFILES.filter(
      (p) => p.type === "rentals"
    ).length
    expect(roommate).toBeGreaterThan(0)
    expect(rentals).toBeGreaterThan(0)
  })
})
