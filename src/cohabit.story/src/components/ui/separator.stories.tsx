import type { Meta, StoryObj } from "@storybook/react"
import { Lock } from "lucide-react"

import { Separator } from "./separator"

const meta = {
  title: "ui/Separator",
  component: Separator,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <p className="text-sm text-muted-foreground">Content above</p>
      <Separator className="my-4" />
      <p className="text-sm text-muted-foreground">Content below</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-16 items-center gap-4">
      <span className="text-sm text-muted-foreground">Left</span>
      <Separator orientation="vertical" className="h-full" />
      <span className="text-sm text-muted-foreground">Right</span>
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-full max-w-sm items-center gap-3">
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground">or</span>
      <Separator className="flex-1" />
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex w-full max-w-sm items-center gap-3">
      <Separator className="flex-1" />
      <Lock className="size-4 text-muted-foreground" />
      <Separator className="flex-1" />
    </div>
  ),
}
