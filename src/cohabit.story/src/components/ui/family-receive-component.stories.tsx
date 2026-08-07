import type { Meta, StoryObj } from "@storybook/react"
import { Mail } from "lucide-react"

import { FamilyReceiveComponent } from "./family-receive-component"

const meta = {
  title: "ui/FamilyReceiveComponent",
  component: FamilyReceiveComponent,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof FamilyReceiveComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <FamilyReceiveComponent />,
}

export const OpenByDefault: Story = {
  render: () => <FamilyReceiveComponent defaultOpen />,
}

export const CustomContent: Story = {
  render: () => (
    <FamilyReceiveComponent
      triggerLabel="Share"
      title="Send invite"
      description="Invite a family member to join your shared household budget."
      confirmLabel="Send"
      cancelLabel="Not now"
      icon={<Mail className="text-accent" />}
    />
  ),
}
