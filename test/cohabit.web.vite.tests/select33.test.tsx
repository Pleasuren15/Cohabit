import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Select33 from "@/components/ui/select-33"

const PROVINCES = [
  { id: "ec", label: "Eastern Cape" },
  { id: "fs", label: "Free State" },
  { id: "gp", label: "Gauteng" },
  { id: "kzn", label: "KwaZulu-Natal" },
  { id: "lp", label: "Limpopo" },
  { id: "mp", label: "Mpumalanga" },
  { id: "nc", label: "Northern Cape" },
  { id: "nw", label: "North West" },
  { id: "wc", label: "Western Cape" },
]

describe("Select33 data rendering", () => {
  it("asks which province the user is looking in", () => {
    render(<Select33 />)
    expect(
      screen.getByText(/which province are you looking in/i)
    ).toBeInTheDocument()
  })

  it("lists every South African province when opened", async () => {
    const user = userEvent.setup()
    render(<Select33 />)

    await user.click(screen.getByRole("combobox"))

    for (const province of PROVINCES) {
      expect(
        screen.getByRole("option", { name: new RegExp(province.label) })
      ).toBeInTheDocument()
    }
  })
})

describe("Select33 interaction", () => {
  it("emits the selected province id", async () => {
    const user = userEvent.setup()
    const onProvinceChange = vi.fn()

    render(<Select33 onProvinceChange={onProvinceChange} />)

    await user.click(screen.getByRole("combobox"))
    await user.click(
      screen.getByRole("option", { name: /kwaZulu-natal/i })
    )

    expect(onProvinceChange).toHaveBeenCalledWith("kzn")
  })
})
