import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"

import { Label } from "@/components/ui/label"
import {
  Select33,
  Select33Content,
  Select33Group,
  Select33Item,
  Select33Label,
  Select33Trigger,
  Select33Value,
} from "@/components/ui/select-33"

const meta = {
  title: "ui/Select33 (legacy)",
  component: Select33,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Select33>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <Select33>
      <Select33Trigger aria-label="Pick a size">
        <Select33Value placeholder="Pick a size" />
      </Select33Trigger>
      <Select33Content>
        <Select33Group>
          <Select33Label>Size</Select33Label>
          <Select33Item value="xs">Extra small</Select33Item>
          <Select33Item value="sm">Small</Select33Item>
          <Select33Item value="md">Medium</Select33Item>
          <Select33Item value="lg">Large</Select33Item>
        </Select33Group>
      </Select33Content>
    </Select33>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("combobox", { name: "Pick a size" })
    await userEvent.click(trigger)
    const listbox = await within(document.body).findByRole("listbox")
    await userEvent.click(within(listbox).getByRole("option", { name: "Medium" }))
    await expect(trigger).toHaveTextContent("Medium")
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label id="select33-plan">Choose a plan</Label>
      <Select33 defaultValue="pro">
        <Select33Trigger aria-labelledby="select33-plan">
          <Select33Value placeholder="Select plan" />
        </Select33Trigger>
        <Select33Content>
          <Select33Group>
            <Select33Label>Plans</Select33Label>
            <Select33Item value="free">Free</Select33Item>
            <Select33Item value="pro">Pro</Select33Item>
            <Select33Item value="enterprise">Enterprise</Select33Item>
          </Select33Group>
        </Select33Content>
      </Select33>
    </div>
  ),
}

export const DisabledItem: Story = {
  render: () => (
    <Select33>
      <Select33Trigger aria-label="Choose a color">
        <Select33Value placeholder="Choose a color" />
      </Select33Trigger>
      <Select33Content>
        <Select33Group>
          <Select33Label>Colors</Select33Label>
          <Select33Item value="red">Red</Select33Item>
          <Select33Item value="green">Green</Select33Item>
          <Select33Item value="blue" disabled>
            Blue (unavailable)
          </Select33Item>
          <Select33Item value="yellow">Yellow</Select33Item>
        </Select33Group>
      </Select33Content>
    </Select33>
  ),
}

export const SmSize: Story = {
  render: () => (
    <Select33 defaultValue="md">
      <Select33Trigger aria-label="Size" size="sm">
        <Select33Value placeholder="Size" />
      </Select33Trigger>
      <Select33Content>
        <Select33Group>
          <Select33Item value="sm">Small</Select33Item>
          <Select33Item value="md">Medium</Select33Item>
          <Select33Item value="lg">Large</Select33Item>
        </Select33Group>
      </Select33Content>
    </Select33>
  ),
}
