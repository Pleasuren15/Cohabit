import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Faq6 } from "@/components/ui/faq-06"
import { SAMPLE_FAQS } from "./fixtures"

describe("Faq6 data rendering", () => {
  it("renders the badge and title", () => {
    render(<Faq6 badge="FAQ" title="Questions" faqs={SAMPLE_FAQS} />)
    expect(screen.getByText("FAQ")).toBeInTheDocument()
    expect(screen.getByText("Questions")).toBeInTheDocument()
  })

  it.each(SAMPLE_FAQS.map((f) => [f.question, f.answer]))(
    "renders question '%s' with its answer '%s' on expand",
    async (question, answer) => {
      const user = userEvent.setup()
      render(<Faq6 title="Questions" faqs={SAMPLE_FAQS} />)

      expect(screen.getByText(question)).toBeInTheDocument()
      expect(screen.queryByText(answer)).not.toBeInTheDocument()

      await user.click(screen.getByText(question))
      expect(await screen.findByText(answer)).toBeInTheDocument()
    }
  )

  it("numbers the questions sequentially", () => {
    render(<Faq6 title="Questions" faqs={SAMPLE_FAQS} />)
    SAMPLE_FAQS.forEach((faq, index) => {
      expect(screen.getByText(`Q${index + 1}`)).toBeInTheDocument()
    })
  })

  it("renders without error for an empty faq list", () => {
    expect(() => render(<Faq6 title="Questions" faqs={[]} />)).not.toThrow()
  })
})
