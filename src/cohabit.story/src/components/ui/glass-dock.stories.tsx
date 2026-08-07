import type { Meta, StoryObj } from "@storybook/react"
import { Home, Search, MapPin, Heart, User } from "lucide-react"

import { GlassDock } from "./glass-dock"

const dockItems = [
  { title: "Home", icon: Home },
  { title: "Search", icon: Search },
  { title: "MapPin", icon: MapPin },
  { title: "Heart", icon: Heart },
  { title: "User", icon: User },
]

const meta = {
  title: "ui/GlassDock",
  component: GlassDock,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    items: dockItems,
  },
} satisfies Meta<typeof GlassDock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex h-64 w-full items-end justify-center p-8">
      <GlassDock items={dockItems} />
    </div>
  ),
}

export const WithActiveItem: Story = {
  render: () => (
    <div className="flex h-64 w-full items-end justify-center p-8">
      <GlassDock items={dockItems} activeTitle="Search" />
    </div>
  ),
}

export const WithLabels: Story = {
  render: () => (
    <div className="flex h-64 w-full items-end justify-center p-8">
      <GlassDock items={dockItems} showLabels />
    </div>
  ),
}
