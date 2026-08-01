import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { EditProfile } from "@/components/ui/edit-profile"
import type { ProfileData } from "@/components/ui/edit-profile"

const INITIAL_DATA: ProfileData = {
  fullName: "Thabo Mokoena",
  email: "thabo@example.com",
  cellphone: "+27 82 123 4567",
  dateOfBirth: "1994-05-12",
  gender: "male",
  title: "Creative designer",
  avatarUrl: "https://example.com/avatar.jpg",
}

function renderEdit(overrides: Partial<typeof INITIAL_DATA> = {}) {
  const onClose = vi.fn()
  const onSave = vi.fn()
  const initialData = { ...INITIAL_DATA, ...overrides }

  const view = render(
    <EditProfile
      isOpen
      onClose={onClose}
      initialData={initialData}
      onSave={onSave}
    />
  )

  return { onClose, onSave, initialData, view }
}

describe("EditProfile data rendering", () => {
  it.each([
    { field: "fullName", value: "Thabo Mokoena" },
    { field: "email", value: "thabo@example.com" },
    { field: "cellphone", value: "+27 82 123 4567" },
    { field: "dateOfBirth", value: "1994-05-12" },
    { field: "title", value: "Creative designer" },
    { field: "avatarUrl", value: "https://example.com/avatar.jpg" },
  ])("pre-fills the $field field with '$value'", ({ field, value }) => {
    renderEdit()
    expect(screen.getByTitle(field)).toHaveValue(value)
  })

  it("preselects the user's gender", () => {
    renderEdit({ gender: "female" })
    expect(screen.getByTitle("gender")).toHaveValue("female")
  })

  it("renders nothing when closed", () => {
    const { container } = render(
      <EditProfile
        isOpen={false}
        onClose={() => {}}
        initialData={INITIAL_DATA}
        onSave={() => {}}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })
})

describe("EditProfile interaction", () => {
  it("saves the edited data when Save changes is clicked", async () => {
    const user = userEvent.setup()
    const { onSave } = renderEdit()

    const nameInput = screen.getByTitle("fullName")
    await user.clear(nameInput)
    await user.type(nameInput, "Thabo M.")

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    expect(onSave).toHaveBeenCalledWith({
      ...INITIAL_DATA,
      fullName: "Thabo M.",
    })
  })

  it("calls onClose when cancel is clicked", async () => {
    const user = userEvent.setup()
    const { onClose } = renderEdit()

    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
