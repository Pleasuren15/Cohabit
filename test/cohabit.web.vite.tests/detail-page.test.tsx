import { describe, expect, it, vi } from "vitest"
import { render, screen, within, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DetailPage } from "@/components/ui/detail-page"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AMENITIES } from "@/lib/amenities"
import { makeProfile, SAMPLE_RELATED_LISTINGS } from "./fixtures"

function renderDetail(
  overrides: Partial<ReturnType<typeof makeProfile>> = {},
  {
    relatedListings = [],
    isFavorited = false,
  }: {
    relatedListings?: typeof SAMPLE_RELATED_LISTINGS
    isFavorited?: boolean
  } = {}
) {
  const onBack = vi.fn()
  const onRequestView = vi.fn()
  const onToggleFavorite = vi.fn()
  const onViewRelated = vi.fn()
  const onReport = vi.fn()

  const view = render(
    <TooltipProvider>
      <DetailPage
        {...makeProfile(overrides)}
        relatedListings={relatedListings}
        isFavorited={isFavorited}
        onBack={onBack}
        onRequestView={onRequestView}
        onToggleFavorite={onToggleFavorite}
        onViewRelated={onViewRelated}
        onReport={onReport}
      />
    </TooltipProvider>
  )

  return { onBack, onRequestView, onToggleFavorite, onViewRelated, onReport, view }
}

function formattedRegex(value: number) {
  return new RegExp(
    `R\\s+${value.toLocaleString("en-ZA").replace(/\s+/g, "\\s+")}`
  )
}

describe("DetailPage data rendering", () => {
  it.each([
    makeProfile({ id: "p1", name: "Sea Point Flat", location: "Sea Point, Cape Town", price: 7500 }),
    makeProfile({ id: "p2", name: "Umhlanga Room", location: "Umhlanga, Durban", price: 12000 }),
  ])("renders name, location and price for $name", (profile) => {
    renderDetail({
      name: profile.name,
      location: profile.location,
      price: profile.price,
    })

    expect(
      screen.getAllByText(profile.name).length
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText(profile.location).length
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText(formattedRegex(profile.price)).length
    ).toBeGreaterThan(0)
  })

  it.each([
    { beds: 1, baths: 1, availableFrom: "1 Sep 2026", deposit: 5000 },
    { beds: 3, baths: 2, availableFrom: "Immediately", deposit: 14000 },
  ])("renders the key facts for a $beds bed / $baths bath home", (facts) => {
    renderDetail(facts)

    const factsGrid = screen.getByText("Bedrooms").closest(".grid-cols-4")!
    expect(
      within(factsGrid).getAllByText(`${facts.beds}`).length
    ).toBeGreaterThan(0)
    expect(
      within(factsGrid).getAllByText(`${facts.baths}`).length
    ).toBeGreaterThan(0)
    expect(within(factsGrid).getByText(facts.availableFrom)).toBeInTheDocument()
    expect(
      within(factsGrid).getByText(formattedRegex(facts.deposit))
    ).toBeInTheDocument()
  })

  it.each([
    { verified: ["phone"], expectCall: true, expectEmail: false },
    { verified: ["email"], expectCall: false, expectEmail: true },
    { verified: ["phone", "email"], expectCall: true, expectEmail: true },
    { verified: [], expectCall: false, expectEmail: false },
  ])(
    "renders contact actions based on verifications $verified",
    ({ verified, expectCall, expectEmail }) => {
      renderDetail({ verified: [...verified] })

      const call = screen.queryByRole("link", { name: /^call$/i })
      const email = screen.queryByRole("link", { name: /^email$/i })

      expect(Boolean(call)).toBe(expectCall)
      expect(Boolean(email)).toBe(expectEmail)
    }
  )

  it.each([
    { rules: ["No smoking"], expected: ["No smoking"] },
    {
      rules: ["No smoking", "Pets welcome", "Quiet after 10pm"],
      expected: ["No smoking", "Pets welcome", "Quiet after 10pm"],
    },
    { rules: [], expected: [] },
  ])("renders the home rules from the data", ({ rules, expected }) => {
    renderDetail({ rules })
    for (const rule of expected) {
      expect(screen.getByText(rule)).toBeInTheDocument()
    }
  })

  it("renders only the listed amenities", () => {
    const { view } = renderDetail({ amenities: ["Wi-Fi", "Gym"] })

    const amenitiesRow = view.container.querySelector(".overflow-x-auto")!
    expect(amenitiesRow.querySelectorAll("span")).toHaveLength(2)
  })

  it("renders all amenities when the listing specifies none", () => {
    const { view } = renderDetail({ amenities: [] })

    const amenitiesRow = view.container.querySelector(".overflow-x-auto")!
    expect(amenitiesRow.querySelectorAll("span")).toHaveLength(AMENITIES.length)
  })

  it("shows the response time", () => {
    renderDetail({ responseTime: "Within the hour" })
    expect(
      screen.getByText(/responds within the hour/i)
    ).toBeInTheDocument()
  })
})

