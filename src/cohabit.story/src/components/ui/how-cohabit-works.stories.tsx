import type { Meta, StoryObj } from "@storybook/react"
import { expect, screen } from "storybook/test"

import { HowCohabitWorks } from "./how-cohabit-works"

const meta = {
  title: "ui/HowCohabitWorks",
  component: HowCohabitWorks,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof HowCohabitWorks>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async () => {
    await expect(screen.getByText("Create your profile")).toBeVisible()
    await expect(screen.getByText("Browse & save")).toBeVisible()
    await expect(screen.getByText("Connect & chat")).toBeVisible()
    await expect(screen.getByText("Move in together")).toBeVisible()
  },
}
