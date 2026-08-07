import type { Meta, StoryObj } from "@storybook/react"

import { Label } from "./label"
import { Input } from "@/components/ui/input"

const meta = {
  title: "ui/Label",
  component: Label,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: { children: "Your name" },
}

export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="name-basic">Full name</Label>
      <Input id="name-basic" placeholder="Ada Lovelace" />
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="city-required">
        City
        <span className="text-destructive">*</span>
      </Label>
      <Input id="city-required" required placeholder="Vancouver" />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="group grid w-full max-w-sm gap-2" data-disabled="true">
      <Label htmlFor="frozen">Frozen field</Label>
      <Input id="frozen" disabled placeholder="Locked" />
    </div>
  ),
}
