import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover12,
  Popover12Close,
  Popover12Content,
  Popover12Description,
  Popover12Header,
  Popover12Title,
  Popover12Trigger,
} from "@/components/ui/popover-12"

const meta = {
  title: "ui/Popover12 (legacy)",
  component: Popover12,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover12>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <Popover12>
      <Popover12Trigger asChild>
        <Button variant="outline">Open popover</Button>
      </Popover12Trigger>
      <Popover12Content>
        <Popover12Header>
          <Popover12Title>Quick settings</Popover12Title>
          <Popover12Description>
            Manage your preferences directly from here.
          </Popover12Description>
        </Popover12Header>
        <Popover12Close />
      </Popover12Content>
    </Popover12>
  ),
}

export const WithForm: Story = {
  render: () => (
    <Popover12>
      <Popover12Trigger asChild>
        <Button variant="outline">Feedback</Button>
      </Popover12Trigger>
      <Popover12Content>
        <Popover12Header>
          <Popover12Title>Send feedback</Popover12Title>
          <Popover12Description>
            Your input helps us improve.
          </Popover12Description>
        </Popover12Header>
        <form className="flex flex-col gap-2">
          <Label htmlFor="feedback12" className="text-background/70">
            Message
          </Label>
          <Input
            id="feedback12"
            placeholder="What's on your mind?"
            className="border-background/20 bg-background/10 text-background placeholder:text-background/40"
          />
          <Button size="sm" className="mt-1 bg-background text-foreground hover:bg-background/90">
            Submit
          </Button>
        </form>
        <Popover12Close />
      </Popover12Content>
    </Popover12>
  ),
}

export const AlignStart: Story = {
  render: () => (
    <Popover12>
      <Popover12Trigger asChild>
        <Button variant="outline">Align start</Button>
      </Popover12Trigger>
      <Popover12Content align="start">
        <Popover12Header>
          <Popover12Title>Aligned to start</Popover12Title>
          <Popover12Description>
            This popover aligns to the start edge of its trigger.
          </Popover12Description>
        </Popover12Header>
        <Popover12Close />
      </Popover12Content>
    </Popover12>
  ),
}
