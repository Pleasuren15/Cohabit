import { describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MinimalCarousel } from "@/components/ui/minimal-carousel"
import { SAMPLE_CARDS } from "./fixtures"

describe("MinimalCarousel data rendering", () => {
  it("renders the title and value of every card", () => {
    render(<MinimalCarousel cards={SAMPLE_CARDS} />)
    for (const card of SAMPLE_CARDS) {
      expect(screen.getByText(card.title)).toBeInTheDocument()
      expect(screen.getByText(card.value)).toBeInTheDocument()
    }
  })

  it("renders without error for an empty dataset", () => {
    expect(() => render(<MinimalCarousel cards={[]} />)).not.toThrow()
  })
})

describe("MinimalCarousel interaction", () => {
  it("calls onViewListing with the active card", async () => {
    const user = userEvent.setup()
    const onViewListing = vi.fn()
    render(
      <MinimalCarousel
        cards={SAMPLE_CARDS}
        onViewListing={onViewListing}
      />
    )

    await user.click(screen.getByRole("button", { name: /view listing/i }))
    expect(onViewListing).toHaveBeenCalledWith(SAMPLE_CARDS[0])
  })

  it("calls onFavoriteToggle with the active card", async () => {
    const user = userEvent.setup()
    const onFavoriteToggle = vi.fn()
    render(
      <MinimalCarousel
        cards={SAMPLE_CARDS}
        onFavoriteToggle={onFavoriteToggle}
      />
    )

    await user.click(
      screen.getByRole("button", { name: /remove from favorites/i })
    )
    expect(onFavoriteToggle).toHaveBeenCalledWith(SAMPLE_CARDS[0])
  })

  it("makes a grid card active when it is selected", async () => {
    const user = userEvent.setup()
    const onFavoriteToggle = vi.fn()
    render(
      <MinimalCarousel
        cards={SAMPLE_CARDS}
        onFavoriteToggle={onFavoriteToggle}
      />
    )

    const target = SAMPLE_CARDS[1]
    await user.click(screen.getByText(target.title))

    const heading = screen.getByRole("heading", {
      level: 3,
      name: target.title,
    })
    const activeCard = heading.closest("div.relative")!.parentElement!
    await user.click(
      within(activeCard).getByRole("button", {
        name: /remove from favorites/i,
      })
    )
    expect(onFavoriteToggle).toHaveBeenCalledWith(target)
  })
})
