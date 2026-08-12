export const CONTRACT_TYPE_LABELS = {
  roommate: "Roommate Agreement",
  lease: "Residential Lease",
} as const

export type ContractType = keyof typeof CONTRACT_TYPE_LABELS

export interface Roommate {
  id: string
  name: string
  email: string
  phone: string
  moveInDate: string
}

export type RentSplit = "equal" | "custom"

export type BillsSplit = "equal" | "usage" | "custom"

export interface ContractDraft {
  type: ContractType
  agreementDate: string
  propertyAddress: string

  roommates: Roommate[]
  tenantName: string
  landlordName: string
  landlordContact: string

  termStart: string
  termEnd: string
  monthlyRent: string
  rentSplit: RentSplit
  rentSplits: Record<string, string>
  billsSplit: BillsSplit
  deposit: string
  depositReturnDays: string

  includeUtilities: boolean
  utilityMonthly: string
  includeChores: boolean
  chores: string
  includeGuests: boolean
  guestsNotice: string
  quietHours: string
  includePets: boolean
  petsAllowed: boolean
  smokingAllowed: boolean
  includeSubletting: boolean
  sublettingAllowed: boolean
  annualIncrease: string
  noticePeriod: string
  includeInsurance: boolean
  repairsByLandlord: boolean
  furnished: boolean
  specialTerms: string
}

export interface ContractSection {
  heading: string
  body: string | string[]
}

export const EMPTY_CONTRACT_DRAFT: ContractDraft = {
  type: "roommate",
  agreementDate: new Date().toISOString().slice(0, 10),
  propertyAddress: "",
  roommates: [
    { id: "roommate-1", name: "", email: "", phone: "", moveInDate: "" },
  ],
  tenantName: "",
  landlordName: "",
  landlordContact: "",
  termStart: "",
  termEnd: "",
  monthlyRent: "",
  rentSplit: "equal",
  rentSplits: {},
  billsSplit: "equal",
  deposit: "",
  depositReturnDays: "14",
  includeUtilities: false,
  utilityMonthly: "",
  includeChores: false,
  chores: "",
  includeGuests: true,
  guestsNotice: "",
  quietHours: "22:00",
  includePets: true,
  petsAllowed: false,
  smokingAllowed: false,
  includeSubletting: true,
  sublettingAllowed: false,
  annualIncrease: "8",
  noticePeriod: "30",
  includeInsurance: false,
  repairsByLandlord: true,
  furnished: false,
  specialTerms: "",
}

