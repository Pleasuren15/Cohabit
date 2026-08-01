import { describe, expect, it } from "vitest"
import { createElement } from "react"
import { AMENITIES, AMENITY_NAMES, amenityByName } from "@/lib/amenities"

describe("AMENITIES data integrity", () => {
  it("has at least one amenity", () => {
    expect(AMENITIES.length).toBeGreaterThan(0)
  })

  it("has unique, non-empty names", () => {
    const names = AMENITIES.map((a) => a.name)
    expect(new Set(names).size).toBe(names.length)
    for (const name of names) {
      expect(name.trim()).not.toHaveLength(0)
    }
  })

  it("every amenity ships a renderable icon component", () => {
    for (const amenity of AMENITIES) {
      expect(amenity.icon, amenity.name).toBeDefined()
      expect(() => createElement(amenity.icon), amenity.name).not.toThrow()
    }
  })

  it("AMENITY_NAMES mirrors AMENITIES exactly", () => {
    expect(AMENITY_NAMES).toEqual(AMENITIES.map((a) => a.name))
  })
})

describe("amenityByName", () => {
  it.each(AMENITIES.map((a) => [a.name, a.name]))(
    "round-trips %s -> %s",
    (name) => {
      expect(amenityByName(name)?.name).toBe(name)
    }
  )

  it.each(["", "Pool", "Wine Cellar", "Guesthouse", "Parking lot"])(
    "returns undefined for unknown amenity '%s'",
    (name) => {
      expect(amenityByName(name)).toBeUndefined()
    }
  )

  it("is case sensitive", () => {
    expect(amenityByName("wi-fi")).toBeUndefined()
    expect(amenityByName("Wi-Fi")).toBeDefined()
  })
})
