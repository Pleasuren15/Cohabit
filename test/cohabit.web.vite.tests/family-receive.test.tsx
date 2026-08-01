import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FamilyReceiveComponent } from "@/components/ui/family-receive-component"

describe("FamilyReceiveComponent data rendering", () => {
  it("renders title, description and action labels when open by default", () => {
    render(
      <FamilyReceiveComponent
        defaultOpen
        title="Confirm your province"
        description="Browse shared living in the Western Cape?"
        confirmLabel="Let's Go"
        cancelLabel="Change"
      />
    )

    expect(screen.getByText("Confirm your province")).toBeInTheDocument()
    expect(
      screen.getByText("Browse shared living in the Western Cape?")
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /let's go/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /change/i })).toBeInTheDocument()
  })

  it("renders the trigger button with the trigger label when closed", () => {
    render(<FamilyReceiveComponent triggerLabel="Receive" />)
    expect(screen.getByRole("button", { name: /receive/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /cancel/i })).toBeNull()
  })

  it("uses default labels when none are provided", () => {
    render(<FamilyReceiveComponent defaultOpen />)
    expect(screen.getByText("Confirm")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /receive/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
  })

  it("renders the provided icon", () => {
    render(
      <FamilyReceiveComponent
        defaultOpen
        icon={<span data-testid="custom-icon" />}
      />
    )
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument()
  })
})

describe("FamilyReceiveComponent interaction", () => {
  it("calls onConfirm and closes when confirm is clicked", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <FamilyReceiveComponent
        defaultOpen
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    await user.click(screen.getByRole("button", { name: /receive/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("calls onCancel when cancel is clicked", async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <FamilyReceiveComponent defaultOpen onCancel={onCancel} />
    )

    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("opens the dialog when the closed trigger is clicked", async () => {
    const user = userEvent.setup()
    render(
      <FamilyReceiveComponent triggerLabel="Receive" title="Now open" />
    )

    expect(screen.queryByText("Now open")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /receive/i }))
    expect(screen.getByText("Now open")).toBeInTheDocument()
  })
})
