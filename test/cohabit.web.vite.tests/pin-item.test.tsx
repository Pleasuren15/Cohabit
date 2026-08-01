import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PinItemComponent } from "@/components/ui/pin-item"
import { SAMPLE_PLACES } from "./fixtures"

function findPinButtonFor(name: string) {
  const row = screen.getByText(name).closest("div.relative")!
  return within(row).getByRole("button")
}

describe("PinItemComponent data rendering", () => {
  it.each(SAMPLE_PLACES)("renders $name with type and status", (place) => {
    render(<PinItemComponent items={SAMPLE_PLACES} />)
    const row = screen.getByText(place.name).closest("div.relative")!
    expect(screen.getByText(place.name)).toBeInTheDocument()
    expect(within(row).getByText(place.type)).toBeInTheDocument()
    expect(within(row).getByText(place.status)).toBeInTheDocument()
  })

  it("groups pinned and unpinned items under their own headings", () => {
    render(
      <PinItemComponent
        items={SAMPLE_PLACES}
        pinnedLabel="Pinned"
        allLabel="All Messages"
      />
    )

    const pinned = SAMPLE_PLACES.filter((p) => p.pinned)
    const unpinned = SAMPLE_PLACES.filter((p) => !p.pinned)

    expect(screen.getByText("Pinned")).toBeInTheDocument()
    expect(screen.getByText("All Messages")).toBeInTheDocument()

    for (const place of pinned) {
      expect(screen.getByText(place.name)).toBeInTheDocument()
    }
    for (const place of unpinned) {
      expect(screen.getByText(place.name)).toBeInTheDocument()
    }
  })

  it("uses default labels when none are provided", () => {
    render(<PinItemComponent items={SAMPLE_PLACES} />)
    expect(screen.getByText("Pinned")).toBeInTheDocument()
    expect(screen.getByText("All")).toBeInTheDocument()
  })

  it("renders without error for an empty dataset", () => {
    expect(() => render(<PinItemComponent items={[]} />)).not.toThrow()
  })
})

describe("PinItemComponent interaction", () => {
  it("moves an item into the pinned group when its pin is toggled", async () => {
    const user = userEvent.setup()
    const target = SAMPLE_PLACES.find((p) => !p.pinned)!
    const otherPinned = SAMPLE_PLACES.filter((p) => p.pinned)

    render(<PinItemComponent items={SAMPLE_PLACES} pinnedLabel="Pinned" />)

    await user.click(findPinButtonFor(target.name))

    const pinnedSection = screen
      .getByText("Pinned")
      .closest("div.space-y-3")!

    expect(within(pinnedSection).getByText(target.name)).toBeInTheDocument()
    expect(
      within(pinnedSection).getByText(otherPinned[0].name)
    ).toBeInTheDocument()
  })

  it("removes an item from the pinned group when its pin is toggled", async () => {
    const user = userEvent.setup()
    const target = SAMPLE_PLACES.find((p) => p.pinned)!

    render(
      <PinItemComponent
        items={SAMPLE_PLACES}
        pinnedLabel="Pinned"
        allLabel="All Messages"
      />
    )

    const pinnedSection = screen
      .getByText("Pinned")
      .closest("div.space-y-3")!
    const allSection = screen
      .getByText("All Messages")
      .closest("div.space-y-3")!
    expect(
      within(pinnedSection).getByText(target.name)
    ).toBeInTheDocument()
    expect(
      within(allSection).queryByText(target.name)
    ).not.toBeInTheDocument()

    await user.click(findPinButtonFor(target.name))

    expect(within(allSection).getByText(target.name)).toBeInTheDocument()
  })
})
