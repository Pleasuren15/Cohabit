import { describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserProfile } from "@/components/ui/user-profile"
import { makeProfile, makeUser } from "./fixtures"

const VERIFICATION_LABELS = ["Phone", "Email", "ID", "Credit"]

function renderProfile(
  overrides: Partial<{
    user: ReturnType<typeof makeUser>
    userListings: ReturnType<typeof makeProfile>[]
    verified: string[]
  }> = {}
) {
  const user = overrides.user ?? makeUser()
  const userListings = overrides.userListings ?? []
  const verified = overrides.verified ?? ["phone", "email"]
  const onVerify = vi.fn()
  const onToggleFavorite = vi.fn()
  const onViewListing = vi.fn()

  const view = render(
    <UserProfile
      user={user}
      userListings={userListings}
      verified={verified}
      onVerify={onVerify}
      onToggleFavorite={onToggleFavorite}
      onViewListing={onViewListing}
    />
  )

  return { user, userListings, verified, onVerify, view }
}

describe("UserProfile data rendering", () => {
  it("renders the full name and bio", () => {
    renderProfile({ user: makeUser({ firstName: "Thabo", lastName: "Mokoena", bio: "Creative designer" }) })
    expect(screen.getByText("Thabo Mokoena")).toBeInTheDocument()
    expect(screen.getByText("Creative designer")).toBeInTheDocument()
  })

  it.each([
    { field: "cellphone", value: "+27 82 123 4567" },
    { field: "email", value: "thabo@example.com" },
    { field: "dateOfBirth", value: "1994-05-12" },
    { field: "timestamp", value: "June 2025" },
  ])("renders the $field value '$value'", ({ value }) => {
    renderProfile()
    expect(screen.getByText(value)).toBeInTheDocument()
  })

  it("capitalises the gender label", () => {
    renderProfile({ user: makeUser({ gender: "female" }) })
    expect(screen.getByText("Female")).toBeInTheDocument()
  })

  it("falls back to a default member-since date", () => {
    renderProfile({ user: makeUser({ timestamp: undefined }) })
    expect(screen.getByText("July 2025")).toBeInTheDocument()
  })

  it.each(VERIFICATION_LABELS)("lists the %s verification", (label) => {
    renderProfile()
    const section = screen.getByText("Verifications").closest(".rounded-2xl")!
    expect(within(section).getByText(label)).toBeInTheDocument()
  })

  it("shows an empty state when the user has no listings", () => {
    renderProfile({ userListings: [] })
    expect(
      screen.getByText(/you haven't created any listings yet/i)
    ).toBeInTheDocument()
  })

  it("renders a listing count and each listing title", () => {
    const userListings = [
      makeProfile({ id: "l1", name: "Sea Point Flat" }),
      makeProfile({ id: "l2", name: "Umhlanga Room" }),
    ]
    renderProfile({ userListings })

    expect(screen.getByText("(2)")).toBeInTheDocument()
    for (const listing of userListings) {
      expect(screen.getByText(listing.name)).toBeInTheDocument()
    }
  })
})

describe("UserProfile interaction", () => {
  it("calls onVerify with the verification type from the dialog", async () => {
    const user = userEvent.setup()
    const { onVerify } = renderProfile({ verified: ["phone"] })

    await user.click(screen.getByRole("button", { name: /^verify$/i }))
    await user.click(
      screen.getByRole("button", { name: /email verification/i })
    )

    expect(onVerify).toHaveBeenCalledWith("email")
  })

  it("disables already-verified options in the verify dialog", async () => {
    const user = userEvent.setup()
    const { onVerify } = renderProfile({ verified: ["phone"] })

    await user.click(screen.getByRole("button", { name: /^verify$/i }))
    const phoneButton = screen.getByRole("button", {
      name: /phone verification/i,
    })
    expect(phoneButton).toBeDisabled()

    await user.click(phoneButton)
    expect(onVerify).not.toHaveBeenCalled()
  })

  it("shows the new listing dialog when Add is clicked", async () => {
    const user = userEvent.setup()
    renderProfile()

    await user.click(screen.getByRole("button", { name: /new listing/i }))
    expect(screen.getByText("New Listing")).toBeInTheDocument()
  })
})
