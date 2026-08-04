import type { Meta, StoryObj } from "@storybook/react"

import { ViewOnMap } from "./view-on-map"

const meta = {
  title: "ui/ViewOnMap",
  component: ViewOnMap,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ViewOnMap>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    address: "12 Kloof Street, Gardens, Cape Town",
  },
}

export const WithCustomLabel: Story = {
  args: {
    label: "Open in Maps",
    address: "15 Tyrwhitt Avenue, Rosebank, Johannesburg",
  },
}

export const Disabled: Story = {
  args: {
    label: "View on Map",
    address: "4 Lighthouse Road, Umhlanga, Durban",
    disabled: true,
  },
}
