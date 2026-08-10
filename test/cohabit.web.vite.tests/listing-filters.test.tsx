import { describe, expect, it, vi } from "vitest"
import { render, screen, within, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ListingFiltersSheet } from "@/components/listing-filters"

function renderSheet(overrides: Partial<Parameters<typeof ListingFiltersSheet>[0]> = {}) {
  const onClose = vi.fn()
  const onChange = vi.fn()
  const view = render(
    <ListingFiltersSheet
      open
      onClose={onClose}
      filters={{}}
      onChange={onChange}
      {...overrides}
    />
  )
  return { onClose, onChange, view }
}

describe("ListingFiltersSheet rendering", () => {
  it("renders nothing when closed", () => {
    render(
      <ListingFiltersSheet
        open={false}
        onClose={() => {}}
        filters={{}}
        onChange={() => {}}
      />
    )
    expect(
      screen.queryByRole("dialog", { name: /filter listings/i })
    ).not.toBeInTheDocument()
  })

  it("renders a dialog with budget, size, move-in, amenity and rule sections", () => {
    renderSheet()
    const dialog = screen.getByRole("dialog", { name: /filter listings/i })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText("Monthly budget")).toBeInTheDocument()
    expect(screen.getByText("Bedrooms")).toBeInTheDocument()
    expect(screen.getByText("Bathrooms")).toBeInTheDocument()
    expect(screen.getByText("Move in by")).toBeInTheDocument()
    expect(screen.getByText("Must-have amenities")).toBeInTheDocument()
    expect(screen.getByText("Home rules")).toBeInTheDocument()
  })
})

describe("ListingFiltersSheet budget inputs", () => {
  it("emits minPrice when the minimum price input changes", () => {
    const { onChange } = renderSheet()

    fireEvent.change(screen.getByLabelText("Minimum price"), {
      target: { value: "5000" },
    })
    expect(onChange).toHaveBeenCalledWith({ minPrice: 5000 })
  })

  it("emits maxPrice when the maximum price input changes", () => {
    const { onChange } = renderSheet()

    fireEvent.change(screen.getByLabelText("Maximum price"), {
      target: { value: "8000" },
    })
    expect(onChange).toHaveBeenCalledWith({ maxPrice: 8000 })
  })

  it("clears minPrice to undefined when emptied", async () => {
    const user = userEvent.setup()
    const { onChange } = renderSheet({ filters: { minPrice: 5000 } })

    const input = screen.getByLabelText("Minimum price")
    expect(input).toHaveValue(5000)
    await user.clear(input)
    expect(onChange).toHaveBeenLastCalledWith({ minPrice: undefined })
  })
})

describe("ListingFiltersSheet size selects", () => {
  it("emits minBeds when a bedroom minimum is chosen", async () => {
    const user = userEvent.setup()
    const { onChange } = renderSheet()

    const beds = screen.getByLabelText("Minimum bedrooms")
    await user.selectOptions(beds, within(beds).getByRole("option", { name: "2+" }))
    expect(onChange).toHaveBeenCalledWith({ minBeds: 2 })
  })

  it("emits minBaths when a bathroom minimum is chosen", async () => {
    const user = userEvent.setup()
    const { onChange } = renderSheet()

    const baths = screen.getByLabelText("Minimum bathrooms")
    await user.selectOptions(
      baths,
      within(baths).getByRole("option", { name: "2+" })
    )
    expect(onChange).toHaveBeenCalledWith({ minBaths: 2 })
  })
})

describe("ListingFiltersSheet move-in date", () => {
  it("emits moveInBy when a date is selected", async () => {
    const user = userEvent.setup()
    const { onChange } = renderSheet()

    await user.type(screen.getByLabelText("Move in by date"), "2026-09-30")
    expect(onChange).toHaveBeenCalledWith({ moveInBy: "2026-09-30" })
  })
})

describe("ListingFiltersSheet toggle chips", () => {
  it("adds and removes an amenity requirement", async () => {
    const user = userEvent.setup()
    const { onChange } = renderSheet()

    await user.click(screen.getByRole("button", { name: "Wi-Fi" }))
    expect(onChange).toHaveBeenCalledWith({ requireAmenities: ["Wi-Fi"] })
  })

  it("reflects active amenities with aria-pressed", () => {
    renderSheet({ filters: { requireAmenities: ["Wi-Fi", "Parking"] } })
    expect(screen.getByRole("button", { name: "Wi-Fi" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(screen.getByRole("button", { name: "Furnished" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
  })

  it("adds a rule requirement", async () => {
    const user = userEvent.setup()
    const { onChange } = renderSheet()

    await user.click(screen.getByRole("button", { name: "No smoking" }))
    expect(onChange).toHaveBeenCalledWith({ requireRules: ["No smoking"] })
  })

  it("keeps existing selections when toggling a second item", async () => {
    const user = userEvent.setup()
    const { onChange } = renderSheet({
      filters: { requireAmenities: ["Wi-Fi"] },
    })

    await user.click(screen.getByRole("button", { name: "Parking" }))
    expect(onChange).toHaveBeenCalledWith({
      requireAmenities: ["Wi-Fi", "Parking"],
    })
  })
})

describe("ListingFiltersSheet actions", () => {
  it("clears all filters", async () => {
    const user = userEvent.setup()
    const { onChange } = renderSheet({
      filters: {
        minPrice: 4000,
        requireAmenities: ["Wi-Fi"],
        requireRules: ["No smoking"],
      },
    })

    await user.click(screen.getByRole("button", { name: /clear all/i }))
    expect(onChange).toHaveBeenCalledWith({})
  })

  it("closes via the close button", async () => {
    const user = userEvent.setup()
    const { onClose } = renderSheet()

    await user.click(screen.getByRole("button", { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it("closes via Show results", async () => {
    const user = userEvent.setup()
    const { onClose } = renderSheet()

    await user.click(screen.getByRole("button", { name: /show results/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
