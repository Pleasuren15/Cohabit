import type { Meta, StoryObj } from "@storybook/react"

import {
  ExpandableProfileCard,
  type Profile,
} from "./expandable-profile-card"

const profile: Profile = {
  name: "Thabo Mokoena",
  role: "Software engineer",
  location: "Parktown, Johannesburg",
  bio: "Quiet engineer working from home. I cook twice a week and keep the flat tidy. Looking for a home with a desk space and decent coffee.",
}

const avatarProfile: Profile = {
  ...profile,
  name: "Aisha Patel",
  role: "Product designer",
  location: "Green Point, Cape Town",
  avatarUrl: "https://picsum.photos/seed/aisha/200/200",
  tags: ["Non-smoker", "Vegetarian", "Early riser"],
}

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
    profile,
  },
}

export const Expanded: Story = {
  args: {
    profile,
    defaultExpanded: true,
  },
}

export const WithAvatarAndTags: Story = {
  args: {
    profile: avatarProfile,
  },
}
