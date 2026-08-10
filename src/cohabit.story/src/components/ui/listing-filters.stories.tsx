import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { userEvent, within } from "storybook/test"

import { ListingFiltersSheet, type ListingFilters } from "./listing-filters"

const meta = {
  title: "ui/ListingFiltersSheet",
  component: ListingFiltersSheet,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ListingFiltersSheet>

export default meta
type Story = StoryObj<typeof meta>

function FilterSheetDemo({
  initialFilters = {},
}: {
  initialFilters?: ListingFilters
}) {
  const [open, setOpen] = useState(true)
  const [filters, setFilters] = useState<ListingFilters>(initialFilters)
  return (
    <ListingFiltersSheet
      open={open}
      onClose={() => setOpen(false)}
      filters={filters}
      onChange={setFilters}
    />
  )
}

export const Default: Story = {
  args: { open: true, onClose: () => {}, filters: {}, onChange: () => {} },
  render: () => <FilterSheetDemo />,
  // The sheet animates in with framer-motion; wait for it to settle so axe's
  // color-contrast check doesn't sample the panel mid-animation.
  play: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
  },
}

export const WithSelections: Story = {
  args: { open: true, onClose: () => {}, filters: {}, onChange: () => {} },
  render: () => (
    <FilterSheetDemo
      initialFilters={{
        minPrice: 4000,
        maxPrice: 9000,
        minBeds: 2,
        requireAmenities: ["Wi-Fi", "Parking"],
        requireRules: ["No smoking"],
      }}
    />
  ),
  play: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
  },
}

export const Interactive: Story = {
  args: { open: true, onClose: () => {}, filters: {}, onChange: () => {} },
  render: () => <FilterSheetDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Wi-Fi" }))
    await userEvent.click(canvas.getByRole("button", { name: "No smoking" }))
    await new Promise((resolve) => setTimeout(resolve, 500))
  },
}
