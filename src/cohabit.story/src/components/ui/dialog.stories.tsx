import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, screen, userEvent } from "storybook/test"

import { Button } from "./button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"

function DialogDemo() {
  const [acknowledged, setAcknowledged] = useState(false)
  return (
    <div className="space-y-4 text-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open dialog</Button>
        </DialogTrigger>
        <DialogContent className="flex max-h-[min(650px,90vh)] flex-col gap-0 overflow-hidden rounded-xl border border-border/40 p-0 shadow-xl sm:max-w-md">
          <DialogHeader className="border-b border-border/40 px-6 py-4 text-left">
            <DialogTitle className="text-lg font-semibold">
              How we use your data
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <DialogDescription className="px-6 py-6 text-sm leading-relaxed">
              We never sell your data. We only use it to match you with
              compatible co-habitants, show relevant listings, and keep the
              platform safe. You can edit or delete it at any time.
            </DialogDescription>
          </div>
          <DialogFooter className="border-t border-border/40 bg-background/50 p-4 sm:px-6 sm:pb-6">
            <DialogClose asChild>
              <Button variant="ghost" className="sm:w-auto">
                Close
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                className="w-full rounded-lg bg-accent px-7 py-2.5 font-semibold text-white shadow-md sm:w-auto"
                onClick={() => setAcknowledged(true)}
              >
                Got it
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {acknowledged && (
        <p className="text-sm font-medium text-muted-foreground">
          Acknowledged.
        </p>
      )}
    </div>
  )
}

const meta = {
  title: "ui/Dialog",
  component: DialogDemo,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof DialogDemo>

export default meta
type Story = StoryObj<typeof meta>

export const StickyHeader: Story = {
  render: () => <DialogDemo />,
  play: async () => {
    await userEvent.click(screen.getByRole("button", { name: /open dialog/i }))
    await expect(screen.getByRole("dialog")).toBeVisible()
    await expect(screen.getByText(/we never sell your data/i)).toBeVisible()
    await userEvent.click(screen.getByRole("button", { name: /got it/i }))
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await expect(screen.getByText("Acknowledged.")).toBeVisible()
  },
}
