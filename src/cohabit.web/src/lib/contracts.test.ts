import { describe, expect, it } from "vitest"
import {
  buildContractSections,
  formatContractCurrency,
  formatContractDate,
  type ContractDraft,
} from "@/lib/contracts"

const baseDraft: ContractDraft = {
  type: "roommate",
  agreementDate: "2026-08-11",
  propertyAddress: "12 Long Street, Cape Town",
  roommates: [
    {
      id: "r1",
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "071 000 0000",
      moveInDate: "2026-09-01",
    },
    {
      id: "r2",
      name: "John Smith",
      email: "john@example.com",
      phone: "071 111 1111",
      moveInDate: "2026-09-01",
    },
  ],
  tenantName: "",
  landlordName: "",
  landlordContact: "",
  termStart: "2026-09-01",
  termEnd: "2027-08-31",
  monthlyRent: "9000",
  rentSplit: "equal",
  rentSplits: {},
  billsSplit: "equal",
  deposit: "18000",
  depositReturnDays: "14",
  includeUtilities: true,
  utilityMonthly: "1200",
  includeChores: true,
  chores: "Weekly kitchen rotation.",
  includeGuests: true,
  guestsNotice: "48 hours notice for overnight guests",
  quietHours: "22:00",
  includePets: true,
  petsAllowed: false,
  smokingAllowed: false,
  includeSubletting: true,
  sublettingAllowed: false,
  annualIncrease: "8",
  noticePeriod: "30",
  includeInsurance: true,
  repairsByLandlord: true,
  furnished: false,
  specialTerms: "One parking bay included.",
}

/** en-ZA currency formatting uses non-breaking spaces; normalise them for assertions. */
function normalized(...parts: (string | string[])[]): string {
  return parts
    .flat()
    .join(" ")
    .replace(/\u00A0/g, "")
}

describe("buildContractSections", () => {
  it("builds a roommate agreement naming both parties", () => {
    const sections = buildContractSections(baseDraft)
    const joined = sections.map((s) => s.heading).join(" ")

    expect(joined).toContain("1. Parties & Premises")
    expect(joined).toContain("4. Rent & Cost Sharing")
    expect(joined).toContain("7. Chores & Cleaning")
    expect(joined).toContain("15. Moving Out & Replacement")

    const parties = sections[0].body as string
    expect(parties).toContain("Jane Doe")
    expect(parties).toContain("John Smith")
    expect(parties).toContain("Roommate Agreement")
  })

  it("renders currency in South African rand format", () => {
    expect(formatContractCurrency("9000").replace(/\u00A0/g, "")).toBe(
      "R9 000".replace(" ", "")
    )
  })

  it("formats dates as day month year", () => {
    expect(formatContractDate("2026-08-11")).toBe("11 August 2026")
    expect(formatContractDate("")).toBe("")
  })

  it("reflects the chosen roommate options in the clauses", () => {
    const sections = buildContractSections(baseDraft)
    const text = normalized(sections.map((s) => s.body).flat())

    expect(text).toContain("R18000")
    expect(text).toContain("48 hours notice")
    expect(text).toContain("No pets are permitted")
    expect(text).toContain("No smoking is permitted")
    expect(text).toContain("One parking bay included")
    expect(text).toContain("Republic of South Africa")
  })

  it("includes custom rent shares when rentSplit is custom", () => {
    const draft: ContractDraft = {
      ...baseDraft,
      rentSplit: "custom",
      rentSplits: { "Jane Doe": "5000", "John Smith": "4000" },
    }
    const sections = buildContractSections(draft)
    const text = normalized(sections.map((s) => s.body).flat())

    expect(text).toContain("Jane Doe: R5000")
    expect(text).toContain("John Smith: R4000")
  })

  it("builds a residential lease naming landlord and tenant", () => {
    const draft: ContractDraft = {
      ...baseDraft,
      type: "lease",
      landlordName: "Thabo Mokoena",
      landlordContact: "thabo@example.com",
      tenantName: "Jane Doe",
      roommates: [baseDraft.roommates[0]],
      furnished: true,
    }
    const sections = buildContractSections(draft)
    const joined = sections.map((s) => s.heading).join(" ")

    expect(joined).toContain("4. Rent")
    expect(joined).toContain("4.1 Annual rent increase")
    expect(joined).toContain("11. Furnishing & Inventory")
    expect(joined).toContain("12. Repairs & Maintenance")
    expect(joined).toContain("13. Subletting & Assignment")

    const parties = sections[0].body as string
    expect(parties).toContain("Thabo Mokoena")
    expect(parties).toContain('("Landlord")')
    expect(parties).toContain('("Tenant")')
  })
})
