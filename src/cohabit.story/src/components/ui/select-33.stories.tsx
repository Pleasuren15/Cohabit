import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "@/components/ui/button"
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
      <Select33Trigger asChild>
        <Button variant="outline">
          <Select33Value placeholder="Pick a size" />
        </Button>
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
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label>Choose a plan</Label>
      <Select33 defaultValue="pro">
        <Select33Trigger asChild>
          <Button variant="outline">
            <Select33Value placeholder="Select plan" />
          </Button>
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
      <Select33Trigger asChild>
        <Button variant="outline">
          <Select33Value placeholder="Choose a color" />
        </Button>
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
      <Select33Trigger asChild size="sm">
        <Button variant="outline" size="sm">
          <Select33Value placeholder="Size" />
        </Button>
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
