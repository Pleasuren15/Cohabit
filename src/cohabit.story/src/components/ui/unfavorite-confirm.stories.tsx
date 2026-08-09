import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, screen, userEvent } from "storybook/test"

import { useUnfavoriteConfirm } from "./unfavorite-confirm"

function UnfavoriteDemo() {
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(["1", "2"]),
  )
  const { handleToggle, dialog } = useUnfavoriteConfirm((id) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  })

  return (
    <div className="w-full max-w-xs space-y-2">
      {Array.from(favorites).map((id) => (
        <div
          key={id}
          className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
        >
          <span className="text-sm font-medium">Saved listing #{id}</span>
          <button
            type="button"
            onClick={() => handleToggle(id, favorites.has(id))}
            className="text-xs font-medium text-destructive"
          >
            Unfavorite
          </button>
        </div>
      ))}
      {favorites.size === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No favourites left.
        </p>
      )}
      {dialog}
    </div>
  )
}

const meta = {
  title: "ui/UnfavoriteConfirm",
  component: UnfavoriteDemo,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof UnfavoriteDemo>

export default meta
type Story = StoryObj<typeof meta>

export const ConfirmsRemoval: Story = {
  render: () => <UnfavoriteDemo />,
  play: async () => {
    await userEvent.click(
      screen.getAllByRole("button", { name: /unfavorite/i })[0],
    )
    await expect(screen.getByRole("alertdialog")).toBeVisible()
    await userEvent.click(screen.getByRole("button", { name: /^remove$/i }))
    await expect(screen.queryByText("Saved listing #1")).not.toBeInTheDocument()
    await expect(screen.getByText("Saved listing #2")).toBeVisible()
  },
}

export const CancelKeepsFavorites: Story = {
  render: () => <UnfavoriteDemo />,
  play: async () => {
    await userEvent.click(
      screen.getAllByRole("button", { name: /unfavorite/i })[0],
    )
    await expect(screen.getByRole("alertdialog")).toBeVisible()
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }))
    await expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    await expect(screen.getByText("Saved listing #1")).toBeVisible()
  },
}
