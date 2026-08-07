import type { Meta, StoryObj } from "@storybook/react"
import { Check } from "lucide-react"

import { Badge } from "./badge"

const meta = {
  title: "ui/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Badge" },
}

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
}

export const Destructive: Story = {
  args: { variant: "destructive", children: "Destructive" },
}

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
}

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ghost" },
}

export const Link: Story = {
  args: { variant: "link", children: "Link" },
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge variant="secondary">
        <Check />
        Verified
      </Badge>
      <Badge variant="outline">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-sky-500" />
        </span>
        Syncing
      </Badge>
    </div>
  ),
}

export const LiveStatus: Story = {
  render: () => (
    <Badge variant="secondary">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      Live
    </Badge>
  ),
}

export const AsChild: Story = {
  render: () => (
    <Badge asChild>
      <a href="#">Link badge</a>
    </Badge>
  ),
}
