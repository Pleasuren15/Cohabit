import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Button } from "./button"
import {
  IdVerificationDialog,
} from "./id-verification-dialog"
import {
  verificationService,
  type VerificationSubmission,
} from "@/services/verification-service"

const seededSubmissions = await verificationService.getMyVerifications()

const meta = {
  title: "ui/IdVerificationDialog",
  component: IdVerificationDialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof IdVerificationDialog>

export default meta
type Story = StoryObj<typeof meta>

/** Interactive shell shared by the stories below. */
function DialogHost({
  initialSubmissions,
}: {
  initialSubmissions: VerificationSubmission[]
}) {
  const [open, setOpen] = useState(true)
  const [submissions, setSubmissions] = useState(initialSubmissions)
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Button onClick={() => setOpen(true)}>Verify your ID</Button>
      <IdVerificationDialog
        open={open}
        onClose={() => setOpen(false)}
        submissions={submissions}
        onSubmitted={(submission) =>
          setSubmissions((prev) => [submission, ...prev])
        }
      />
    </div>
  )
}

const baseArgs = {
  open: true,
  onClose: () => {},
  submissions: [] as VerificationSubmission[],
  onSubmitted: () => {},
}

/**
 * The dialog animates in through framer-motion; the automatic a11y scan can
 * otherwise fire on a mid-transition frame and report bogus contrast results.
 * Give the UI a moment to settle first.
 */
const settlePlay = async () => {
  await new Promise((resolve) => setTimeout(resolve, 450))
}

export const WithHistory: Story = {
  name: "With review history",
  args: { ...baseArgs, submissions: seededSubmissions },
  play: settlePlay,
  render: () => <DialogHost initialSubmissions={seededSubmissions} />,
}

export const FirstSubmission: Story = {
  name: "First submission",
  args: { ...baseArgs },
  play: settlePlay,
  render: () => <DialogHost initialSubmissions={[]} />,
}

export const SubmitRequiresFrontPhoto: Story = {
  name: "Submit requires a front photo",
  args: { ...baseArgs },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentElement!)

    // Wait for the dialog's entrance animation to settle.
    let submit!: HTMLElement
    await waitFor(async () => {
      submit = canvas.getByRole("button", { name: /submit for review/i })
      await expect(submit).toBeDisabled()
    })

    // Switching document types keeps the form usable.
    const passportTab = canvas.getByRole("button", { name: /passport/i })
    await userEvent.click(passportTab)
    await waitFor(async () => {
      await expect(
        canvas.getByRole("button", { name: /passport/i })
      ).toHaveClass(/border-accent/)
    })
    await expect(submit).toBeDisabled()
    // Let the entrance animation finish before the a11y scan runs.
    await new Promise((resolve) => setTimeout(resolve, 450))
  },
  render: () => (
    <div className="min-h-[32rem]">
      <IdVerificationDialog
        open
        onClose={() => {}}
        submissions={[]}
        onSubmitted={() => {}}
      />
    </div>
  ),
}
