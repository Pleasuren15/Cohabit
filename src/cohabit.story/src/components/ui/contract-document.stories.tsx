import type { Meta, StoryObj } from "@storybook/react"

import { ContractDocument } from "./contract-document"
import type { ContractDraft } from "@/lib/contracts"

const meta = {
  title: "ui/ContractDocument",
  component: ContractDocument,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ContractDocument>

export default meta
type Story = StoryObj<typeof meta>

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
  chores: "Weekly kitchen rotation; bathroom fortnightly.",
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

export const RoommateAgreement: Story = {
  args: { draft: baseDraft },
}

export const ResidentialLease: Story = {
  args: {
    draft: {
      ...baseDraft,
      type: "lease",
      landlordName: "Thabo Mokoena",
      landlordContact: "thabo@example.com",
      tenantName: "Jane Doe",
      roommates: [baseDraft.roommates[0]],
      furnished: true,
    },
  },
}

export const EmptyDraft: Story = {
  args: {
    draft: {
      type: "roommate",
      agreementDate: "2026-08-11",
      propertyAddress: "",
      roommates: [{ id: "r1", name: "", email: "", phone: "", moveInDate: "" }],
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
    },
  },
}
