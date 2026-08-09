import type { Meta, StoryObj } from "@storybook/react"
import { expect, screen, userEvent } from "storybook/test"

import { PrivacyDialog } from "./privacy-dialog"

const meta = {
  title: "ui/PrivacyDialog",
  component: PrivacyDialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof PrivacyDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async () => {
    await expect(
      screen.getByText("Privacy Promise"),
    ).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole("button", { name: /how we use your data/i }),
    )
    await expect(screen.getByRole("dialog")).toBeVisible()
    await expect(screen.getByText(/we never sell your data/i)).toBeVisible()
    await userEvent.click(screen.getByRole("button", { name: /got it/i }))
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  },
}
