import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "@/components/ui/button"

const VARIANTS = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const

const SIZES = [
  "default",
  "xs",
  "sm",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
] as const

describe("Button variants", () => {
  it.each(VARIANTS)("renders the '%s' variant", (variant) => {
    render(<Button variant={variant}>{variant}</Button>)
    const button = screen.getByRole("button", { name: variant })
    expect(button).toHaveAttribute("data-variant", variant)
  })
})

describe("Button sizes", () => {
  it.each(SIZES)("renders the '%s' size", (size) => {
    render(<Button size={size}>Size {size}</Button>)
    const button = screen.getByRole("button", { name: `Size ${size}` })
    expect(button).toHaveAttribute("data-size", size)
  })
})

describe("Button interaction", () => {
  it("fires onClick when clicked", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)

    await user.click(screen.getByRole("button", { name: /click/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Disabled
      </Button>
    )

    await user.click(screen.getByRole("button", { name: /disabled/i }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it("renders as a different element via asChild", () => {
    render(
      <Button asChild>
        <a href="/somewhere">Link Button</a>
      </Button>
    )
    expect(screen.getByRole("link", { name: /link button/i })).toBeInTheDocument()
  })
})