export function formatContractCurrency(value: string | number): string {
  const n = Number(value)
  if (value === "" || !Number.isFinite(n)) return ""
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatContractDate(iso: string): string {
  if (!iso) return ""
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** Readable label for a per-roommate rent split. */
function splitLabel(split: string): string {
  return split === "usage" ? "usage" : split
}

function partiesSentence(draft: ContractDraft): string {
  const list = draft.roommates.map((r) => r.name.trim()).filter(Boolean)
  if (draft.type === "roommate") {
    return `This Roommate Agreement is entered into on ${formatContractDate(draft.agreementDate) || "______"} between ${list.length > 0 ? list.join(", ") : "____________________ and ____________________"} (collectively "the Roommates").`
  }
  const landlord = draft.landlordName.trim() || "____________________"
  const tenant = draft.tenantName.trim() || "____________________"
  const coTenants =
    list.length > 0 ? ` and ${list.join(", ")}` : " and ____________________"
  return `This Residential Lease Agreement is entered into on ${formatContractDate(draft.agreementDate) || "______"} between ${landlord} ("Landlord") and ${tenant} ("Tenant")${coTenants} ("Tenant").`
}

/** Build the full contract as structured sections (used by both the preview and the PDF). */
export function buildContractSections(draft: ContractDraft): ContractSection[] {
  const sections: ContractSection[] = []
  const rent = formatContractCurrency(draft.monthlyRent)
  const deposit = formatContractCurrency(draft.deposit)
  const address = draft.propertyAddress.trim() || "____________________"
  const termStart =
    formatContractDate(draft.termStart) || "____________________"
  const termEnd = formatContractDate(draft.termEnd) || "____________________"
  const notice = draft.noticePeriod.trim() || "______"
  const roommates = draft.roommates.filter((r) => r.name.trim())
  const names = roommates.map((r) => r.name.trim())

  sections.push({
    heading: "1. Parties & Premises",
    body: partiesSentence(draft),
  })
  sections.push({
    heading: "2. Property",
    body: `The premises subject to this agreement are located at ${address} (the "Premises"). The Premises are provided to be used as a private residence only and for no other purpose.`,
  })
  sections.push({
    heading: "3. Term",
    body:
      draft.type === "roommate"
        ? `The term of this agreement begins on ${termStart} and continues until ${termEnd}. After the end of the term, the agreement continues on a month-to-month basis unless terminated in writing with ${notice} days' notice.`
        : `The lease term begins on ${termStart} and ends on ${termEnd}. After the end of the term, the lease continues on a month-to-month basis unless renewed in writing or terminated with ${notice} days' notice.`,
  })

  if (draft.type === "roommate") {
    sections.push({
      heading: "4. Rent & Cost Sharing",
      body:
        names.length > 1
          ? `The roommates agree to share the total rent of ${rent || "R______"} per month. Rent is split ${draft.rentSplit === "custom" ? "as allocated below" : "equally among all roommates"} and is payable on the first day of each month.`
          : `Rent of ${rent || "R______"} per month is payable on the first day of each month.`,
    })
    if (draft.rentSplit === "custom" && names.length > 1) {
      const lines = names.map((name) => {
        const share = formatContractCurrency(draft.rentSplits?.[name] ?? "")
        return { text: `${name}: ${share || "R______"}` }
      })
      sections.push({
        heading: "4.1 Individual rent shares",
        body: lines.map((l) => l.text),
      })
    }
  } else {
    sections.push({
      heading: "4. Rent",
      body: `The Tenant agrees to pay a monthly rent of ${rent || "R______"} for the Premises. Rent is payable monthly in advance on or before the first day of each month. Payment shall be made by bank transfer or such other method as agreed in writing.`,
    })
    if (draft.annualIncrease) {
      sections.push({
        heading: "4.1 Annual rent increase",
        body: `The rent may be increased by ${draft.annualIncrease}% on each anniversary of the commencement date. The Landlord shall give at least 30 days' written notice of any increase.`,
      })
    }
  }

  if (draft.deposit) {
    sections.push({
      heading: "5. Security Deposit",
      body: `A security deposit of ${deposit} is payable before occupation. The deposit will be held and returned within ${draft.depositReturnDays || "14"} days after the end of the agreement, less any amounts properly due for unpaid rent, damage beyond normal wear and tear, or unpaid utility costs.`,
    })
  }

  if (draft.includeUtilities) {
    sections.push({
      heading: "6. Utilities & Shared Expenses",
      body:
        draft.type === "roommate"
          ? `Monthly utilities of ${formatContractCurrency(draft.utilityMonthly) || "R______"} are shared among the roommates. Utility costs are split ${splitLabel(draft.billsSplit)} and are payable together with each month's rent.`
          : `The following utilities are included in the rent / shared by the parties: ${formatContractCurrency(draft.utilityMonthly) || "as agreed"}. Any utility costs not included in the rent shall be borne by the Tenant and paid by the date shown on the relevant statement.`,
    })
  }

  if (draft.type === "roommate" && draft.includeChores) {
    sections.push({
      heading: "7. Chores & Cleaning",
      body: `The roommates agree to keep the Premises clean and tidy. ${draft.chores.trim() ? `The following cleaning schedule and chore responsibilities apply: ${draft.chores.trim()}.` : "Common areas must be cleaned on a rotating weekly schedule agreed between the roommates."}`,
    })
  }

  if (draft.includeGuests) {
    sections.push({
      heading: "8. Guests & Quiet Hours",
      body: `${draft.quietHours.trim() ? `Quiet hours are between ${draft.quietHours.trim()} and 07:00. ` : ""}Guests are welcome, subject to reasonable notice to the other party and respect for shared spaces. ${draft.guestsNotice.trim() ? `Extended stays require the consent of the other party; ${draft.guestsNotice.trim()}.` : "No guest may stay overnight for more than three consecutive nights without the written consent of the other party."}`,
    })
  }

  if (draft.includePets) {
    sections.push({
      heading: "9. Pets",
      body: draft.petsAllowed
        ? "Pets are permitted on the Premises, provided they are kept under control and do not cause damage or nuisance. Any pet-related damage is the responsibility of the party owning the pet."
        : "No pets are permitted on the Premises without prior written consent of the other party. Any unauthorised pet is a breach of this agreement.",
    })
  }

  sections.push({
    heading: "10. Smoking",
    body: draft.smokingAllowed
      ? "Smoking is permitted on the Premises, provided it does not disturb other occupants."
      : "No smoking is permitted inside the Premises. Smoking is allowed only in designated outdoor areas.",
  })

  if (draft.type === "lease" && draft.furnished) {
    sections.push({
      heading: "11. Furnishing & Inventory",
      body: "The Premises are leased furnished. An inventory of furniture and appliances is attached to and forms part of this agreement. The Tenant is responsible for the reasonable care of all items in the inventory.",
    })
  }

  if (draft.type === "lease" && draft.repairsByLandlord) {
    sections.push({
      heading: "12. Repairs & Maintenance",
      body: "The Landlord is responsible for structural repairs and the maintenance of major systems (plumbing, electrical, roof). The Tenant is responsible for day-to-day upkeep and for promptly reporting any defects. The Tenant shall not make alterations without written consent.",
    })
  }

  if (draft.type === "lease" && draft.includeSubletting) {
    sections.push({
      heading: "13. Subletting & Assignment",
      body: draft.sublettingAllowed
        ? "The Tenant may sublet the Premises or assign this lease with the written consent of the Landlord, which shall not be unreasonably withheld."
        : "The Tenant may not sublet the Premises or assign this lease without the prior written consent of the Landlord.",
    })
  }

  sections.push({
    heading: "14. Termination & Vacating",
    body: `This agreement may be terminated by either party on ${notice} days' written notice. On vacating, the premises must be left in a clean and reasonable state, all keys returned, and any outstanding amounts settled.`,
  })

  if (draft.type === "roommate" && names.length > 1) {
    sections.push({
      heading: "15. Moving Out & Replacement",
      body: "If a roommate wishes to move out before the end of the term, they remain responsible for their share of rent until a replacement roommate is found and approved, or until the end of the notice period, whichever is sooner. A departing roommate forfeits the deposit until all costs are settled.",
    })
  }

  if (draft.includeInsurance) {
    sections.push({
      heading: "16. Insurance",
      body:
        draft.type === "roommate"
          ? "Each roommate is encouraged to carry renter's (contents) insurance covering their personal belongings. No party is liable for loss of or damage to another party's possessions unless caused by that party's negligence."
          : "The Landlord maintains insurance on the structure. The Tenant is encouraged to maintain renter's (contents) insurance for personal belongings. The Tenant is liable for damage to the Premises caused by their negligence.",
    })
  }

  sections.push({
    heading: "17. General Terms",
    body: [
      "This agreement constitutes the entire understanding between the parties and may only be amended in writing, signed by all parties.",
      "If any provision is held to be invalid or unenforceable, the remaining provisions continue in full force and effect.",
      "No waiver of any provision shall be effective unless in writing. Failure to enforce any provision is not a waiver of that provision.",
      "This agreement is governed by the laws of the Republic of South Africa, and the parties consent to the jurisdiction of the relevant Magistrate's Court.",
      "This document is a template produced by Cohabit for general information only. It is not legal advice and does not create a lawyer-client relationship. Parties should have the final agreement reviewed by a qualified legal professional.",
    ],
  })

  if (draft.specialTerms.trim()) {
    sections.push({
      heading: "18. Additional Terms",
      body: draft.specialTerms.trim(),
    })
  }

  sections.push({
    heading: "Signature",
    body: "Signatures: ______________________________  Date: ______________",
  })

  return sections
}
