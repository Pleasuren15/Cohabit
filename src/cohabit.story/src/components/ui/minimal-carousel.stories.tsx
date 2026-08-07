import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"

import { MinimalCarousel, type CarouselCard } from "./minimal-carousel"

const cards: CarouselCard[] = [
  {
    id: "1",
    title: "Bright room in Observatory",
    value: "R 6 500 /month",
    color: "bg-gradient-to-br from-rose-500 to-pink-600",
  },
  {
    id: "2",
    title: "Garden flat in Rosebank",
    value: "R 8 200 /month",
    color: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
  {
    id: "3",
    title: "Sunny loft in Umhlanga",
    value: "R 9 800 /month",
    color: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  {
    id: "4",
    title: "Studio in City Bowl",
    value: "R 7 400 /month",
    color: "bg-gradient-to-br from-sky-500 to-blue-600",
  },
  {
    id: "5",
    title: "Shared house in Melville",
    value: "R 5 200 /month",
    color: "bg-gradient-to-br from-violet-500 to-purple-600",
  },
]

const meta = {
  title: "ui/MinimalCarousel",
  component: MinimalCarousel,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof MinimalCarousel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { cards },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("heading", { name: "Bright room in Observatory" }),
    ).toBeVisible()
    await userEvent.click(canvas.getByText("Garden flat in Rosebank"))
    await new Promise((resolve) => setTimeout(resolve, 700))
    await expect(
      canvas.getByRole("heading", { name: "Garden flat in Rosebank" }),
    ).toBeVisible()
  },
}

export const SingleCard: Story = {
  args: { cards: [cards[0]] },
}

export const Interactive: Story = {
  args: { cards },
  render: () => {
    const [localCards, setLocalCards] = useState<CarouselCard[]>(cards)
    const [status, setStatus] = useState("")
    return (
      <div className="w-full max-w-105 space-y-4">
        <MinimalCarousel
          cards={localCards}
          onFavoriteToggle={(card) => {
            setLocalCards((prev) => prev.filter((c) => c.id !== card.id))
            setStatus(`Removed "${card.title}" from favourites`)
          }}
          onViewListing={(card) => setStatus(`Viewing "${card.title}"`)}
        />
        {status && (
          <p className="text-center text-sm font-medium text-muted-foreground">
            {status}
          </p>
        )}
      </div>
    )
  },
}
