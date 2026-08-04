import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "./popover"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"

const meta = {
  title: "ui/Popover",
  component: Popover,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        Quickly note an expense or a chore for the house.
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Open popover" }))
    const dialog = await within(document.body).findByRole("dialog")
    await expect(
      within(dialog).getByText("Quickly note an expense or a chore for the house."),
    ).toBeVisible()
    await userEvent.keyboard("{Escape}")
    await expect(dialog).not.toBeInTheDocument()
  },
}

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">New expense</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" placeholder="0.00" />
        </div>
        <div className="flex justify-end">
          <Button size="sm">Add expense</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const WithHeader: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Household settings</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Household settings</PopoverTitle>
          <PopoverDescription>
            Manage who can edit the budget and approve expenses.
          </PopoverDescription>
        </PopoverHeader>
        <Button size="sm" className="w-fit">
          Open settings
        </Button>
      </PopoverContent>
    </Popover>
  ),
}

export const AlignEnd: Story = {
  render: () => (
    <div className="flex w-full justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">More options</Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          Invite a housemate, export the ledger, or leave the household.
        </PopoverContent>
      </Popover>
    </div>
  ),
}
