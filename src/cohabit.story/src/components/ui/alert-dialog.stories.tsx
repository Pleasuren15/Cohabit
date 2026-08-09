import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, screen, userEvent } from "storybook/test"
import { TriangleAlertIcon } from "lucide-react"

import { Button } from "./button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog"

function AlertDialogDemo() {
  const [open, setOpen] = useState(false)
  const [removed, setRemoved] = useState(false)
  return (
    <div className="space-y-4 text-center">
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Remove from WatchList
      </Button>
      {removed && (
        <p className="text-sm font-medium text-muted-foreground">
          Listing removed.
        </p>
      )}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <div className="flex size-12 items-center justify-center rounded-full border-4 border-destructive/25 bg-destructive/5">
            <TriangleAlertIcon className="size-6 text-destructive" />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from WatchList?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the listing from your WatchList. You can add it
              back at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  setOpen(false)
                  setRemoved(true)
                }}
              >
                Remove
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const meta = {
  title: "ui/AlertDialog",
  component: AlertDialogDemo,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof AlertDialogDemo>

export default meta
type Story = StoryObj<typeof meta>

export const UnfavoriteConfirm: Story = {
  render: () => <AlertDialogDemo />,
  play: async () => {
    await userEvent.click(
      screen.getByRole("button", { name: /remove from watchlist/i }),
    )
    await expect(screen.getByRole("alertdialog")).toBeVisible()
    await expect(screen.getByText("Remove from WatchList?")).toBeVisible()
    await userEvent.click(screen.getByRole("button", { name: /^remove$/i }))
    await expect(screen.getByText("Listing removed.")).toBeVisible()
  },
}

export const CancelKeepsListing: Story = {
  render: () => <AlertDialogDemo />,
  play: async () => {
    await userEvent.click(
      screen.getByRole("button", { name: /remove from watchlist/i }),
    )
    await expect(screen.getByRole("alertdialog")).toBeVisible()
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }))
    await expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    await expect(screen.queryByText("Listing removed.")).not.toBeInTheDocument()
  },
}
