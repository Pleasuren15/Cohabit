import type { Meta, StoryObj } from "@storybook/react"

import {
  ExpandableProfileCard,
} from "./expandable-profile-card"

const meta = {
  title: "ui/ExpandableProfileCard",
  component: ExpandableProfileCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ExpandableProfileCard>

export default meta
type Story = StoryObj<typeof meta>

export const Collapsed: Story = {
  args: {
    name: "Thabo Mokoena",
    location: "Parktown, Johannesburg",
    bio: "Quiet engineer working from home. I cook twice a week and keep the flat tidy. Looking for a home with a desk space and decent coffee.",
    photoCount: 6,
  },
}

export const Expanded: Story = {
  args: {
    name: "Thabo Mokoena",
    location: "Parktown, Johannesburg",
    bio: "Quiet engineer working from home. I cook twice a week and keep the flat tidy. Looking for a home with a desk space and decent coffee.",
    mapAddress: "7 Artillery Road, Parktown, Johannesburg",
    photoCount: 6,
    verified: ["phone", "email"],
  },
}

export const WithPriceAndVerified: Story = {
  args: {
    name: "Aisha Patel",
    location: "Green Point, Cape Town",
    bio: "Product designer who loves the sea air and weekend markets. Clean, friendly and always up for a braai on the balcony.",
    mapAddress: "12 Prestwich Street, Green Point, Cape Town",
    price: 7200,
    photoCount: 8,
    verified: ["phone", "email", "id"],
    isFavorited: true,
  },
}

export const Featured: Story = {
  args: {
    name: "Lerato Nkosi",
    location: "Rosebank, Johannesburg",
    bio: "Accountant relocating from Durban. Early riser, gym four times a week, and I bring the coffee machine.",
    price: 9500,
    photoCount: 10,
    featured: true,
    verified: ["phone", "email", "id"],
  },
}