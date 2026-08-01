import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ListingFilter } from "@/components/listing-filter"

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "roommate", label: "Roommate" },
  { value: "rentals", label: "Rentals" },
]

describe("ListingFilter data rendering", () => {
  it.each(FILTER_OPTIONS)(
    "renders the '$label' option with value '$value'",
    ({ value, label }) => {
      render(<ListingFilter value="all" onChange={() => {}} />)
      const option = screen.getByRole("option", { name: label })
      expect(option).toHaveValue(value)
    }
  )

  it.each(FILTER_OPTIONS)(
    "emits '$value' when '$label' is selected",
    async ({ value, label }) => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(<ListingFilter value="all" onChange={handleChange} />)
      const select = screen.getByRole("combobox")
      await user.selectOptions(select, label)

      expect(handleChange).toHaveBeenCalledWith(value)
    }
  )

  it("reflects the controlled value prop", () => {
    const { rerender } = render(
      <ListingFilter value="all" onChange={() => {}} />
    )
    expect(screen.getByRole("combobox")).toHaveValue("all")

    rerender(<ListingFilter value="rentals" onChange={() => {}} />)
    expect(screen.getByRole("combobox")).toHaveValue("rentals")
  })

  it("labels the control as Type", () => {
    render(<ListingFilter value="all" onChange={() => {}} />)
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument()
  })
})
