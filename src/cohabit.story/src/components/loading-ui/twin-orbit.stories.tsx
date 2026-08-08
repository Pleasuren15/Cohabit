import type { CSSProperties } from "react"
import type { Meta, StoryObj } from "@storybook/react"

import { TwinOrbit } from "./twin-orbit"

const meta = {
  title: "loading-ui/TwinOrbit",
  component: TwinOrbit,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof TwinOrbit>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <TwinOrbit className="size-5 text-primary" />,
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <TwinOrbit className="size-3 text-primary" />
      <TwinOrbit className="size-4 text-primary" />
      <TwinOrbit className="size-6 text-primary" />
      <TwinOrbit className="size-8 text-primary" />
    </div>
  ),
}

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <TwinOrbit className="size-5 text-primary" />
      <TwinOrbit className="size-5 text-accent" />
      <TwinOrbit className="size-5 text-blue-400" />
      <TwinOrbit className="size-5 text-destructive" />
    </div>
  ),
}

export const Fast: Story = {
  render: () => (
    <TwinOrbit
      className="size-5 text-primary"
      style={{ "--duration": "0.5s" } as CSSProperties}
    />
  ),
}

export const WithText: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <TwinOrbit className="size-4 text-primary" />
      Loading your household…
    </div>
  ),
}
