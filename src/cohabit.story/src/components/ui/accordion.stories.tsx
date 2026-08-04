import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { Wifi, Flame, Droplets } from "lucide-react"

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion"

const meta = {
  title: "ui/Accordion",
  component: Accordion,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  args: { type: "single" as const },
  render: () => (
    <div className="w-full max-w-md">
      <Accordion type="single" collapsible defaultValue="rent">
        <AccordionItem value="rent">
          <AccordionTrigger>Monthly rent</AccordionTrigger>
          <AccordionContent>
            Rent is due on the 1st and split evenly between housemates.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="bills">
          <AccordionTrigger>Shared bills</AccordionTrigger>
          <AccordionContent>
            Internet, hydro and water are billed every month.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="chores">
          <AccordionTrigger>Chores rota</AccordionTrigger>
          <AccordionContent>
            The rota rotates weekly and covers kitchen duty.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
}

export const Multiple: Story = {
  args: { type: "multiple" as const },
  render: () => (
    <div className="w-full max-w-md">
      <Accordion type="multiple" defaultValue={["house-rules"]}>
        <AccordionItem value="house-rules">
          <AccordionTrigger>House rules</AccordionTrigger>
          <AccordionContent>
            Quiet hours are 11pm to 7am on weekdays.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guests">
          <AccordionTrigger>Guest policy</AccordionTrigger>
          <AccordionContent>
            Guests are welcome; just let the household know in advance.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="maintenance">
          <AccordionTrigger>Maintenance requests</AccordionTrigger>
          <AccordionContent>
            Submit maintenance requests through the household feed.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const guestPolicy = canvas.getByRole("button", { name: "Guest policy" })
    const content = () =>
      within(canvasElement).queryByText("Guests are welcome; just let the household know in advance.")
    await expect(content()).not.toBeInTheDocument()
    await userEvent.click(guestPolicy)
    await expect(content()).toBeVisible()
    await userEvent.click(guestPolicy)
    await expect(content()).not.toBeInTheDocument()
  },
}

export const WithIcons: Story = {
  args: { type: "single" as const },
  render: () => (
    <div className="w-full max-w-md">
      <Accordion type="single" collapsible>
        <AccordionItem value="internet">
          <AccordionTrigger>
            <Wifi /> Internet
          </AccordionTrigger>
          <AccordionContent>
            600 Mbps fiber; password is in the kitchen drawer.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="heating">
          <AccordionTrigger>
            <Flame /> Heating
          </AccordionTrigger>
          <AccordionContent>
            Thermostat is on a schedule; avoid overriding overnight.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="water">
          <AccordionTrigger>
            <Droplets /> Water
          </AccordionTrigger>
          <AccordionContent>
            Hard water area; the kettle needs descaling weekly.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
}

export const Disabled: Story = {
  args: { type: "single" as const },
  render: () => (
    <div className="w-full max-w-md">
      <Accordion type="single" collapsible>
        <AccordionItem value="lease">
          <AccordionTrigger>Lease renewal</AccordionTrigger>
          <AccordionContent>
            Renewal paperwork is due before the end of the month.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="moving" disabled>
          <AccordionTrigger>Moving out</AccordionTrigger>
          <AccordionContent>You must give 60 days notice.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="guests">
          <AccordionTrigger>Overnight guests</AccordionTrigger>
          <AccordionContent>
            Guests are welcome, just let the household know.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
}

export const FAQ: Story = {
  args: { type: "single" as const },
  render: () => (
    <div className="w-full max-w-md">
      <Accordion type="single" collapsible>
        <AccordionItem value="what">
          <AccordionTrigger>What is Cohabit?</AccordionTrigger>
          <AccordionContent>
            Cohabit is a shared housing app for tracking rent, bills and chores
            across your household.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="cost">
          <AccordionTrigger>How much does it cost?</AccordionTrigger>
          <AccordionContent>
            The basic household plan is free. Premium features cost $5 per
            household per month.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="join">
          <AccordionTrigger>How do I join a household?</AccordionTrigger>
          <AccordionContent>
            Ask your roommate to send an invite from the Household tab, then
            accept it in your inbox.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="split">
          <AccordionTrigger>Can I split bills unevenly?</AccordionTrigger>
          <AccordionContent>
            Yes — every bill can be split by custom percentages or by a fixed
            amount per person.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
}
