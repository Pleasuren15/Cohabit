import type { Meta, StoryObj } from "@storybook/react"

import { Faq6, type FaqItem } from "./faq-06"

const meta = {
  title: "ui/Faq6",
  component: Faq6,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Faq6>

export default meta
type Story = StoryObj<typeof meta>

const FAQS: FaqItem[] = [
  {
    id: "f1",
    question: "How does Cohabit help me find a roommate?",
    answer:
      "Cohabit matches you with verified roommates based on your preferences, budget, and location. Create a profile, tell us what you're looking for, and we'll surface compatible matches you can chat with directly.",
  },
  {
    id: "f2",
    question: "Are user profiles verified?",
    answer:
      "Yes. Every member can verify their phone number, email, and government ID, and some complete a credit check. Verified profiles are clearly badged so you can decide who you'd like to share a space with.",
  },
  {
    id: "f3",
    question: "Can I list a property for rent as well?",
    answer:
      "Absolutely. In addition to roommate listings you can publish rental listings with photos, pricing, deposit, and amenities. Your listings appear on your public profile and in search results.",
  },
  {
    id: "f4",
    question: "Is there a fee to use Cohabit?",
    answer:
      "Creating a profile and browsing listings is completely free. We only charge a small service fee when you successfully move into a matched or listed space through the platform.",
  },
  {
    id: "f5",
    question: "What happens if a roommate doesn't work out?",
    answer:
      "Life happens. You can update or end a shared-space arrangement at any time. Our support team is on hand to help mediate issues, and your verified profile history stays intact for future matches.",
  },
]

export const Default: Story = {
  args: {
    badge: "FAQ",
    title: "Frequently asked questions",
    faqs: FAQS,
  },
  render: () => (
    <div className="w-full">
      <Faq6
        badge="FAQ"
        title="Frequently asked questions"
        faqs={FAQS}
      />
    </div>
  ),
}

export const CustomTitle: Story = {
  args: {
    badge: "Help centre",
    title: <>Everything you need to know</>,
    faqs: FAQS.slice(0, 3),
  },
  render: () => (
    <div className="w-full">
      <Faq6
        badge="Help centre"
        title={
          <>
            Everything you need to <span className="text-accent">know</span>
          </>
        }
        faqs={FAQS.slice(0, 3)}
      />
    </div>
  ),
}
