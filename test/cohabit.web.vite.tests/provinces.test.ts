import { describe, expect, it } from "vitest"
import { PROVINCES } from "@/lib/provinces"
import { PROVINCE_SHAPES } from "@/lib/province-shapes"

const OFFICIAL_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
]

describe("PROVINCES data integrity", () => {
  it("has exactly the nine official South African provinces", () => {
    expect(Object.keys(PROVINCES)).toHaveLength(9)
    expect(Object.values(PROVINCES).sort()).toEqual([...OFFICIAL_PROVINCES].sort())
  })

  it.each(Object.entries(PROVINCES))(
    "maps code '%s' to a non-empty name '%s'",
    (code, name) => {
      expect(code).toMatch(/^[a-z]{2,3}$/)
      expect(name.trim()).not.toHaveLength(0)
    }
  )

  it("every province code has a matching shape asset", () => {
    for (const code of Object.keys(PROVINCES)) {
      expect(PROVINCE_SHAPES[code], code).toBeTruthy()
    }
  })

  it("every shape asset maps back to a known province", () => {
    for (const code of Object.keys(PROVINCE_SHAPES)) {
      expect(PROVINCES[code], code).toBeTruthy()
    }
  })
})
