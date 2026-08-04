import type { Meta, StoryObj } from "@storybook/react"

import { MeshBackground } from "./mesh-background"

const meta = {
  title: "layout/MeshBackground",
  component: MeshBackground,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof MeshBackground>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="relative flex h-dvh w-full items-center justify-center overflow-hidden">
      <MeshBackground />
      <div className="relative z-10 rounded-2xl bg-card/80 p-8 text-center shadow-lg ring-1 ring-border backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-card-foreground">
          Mesh background
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Content renders on top of the drifting accent blobs.
        </p>
      </div>
    </div>
  ),
}

export const Intensities: Story = {
  render: () => (
    <div className="grid h-dvh w-full grid-cols-1 gap-4 p-6 md:grid-cols-3">
      {(["subtle", "medium", "strong"] as const).map((intensity) => (
        <div
          key={intensity}
          className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-border"
        >
          <MeshBackground intensity={intensity} />
          <span className="relative z-10 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-foreground capitalize backdrop-blur-sm">
            {intensity}
          </span>
        </div>
      ))}
    </div>
  ),
}
