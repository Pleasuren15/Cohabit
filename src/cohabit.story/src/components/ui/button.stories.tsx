import type { Meta, StoryObj } from "@storybook/react"
import { Plus } from "lucide-react"

import { Button } from "./button"
import { TwinOrbit } from "@/components/loading-ui/twin-orbit"

const meta = {
  title: "ui/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Button" },
}

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
}

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
}

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ghost" },
}

export const Destructive: Story = {
  args: { variant: "destructive", children: "Destructive" },
}

export const Link: Story = {
  args: { variant: "link", children: "Link" },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Button>
      <Plus />
      Add expense
    </Button>
  ),
}

export const IconButton: Story = {
  render: () => (
    <Button size="icon" aria-label="Add">
      <Plus />
    </Button>
  ),
}

export const Loading: Story = {
  render: () => (
    <Button disabled>
      <TwinOrbit className="size-4 text-current" />
      Saving…
    </Button>
  ),
}

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
}

export const AsChild: Story = {
  render: () => (
    <Button asChild>
      <a href="#">Link button</a>
    </Button>
  ),
}