describe("DetailPage related listings", () => {
  it("renders up to four related listings", () => {
    renderDetail({}, { relatedListings: SAMPLE_RELATED_LISTINGS })

    expect(
      screen.getByRole("heading", { name: /more listings/i })
    ).toBeInTheDocument()
    for (let i = 1; i <= 4; i++) {
      expect(screen.getByText(`Related Listing ${i}`)).toBeInTheDocument()
    }
  })

  it("shows a +N more count when there are more than four", () => {
    renderDetail({}, { relatedListings: SAMPLE_RELATED_LISTINGS })
    expect(screen.getByText(/\+2 more listings/i)).toBeInTheDocument()
  })

  it("calls onViewRelated when a related listing is clicked", async () => {
    const user = userEvent.setup()
    const { onViewRelated } = renderDetail(
      {},
      { relatedListings: SAMPLE_RELATED_LISTINGS }
    )

    await user.click(
      screen.getByRole("button", { name: /related listing 2/i })
    )
    expect(onViewRelated).toHaveBeenCalledWith("related-2")
  })
})

describe("DetailPage interaction", () => {
  it("calls onBack when the back button is clicked", async () => {
    const user = userEvent.setup()
    const { onBack } = renderDetail()

    await user.click(screen.getByRole("button", { name: /go back/i }))
    expect(onBack).toHaveBeenCalled()
  })

  /** Opens the inquiry form, fills it out and submits. */
  async function submitInquiryForm(user: ReturnType<typeof userEvent.setup>) {
    await user.selectOptions(
      screen.getByLabelText(/number of occupants/i),
      "2"
    )
    fireEvent.change(screen.getByLabelText(/move-in date/i), {
      target: { value: "2026-10-01" },
    })
    await user.type(
      screen.getByLabelText(/message to host/i),
      "Keen to view this weekend!"
    )
    await user.click(screen.getByRole("button", { name: /send request/i }))
  }

  it("calls onRequestView with inquiry details from the sticky request button", async () => {
    const user = userEvent.setup()
    const { onRequestView } = renderDetail()

    await user.click(
      screen.getByRole("button", { name: /request to view/i })
    )
    expect(
      screen.getByRole("dialog", { name: /request to view/i })
    ).toBeInTheDocument()

    await submitInquiryForm(user)

    expect(onRequestView).toHaveBeenCalledWith("profile-1", {
      moveInDate: "2026-10-01",
      occupants: 2,
      message: "Keen to view this weekend!",
    })
  })

  it("calls onRequestView with inquiry details from the availability question", async () => {
    const user = userEvent.setup()
    const { onRequestView } = renderDetail()

    await user.click(
      screen.getByRole("button", { name: /is this still available/i })
    )
    expect(
      screen.getByRole("dialog", { name: /request to view/i })
    ).toBeInTheDocument()

    await submitInquiryForm(user)

    expect(onRequestView).toHaveBeenCalledWith("profile-1", {
      moveInDate: "2026-10-01",
      occupants: 2,
      message: "Keen to view this weekend!",
    })
  })

  it("keeps the inquiry form open until required fields are filled", async () => {
    const user = userEvent.setup()
    const { onRequestView } = renderDetail()

    await user.click(
      screen.getByRole("button", { name: /request to view/i })
    )
    fireEvent.change(screen.getByLabelText(/move-in date/i), {
      target: { value: "" },
    })
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(
      screen.getByRole("dialog", { name: /request to view/i })
    ).toBeInTheDocument()
    expect(onRequestView).not.toHaveBeenCalled()
  })

  it("calls onToggleFavorite with the listing id", async () => {
    const user = userEvent.setup()
    const { onToggleFavorite } = renderDetail({ id: "listing-1" })

    await user.click(
      screen.getByRole("button", { name: /add to favorites/i })
    )
    expect(onToggleFavorite).toHaveBeenCalledWith("listing-1")
  })
})

describe("DetailPage report flow", () => {
  it("opens the report dialog from the report listing button", async () => {
    const user = userEvent.setup()
    renderDetail()

    await user.click(
      screen.getByRole("button", { name: /report this listing/i })
    )

    expect(
      screen.getByRole("dialog", { name: /report this listing/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /it's a scam/i })
    ).toBeInTheDocument()
  })

  it("calls onReport with the chosen reason and details", async () => {
    const user = userEvent.setup()
    const { onReport } = renderDetail({ id: "listing-1" })

    await user.click(
      screen.getByRole("button", { name: /report this listing/i })
    )
    await user.click(
      screen.getByRole("button", { name: /it's a scam/i })
    )
    await user.type(
      screen.getByLabelText(/report details/i),
      "Asking for an e-wallet deposit before a viewing."
    )
    await user.click(screen.getByRole("button", { name: /submit report/i }))

    expect(onReport).toHaveBeenCalledWith("listing-1", {
      reason: "scam",
      details: "Asking for an e-wallet deposit before a viewing.",
    })
  })

  it("keeps the submit disabled until a reason is selected", async () => {
    const user = userEvent.setup()
    const { onReport } = renderDetail()

    await user.click(
      screen.getByRole("button", { name: /report this listing/i })
    )

    expect(
      screen.getByRole("button", { name: /submit report/i })
    ).toBeDisabled()

    await user.click(
      screen.getByRole("button", { name: /misleading information/i })
    )

    expect(
      screen.getByRole("button", { name: /submit report/i })
    ).toBeEnabled()
    expect(onReport).not.toHaveBeenCalled()
  })

  it("submits without details when the description is empty", async () => {
    const user = userEvent.setup()
    const { onReport } = renderDetail({ id: "listing-1" })

    await user.click(
      screen.getByRole("button", { name: /report this listing/i })
    )
    await user.click(
      screen.getByRole("button", { name: /deposit or payment fraud/i })
    )
    await user.click(screen.getByRole("button", { name: /submit report/i }))

    expect(onReport).toHaveBeenCalledWith("listing-1", {
      reason: "fraud",
      details: undefined,
    })
  })
})
