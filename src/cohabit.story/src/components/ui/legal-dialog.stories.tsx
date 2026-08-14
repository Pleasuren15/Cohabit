import type { Meta, StoryObj } from "@storybook/react"

import { LegalDialog } from "./legal-dialog"

const meta: Meta<typeof LegalDialog> = {
  title: "ui/LegalDialog",
  component: LegalDialog,
} satisfies Meta<typeof LegalDialog>

export default meta

type Story = StoryObj<typeof LegalDialog>

export const TermsOfUse: Story = {
  render: () => (
    <div className="p-6 text-sm">
      <p>
        By creating an account you agree to our{" "}
        <LegalDialog type="terms">Terms of Use</LegalDialog> and{" "}
        <LegalDialog type="privacy">Privacy Policy</LegalDialog>.
      </p>
    </div>
  ),
}
