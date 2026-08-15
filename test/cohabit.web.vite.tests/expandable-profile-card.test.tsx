import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ExpandableProfileCard } from "@/components/ui/expandable-profile-card"
import { makeProfile } from "./fixtures"

const VERIFICATION_LABELS: Record<string, string> = {
  phone: "Phone",
  email: "Email",
  id: "ID",
}

describe("ExpandableProfileCard data rendering", () => {
  it.each([
    makeProfile({ id: "p1", name: "Alice Waters", location: "Sea Point, Cape Town" }),
    makeProfile({ id: "p2", name: "Bob Zondo", location: "Gardens, Cape Town" }),
    makeProfile({
      id: "p3",
      name: "Carol Smith",
      location: "Observatory, Cape Town",
      price: 12000,
    }),
  ])("renders name and location for $name", (profile) => {
    render(<ExpandableProfileCard {...profile} />)
    expect(screen.getByText(profile.name)).toBeInTheDocument()
    expect(screen.getByText(profile.location)).toBeInTheDocument()
  })

  it.each([500, 7500, 12000])(
    "formats price %s using the en-ZA locale",
    (price) => {
      render(<ExpandableProfileCard name="A" location="L" price={price} />)
      const formatted = price
        .toLocaleString("en-ZA")
        .replace(/\s+/g, "\\s+")
      const priceElement = screen.getByText(
        new RegExp(`R\\s+${formatted}`)
      )
      expect(priceElement).toHaveTextContent("/month")
    }
  )

  it("hides the price when it is not provided", () => {
    render(
      <ExpandableProfileCard name="A" location="L" price={undefined} />
    )
    expect(screen.queryByText("/month")).not.toBeInTheDocument()
  })

  it.each([
    { verified: ["phone"] as const, expected: ["Phone"] },
    { verified: ["phone", "email"] as const, expected: ["Phone", "Email"] },
    { verified: ["id"] as const, expected: ["ID"] },
  ])("renders verification badges for $expected", ({ verified, expected }) => {
    render(
      <ExpandableProfileCard name="A" location="L" verified={[...verified]} />
    )
    for (const label of expected) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it("renders no verification badges when verified is empty", () => {
    render(<ExpandableProfileCard name="A" location="L" verified={[]} />)
    for (const label of Object.values(VERIFICATION_LABELS)) {
      expect(screen.queryByText(label)).not.toBeInTheDocument()
    }
  })

  it("shows the photo count badge when provided", () => {
    render(<ExpandableProfileCard name="A" location="L" photoCount={6} />)
    expect(screen.getByText("6")).toBeInTheDocument()
  })

  it("omits the photo count badge when not provided", () => {
    render(
      <ExpandableProfileCard
        name="A"
        location="L"
        photoCount={undefined}
      />
    )
    expect(screen.queryByText("6")).not.toBeInTheDocument()
  })

  it("shows the Featured badge when featured is true", () => {
    render(<ExpandableProfileCard name="A" location="L" featured />)
    expect(screen.getByText("Featured")).toBeInTheDocument()
  })

  it("omits the Featured badge when not featured", () => {
    render(<ExpandableProfileCard name="A" location="L" featured={false} />)
    expect(screen.queryByText("Featured")).not.toBeInTheDocument()
  })
})

describe("ExpandableProfileCard interaction", () => {
  it("calls onToggleFavorite with the profile id", async () => {
    const user = userEvent.setup()
    const onToggleFavorite = vi.fn()
    render(
      <ExpandableProfileCard
        {...makeProfile({ id: "profile-x", name: "A", location: "L" })}
        onToggleFavorite={onToggleFavorite}
      />
    )

    await user.click(screen.getByRole("button", { name: /add to favorites/i }))
    expect(onToggleFavorite).toHaveBeenCalledWith("profile-x")
  })

  it("labels the favorite button as favorited when isFavorited is true", () => {
    render(
      <ExpandableProfileCard
        {...makeProfile({ id: "profile-x", name: "A", location: "L" })}
        isFavorited
        onToggleFavorite={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: /remove from favorites/i })
    ).toBeInTheDocument()
  })

  it("calls onView with the profile id", async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    render(
      <ExpandableProfileCard
        {...makeProfile({ id: "profile-x", name: "A", location: "L" })}
        onView={onView}
      />
    )

    await user.click(screen.getByRole("button", { name: /^view$/i }))
    expect(onView).toHaveBeenCalledWith("profile-x")
  })

  it("expands to reveal the bio and map link", async () => {
    const user = userEvent.setup()
    render(
      <ExpandableProfileCard
        {...makeProfile({
          name: "Alice Waters",
          location: "L",
          bio: "A short bio",
          mapAddress: "Sea Point, Cape Town",
        })}
      />
    )

    expect(screen.queryByText("A short bio")).not.toBeInTheDocument()

    const header = screen.getByRole("button", { expanded: false })
    await user.click(header)

    expect(screen.getByText("A short bio")).toBeInTheDocument()
    expect(screen.getByText(/view on map/i)).toBeInTheDocument()
  })
})
