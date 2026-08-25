import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test"

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

/** Interactive shell for stories that need state management. */
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

/**
 * Creates a fake JPEG blob so the dialog renders its preview state without
 * needing a real camera or file picker.
 */
function makeFakeJpeg(label: string): File {
  const canvas = document.createElement("canvas")
  canvas.width = 400
  canvas.height = 300
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#d4d4d8"
  ctx.fillRect(0, 0, 400, 300)
  ctx.fillStyle = "#71717a"
  ctx.font = "14px sans-serif"
  ctx.textAlign = "center"
  ctx.fillText(label, 200, 155)
  // synchronous toBlob is not available; fall through with a tiny valid JPEG
  // by returning a minimal placeholder — the preview still renders.
  const bytes = new Uint8Array([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
  ])
  return new File([bytes], `${label}.jpg`, { type: "image/jpeg" })
}

// ---------------------------------------------------------------------------
// 1. Empty form — first submission, nothing captured yet
// ---------------------------------------------------------------------------
export const EmptyForm: Story = {
  name: "Empty form",
  args: { ...baseArgs },
  play: settlePlay,
}

// ---------------------------------------------------------------------------
// 2. Review history — shows past submissions with different statuses
// ---------------------------------------------------------------------------
export const WithHistory: Story = {
  name: "With review history",
  args: { ...baseArgs, submissions: seededSubmissions },
  play: settlePlay,
  render: () => <DialogHost initialSubmissions={seededSubmissions} />,
}

// ---------------------------------------------------------------------------
// 3. Blocked by pending — cannot submit while another is under review
// ---------------------------------------------------------------------------
const pendingSubmission: VerificationSubmission = {
  id: "pending-1",
  type: "Identity Document",
  status: "Pending",
  frontImageUrl: null,
  backImageUrl: null,
  selfieImageUrl: null,
  submittedAt: new Date().toISOString(),
  reviewedAt: null,
  rejectionReason: null,
}

export const BlockedByPending: Story = {
  name: "Blocked by pending submission",
  args: { ...baseArgs, submissions: [pendingSubmission] },
  play: settlePlay,
}

// ---------------------------------------------------------------------------
// 4. Rejected with reason — shows the rejection copy
// ---------------------------------------------------------------------------
const rejectedSubmission: VerificationSubmission = {
  id: "rejected-1",
  type: "Driver's License",
  status: "Rejected",
  frontImageUrl: null,
  backImageUrl: null,
  selfieImageUrl: null,
  submittedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  reviewedAt: new Date(Date.now() - 86_400_000).toISOString(),
  rejectionReason: "The photo was too blurry to read the card number.",
}

export const RejectedWithReason: Story = {
  name: "Rejected with reason",
  args: { ...baseArgs, submissions: [rejectedSubmission] },
  play: settlePlay,
}

// ---------------------------------------------------------------------------
// 5. Submit disabled — form visible but no front photo yet
// ---------------------------------------------------------------------------
export const SubmitDisabled: Story = {
  name: "Submit disabled (no photos)",
  args: { ...baseArgs },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentElement!)
    let submit!: HTMLElement
    await waitFor(async () => {
      submit = canvas.getByRole("button", { name: /submit for review/i })
      await expect(submit).toBeDisabled()
    })
    await new Promise((resolve) => setTimeout(resolve, 450))
  },
}

// ---------------------------------------------------------------------------
// 6. Switching document type — tabs update visually
// ---------------------------------------------------------------------------
export const SwitchingDocType: Story = {
  name: "Switching document type",
  args: { ...baseArgs },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentElement!)
    await waitFor(async () => {
      await expect(
        canvas.getByRole("button", { name: /id document/i })
      ).toHaveClass(/border-accent/)
    })
    const passportTab = canvas.getByRole("button", { name: /passport/i })
    await userEvent.click(passportTab)
    await waitFor(async () => {
      await expect(passportTab).toHaveClass(/border-accent/)
    })
    await new Promise((resolve) => setTimeout(resolve, 450))
  },
}

// ---------------------------------------------------------------------------
// 7. All photos captured — previews visible, submit enabled
// ---------------------------------------------------------------------------
export const AllPhotosCaptured: Story = {
  name: "All photos captured (submit enabled)",
  args: { ...baseArgs },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentElement!)
    const frontInput = canvas.getByLabelText(/camera capture for front/i)
    const selfieInput = canvas.getByLabelText(/camera capture for selfie/i)

    const frontFile = makeFakeJpeg("front-doc")
    const selfieFile = makeFakeJpeg("selfie")

    const dtFront = new DataTransfer()
    dtFront.items.add(frontFile)
    Object.defineProperty(frontInput, "files", { value: dtFront.files })
    fireEvent.change(frontInput)

    const dtSelfie = new DataTransfer()
    dtSelfie.items.add(selfieFile)
    Object.defineProperty(selfieInput, "files", { value: dtSelfie.files })
    fireEvent.change(selfieInput)

    await waitFor(async () => {
      const submit = canvas.getByRole("button", { name: /submit for review/i })
      await expect(submit).toBeEnabled()
    })
    await new Promise((resolve) => setTimeout(resolve, 450))
  },
}
