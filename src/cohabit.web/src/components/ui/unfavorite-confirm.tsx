"use client"

import { useCallback, useState } from "react"
import { TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const STORAGE_KEY = "cohabit:unfavorite-confirm-hidden"

/**
 * Confirmation dialog shown before a user unfavorites a listing.
 */
// eslint-disable-next-line react-refresh/only-export-components -- paired with hook below
function UnfavoriteConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean
  onConfirm: (remember: boolean) => void
  onCancel: () => void
}) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
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
        <div className="flex items-center gap-2">
          <Checkbox
            id="unfavorite-dont-show-again"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(Boolean(checked))}
          />
          <Label htmlFor="unfavorite-dont-show-again">
            Don't ask again
          </Label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={() => onConfirm(dontShowAgain)}>
              Remove
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Wraps a favorite toggle so that REMOVING a favorite asks for confirmation
 * first, while ADDING a favorite happens immediately. The dialog can be
 * silenced permanently via a "Don't ask again" checkbox, persisted to
 * localStorage.
 */
export function useUnfavoriteConfirm(onRemove: (id: string) => void) {
  const [skipConfirm, setSkipConfirm] = useState(
    () =>
      typeof localStorage !== "undefined" &&
      localStorage.getItem(STORAGE_KEY) === "1"
  )
  const [pendingId, setPendingId] = useState<string | null>(null)

  const confirmRemove = useCallback(
    (remember: boolean) => {
      if (remember) {
        try {
          localStorage.setItem(STORAGE_KEY, "1")
        } catch {
          // ignore storage failures
        }
        setSkipConfirm(true)
      }
      if (pendingId !== null) onRemove(pendingId)
      setPendingId(null)
    },
    [onRemove, pendingId]
  )

  const cancelRemove = useCallback(() => setPendingId(null), [])

  const handleToggle = useCallback(
    (id: string, isFavorited: boolean) => {
      if (skipConfirm || !isFavorited) onRemove(id)
      else setPendingId(id)
    },
    [onRemove, skipConfirm]
  )

  const dialog = (
    <UnfavoriteConfirmDialog
      key={pendingId ?? "closed"}
      open={pendingId !== null}
      onConfirm={confirmRemove}
      onCancel={cancelRemove}
    />
  )

  return { handleToggle, dialog }
}
