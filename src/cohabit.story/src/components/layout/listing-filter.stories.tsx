import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"

import { ListingFilter } from "./listing-filter"

const meta = {
  title: "layout/ListingFilter",
  component: ListingFilter,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    value: "all",
    onChange: () => {},
  },
} satisfies Meta<typeof ListingFilter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("all")

    return (
      <div className="flex w-full max-w-sm flex-col gap-6 p-8">
        <ListingFilter value={value} onChange={setValue} />
        <p className="text-sm text-muted-foreground">
          Controlled value:{" "}
          <span className="font-medium text-foreground">{value}</span>
        </p>
      </div>
    )
  },
}
