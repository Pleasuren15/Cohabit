import type { Meta, StoryObj } from "@storybook/react"
import { expect, screen, userEvent } from "storybook/test"

import { ContractGenerator } from "./contract-generator"

const meta = {
  title: "ui/ContractGenerator",
  component: ContractGenerator,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ContractGenerator>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
}

export const FullWizardFlow: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
  play: async () => {
    // Step 1 — both contract types are offered.
    await expect(
      screen.getByRole("button", { name: /roommate agreement/i }),
    ).toBeInTheDocument()
    await expect(
      screen.getByRole("button", { name: /residential lease/i }),
    ).toBeInTheDocument()

    // Step 2 — choosing a type moves to the details form.
    await userEvent.click(
      screen.getByRole("button", { name: /roommate agreement/i }),
    )
    await expect(screen.getByText(/property & dates/i)).toBeInTheDocument()

    // Fill the address and preview the document.
    await userEvent.type(
      screen.getByPlaceholderText(/12 long street, cape town/i),
      "5 Orchid Road, Johannesburg",
    )
    await userEvent.click(screen.getByRole("button", { name: /preview/i }))

    // Step 3 — the document preview is rendered and ready to download.
    await expect(
      screen.getByRole("button", { name: /download pdf/i }),
    ).toBeInTheDocument()
    await expect(screen.getByText(/5 orchid road, johannesburg/i)).toBeVisible()

    // Back out to the type picker.
    await userEvent.click(screen.getByRole("button", { name: /^back$/i }))
    await expect(screen.getByText(/property & dates/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /^back$/i }))
    await expect(
      screen.getByRole("button", { name: /residential lease/i }),
    ).toBeInTheDocument()
  },
}
