import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { Search } from "lucide-react"

import { Input } from "./input"
import { Label } from "@/components/ui/label"

const meta = {
  title: "ui/Input",
  component: Input,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: "Enter a value…" },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="email-label">Email</Label>
      <Input id="email-label" type="email" placeholder="you@example.com" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Email" })
    await userEvent.type(input, "sam@example.com")
    await expect(input).toHaveValue("sam@example.com")
  },
}

export const WithIcon: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" placeholder="Search housemates…" className="pl-9" />
    </div>
  ),
}

export const Invalid: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="rent-input">Monthly rent</Label>
      <Input id="rent-input" aria-invalid="true" placeholder="0.00" />
      <p className="text-sm text-destructive">Please enter a valid amount.</p>
    </div>
  ),
}

export const Disabled: Story = {
  args: { placeholder: "Unavailable field", disabled: true },
}

export const File: Story = {
  render: () => <Input type="file" aria-label="Upload file" className="w-full max-w-sm" />,
}

export const Password: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="pw">Password</Label>
      <Input id="pw" type="password" placeholder="••••••••" />
    </div>
  ),
}

export const Email: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="invite-email">Invite email</Label>
      <Input id="invite-email" type="email" placeholder="housemate@example.com" />
    </div>
  ),
}
