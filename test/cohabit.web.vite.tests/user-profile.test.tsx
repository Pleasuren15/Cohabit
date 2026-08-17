import { describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserProfile } from "@/components/ui/user-profile"
import type { Inquiry } from "@/services/inquiries-service"
import { makeProfile, makeUser } from "./fixtures"

const VERIFICATION_LABELS = ["Phone", "Email", "ID"]

function renderProfile(
  overrides: Partial<{
    user: ReturnType<typeof makeUser>
    userListings: ReturnType<typeof makeProfile>[]
    verified: string[]
    inquiries: Inquiry[]
  }> = {}
) {
  const user = overrides.user ?? makeUser()
  const userListings = overrides.userListings ?? []
  const verified = overrides.verified ?? ["phone", "email"]
  const inquiries = overrides.inquiries ?? []
  const onVerify = vi.fn()
  const onToggleFavorite = vi.fn()
  const onViewListing = vi.fn()
  const onUpdateInquiryStatus = vi.fn()
  const onUpdateUser = vi.fn()

  const view = render(
    <UserProfile
      user={user}
      userListings={userListings}
      verified={verified}
      onVerify={onVerify}
      onUpdateUser={onUpdateUser}
      onToggleFavorite={onToggleFavorite}
      onViewListing={onViewListing}
      inquiries={inquiries}
      onUpdateInquiryStatus={onUpdateInquiryStatus}
    />
  )

  return {
    user,
    userListings,
    verified,
    onVerify,
    onUpdateUser,
    onUpdateInquiryStatus,
    view,
  }
}

