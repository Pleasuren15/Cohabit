import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select"
import { Label } from "@/components/ui/label"

const meta = {
  title: "ui/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Select defaultValue="bc">
        <SelectTrigger className="w-full" aria-label="Province">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ab">Alberta</SelectItem>
          <SelectItem value="bc">British Columbia</SelectItem>
          <SelectItem value="on">Ontario</SelectItem>
          <SelectItem value="qc">Quebec</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("combobox", { name: "Province" })
    await userEvent.click(trigger)
    const listbox = await within(document.body).findByRole("listbox")
    await userEvent.click(within(listbox).getByRole("option", { name: "Ontario" }))
    await expect(trigger).toHaveTextContent("Ontario")
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label id="select-province-label">Province</Label>
      <Select defaultValue="bc">
        <SelectTrigger className="w-full" aria-labelledby="select-province-label">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ab">Alberta</SelectItem>
          <SelectItem value="bc">British Columbia</SelectItem>
          <SelectItem value="on">Ontario</SelectItem>
          <SelectItem value="qc">Quebec</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Grouped: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Select defaultValue="heat">
        <SelectTrigger className="w-full" aria-label="Service">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Services</SelectLabel>
            <SelectItem value="heat">Heating</SelectItem>
            <SelectItem value="internet">Internet</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Chores</SelectLabel>
            <SelectItem value="dishes">Dishes</SelectItem>
            <SelectItem value="garden">Garden</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const DisabledItem: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Select defaultValue="room-3">
        <SelectTrigger className="w-full" aria-label="Room">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="room-1">Room 1</SelectItem>
          <SelectItem value="room-2">Room 2</SelectItem>
          <SelectItem value="room-3">Room 3</SelectItem>
          <SelectItem value="room-4" disabled>
            Room 4 (occupied)
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const SizeSm: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Select defaultValue="bc">
        <SelectTrigger size="sm" className="w-full" aria-label="Province">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ab">Alberta</SelectItem>
          <SelectItem value="bc">British Columbia</SelectItem>
          <SelectItem value="on">Ontario</SelectItem>
          <SelectItem value="qc">Quebec</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Select defaultValue="bc" disabled>
        <SelectTrigger className="w-full" aria-label="Province">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ab">Alberta</SelectItem>
          <SelectItem value="bc">British Columbia</SelectItem>
          <SelectItem value="on">Ontario</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}
