import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"

import { PinItem } from "./pin-item"

const meta = {
  title: "ui/PinItem",
  component: PinItem,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof PinItem>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {
    title: "Bright room in Observatory",
    subtitle: "Shared with 2 housemates",
    address: "12 Lower Main Road, Observatory, Cape Town",
    price: "R 6 500",
  },
}

export const WithImage: Story = {
  args: {
    title: "Garden flat in Rosebank",
    subtitle: "Furnished studio",
    address: "18 Jellicoe Avenue, Rosebank, Johannesburg",
    price: "R 8 200",
    imageSrc: "https://picsum.photos/seed/flat/112/112",
  },
}

export const Pinned: Story = {
  args: {
    title: "Sunny loft in Umhlanga",
    subtitle: "Private bathroom",
    address: "4 Lighthouse Road, Umhlanga, Durban",
    price: "R 9 800",
    imageSrc: "https://picsum.photos/seed/loft/112/112",
    pinned: true,
  },
}

export const Interactive: Story = {
  args: {
    title: "Cosy room in Woodstock",
  },
  render: () => {
    const [pinned, setPinned] = useState(false)
    return (
      <PinItem
        title="Cosy room in Woodstock"
        subtitle="Female housemates only"
        address="7 Albert Road, Woodstock, Cape Town"
        price="R 5 900"
        pinned={pinned}
        onPinToggle={() => setPinned((p) => !p)}
      />
    )
  },
}