function makeInquiry(overrides: Partial<Inquiry> = {}): Inquiry {
  return {
    id: "i1",
    listingId: "l1",
    listingTitle: "Sea Point Flat",
    listingImageSrc: "https://example.com/1.jpg",
    type: "rentals",
    inquireeUserId: "guest-1",
    inquireeName: "Ayanda Mbeki",
    moveInDate: "2026-09-15",
    occupants: 1,
    message: "Hi, is this still available?",
    status: "new",
    createdAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  }
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

  it("renders a listing count and shows the active listing title", () => {
    const userListings = [
      makeProfile({ id: "l1", name: "Sea Point Flat" }),
      makeProfile({ id: "l2", name: "Umhlanga Room" }),
    ]
    renderProfile({ userListings })

    expect(screen.getByText("(2)")).toBeInTheDocument()
    const active = userListings[0]
    expect(screen.getByText(active.name)).toBeInTheDocument()
    for (const listing of userListings.slice(1)) {
      expect(screen.queryByText(listing.name)).not.toBeInTheDocument()
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

describe("UserProfile inquiries dashboard", () => {
  const listings = [makeProfile({ id: "l1", name: "Sea Point Flat" })]

  it("shows inquiries for the user's listings with status", () => {
    renderProfile({ userListings: listings, inquiries: [makeInquiry()] })

    expect(screen.getByText("Ayanda Mbeki")).toBeInTheDocument()
    // Appears in both the listing carousel and the inquiry card.
    expect(screen.getAllByText("Sea Point Flat").length).toBeGreaterThan(0)
    expect(screen.getByText("New")).toBeInTheDocument()
    expect(screen.getByText("1 total")).toBeInTheDocument()
    expect(screen.getByText("1 new")).toBeInTheDocument()
  })

  it("shows the move-in date and occupant count", () => {
    renderProfile({
      userListings: listings,
      inquiries: [makeInquiry({ occupants: 2 })],
    })

    expect(screen.getByText(/moves in/i)).toBeInTheDocument()
    expect(screen.getByText(/2 occupants/i)).toBeInTheDocument()
  })

  it("calls onUpdateInquiryStatus when an inquiry is accepted", async () => {
    const user = userEvent.setup()
    const { onUpdateInquiryStatus } = renderProfile({
      userListings: listings,
      inquiries: [makeInquiry()],
    })

    await user.click(screen.getByRole("button", { name: /^accept$/i }))
    expect(onUpdateInquiryStatus).toHaveBeenCalledWith("i1", "accepted")
  })

  it("calls onUpdateInquiryStatus when an inquiry is declined", async () => {
    const user = userEvent.setup()
    const { onUpdateInquiryStatus } = renderProfile({
      userListings: listings,
      inquiries: [makeInquiry()],
    })

    await user.click(screen.getByRole("button", { name: /^decline$/i }))
    expect(onUpdateInquiryStatus).toHaveBeenCalledWith("i1", "declined")
  })

  it("hides response actions for finalised inquiries", () => {
    renderProfile({
      userListings: listings,
      inquiries: [makeInquiry({ status: "accepted" })],
    })

    expect(screen.queryByRole("button", { name: /^accept$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^decline$/i })).not.toBeInTheDocument()
  })

  it("shows an empty state when the user has listings but no inquiries", () => {
    renderProfile({ userListings: listings })

    expect(
      screen.getByText(/no inquiries yet/i)
    ).toBeInTheDocument()
  })
})

vi.mock("@/services/auth-service", () => ({
  authService: {
    updateProfileMetadata: vi.fn().mockResolvedValue(undefined),
  },
}))

describe("UserProfile 'Still missing' completion forms", () => {
  // A user with every completion step outstanding.
  const missingUser = makeUser({
    bio: "",
    cellphone: "",
    dateOfBirth: "",
    address: "",
    avatarUrl: "",
  })

  /** Finds the row for a completion step and returns its Add button. */
  function addButtonFor(label: string) {
    const labelNode = screen.getByText(label)
    const row = labelNode.closest('[class*="border-dashed"]')
    if (!row) throw new Error(`Missing step row not found for "${label}"`)
    return within(row as HTMLElement).getByRole("button", { name: /^add$/i })
  }

  it("opens a dedicated form (not the full edit form) for a missing step", async () => {
    const user = userEvent.setup()
    renderProfile({ user: missingUser, verified: [] })

    await user.click(addButtonFor("Add a profile photo"))

    expect(
      screen.getByRole("dialog", { name: /add a profile photo/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("dialog", { name: /edit your profile/i })
    ).not.toBeInTheDocument()
  })

  it("saves a bio from the dedicated bio form", async () => {
    const user = userEvent.setup()
    const { onUpdateUser } = renderProfile({
      user: missingUser,
      verified: [],
    })

    await user.click(addButtonFor("Add a bio"))
    await user.type(
      screen.getByLabelText(/bio/i),
      "Software engineer who loves cooking"
    )
    await user.click(screen.getByRole("button", { name: /^save$/i }))

    expect(onUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        bio: "Software engineer who loves cooking",
      })
    )
    expect(
      screen.queryByRole("dialog", { name: /tell us about yourself/i })
    ).not.toBeInTheDocument()
  })

  it("saves a phone number from the dedicated phone form", async () => {
    const user = userEvent.setup()
    const { onUpdateUser } = renderProfile({
      user: missingUser,
      verified: [],
    })

    await user.click(addButtonFor("Add your phone number"))
    const dialog = screen.getByRole("dialog", {
      name: /add your phone number/i,
    })
    await user.type(
      within(dialog).getByLabelText(/phone number/i),
      "+27 71 555 0100"
    )
    await user.click(within(dialog).getByRole("button", { name: /^save$/i }))

    expect(onUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({ cellphone: "+27 71 555 0100" })
    )
  })

  it("saves a date of birth from the dedicated dob form", async () => {
    const user = userEvent.setup()
    const { onUpdateUser } = renderProfile({
      user: missingUser,
      verified: [],
    })

    await user.click(addButtonFor("Add your date of birth"))
    const dialog = screen.getByRole("dialog", {
      name: /add your date of birth/i,
    })
    await user.type(
      within(dialog).getByLabelText(/date of birth/i),
      "1996-04-12"
    )
    await user.click(within(dialog).getByRole("button", { name: /^save$/i }))

    expect(onUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({ dateOfBirth: "1996-04-12" })
    )
  })

  it("saves an address from the dedicated address form", async () => {
    const user = userEvent.setup()
    const { onUpdateUser } = renderProfile({
      user: missingUser,
      verified: [],
    })

    await user.click(addButtonFor("Add your address"))
    const dialog = screen.getByRole("dialog", {
      name: /add your address/i,
    })
    await user.type(
      within(dialog).getByLabelText(/address/i),
      "Observatory, Cape Town"
    )
    await user.click(within(dialog).getByRole("button", { name: /^save$/i }))

    expect(onUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({ address: "Observatory, Cape Town" })
    )
  })

  it("confirms the email address and marks it verified", async () => {
    const user = userEvent.setup()
    const { onUpdateUser, onVerify } = renderProfile({
      user: missingUser,
      verified: [],
    })

    await user.click(addButtonFor("Confirm your email address"))
    const dialog = screen.getByRole("dialog", {
      name: /confirm your email address/i,
    })
    const emailInput = within(dialog).getByLabelText(/email address/i)
    await user.clear(emailInput)
    await user.type(emailInput, "thabo@example.com")
    await user.click(
      within(dialog).getByRole("button", { name: /^confirm$/i })
    )

    expect(onVerify).toHaveBeenCalledWith("email")
    expect(onUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "thabo@example.com" })
    )
  })

  it("saves a profile photo URL from the dedicated photo form", async () => {
    const user = userEvent.setup()
    const { onUpdateUser } = renderProfile({
      user: missingUser,
      verified: [],
    })

    await user.click(addButtonFor("Add a profile photo"))
    await user.type(
      screen.getByLabelText(/photo url/i),
      "https://example.com/me.jpg"
    )
    await user.click(screen.getByRole("button", { name: /^save$/i }))

    expect(onUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({ avatarUrl: "https://example.com/me.jpg" })
    )
  })

  it("keeps the Save button disabled while the field is empty", async () => {
    const user = userEvent.setup()
    renderProfile({ user: missingUser, verified: [] })

    await user.click(addButtonFor("Add a bio"))

    expect(
      screen.getByRole("button", { name: /^save$/i })
    ).toBeDisabled()
  })
})
