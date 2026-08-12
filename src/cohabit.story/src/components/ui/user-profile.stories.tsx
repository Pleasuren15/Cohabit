import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"

import {
  UserProfile,
  type UserData,
  type NewListingData,
  type VerificationType,
  type Inquiry,
} from "./user-profile"
import type { CarouselCard } from "./minimal-carousel"

const meta = {
  title: "ui/UserProfile",
  component: UserProfile,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof UserProfile>

export default meta
type Story = StoryObj<typeof meta>

const mockUser: UserData = {
  id: "u1",
  firstName: "Jane",
  lastName: "Smith",
  cellphone: "+27 82 123 4567",
  email: "jane.smith@example.com",
  dateOfBirth: "1996-04-12",
  gender: "female",
  bio: "Designer looking for a sunny flatmate in Cape Town",
  isOtpVerified: true,
  timestamp: "July 2025",
}

const mockListings: CarouselCard[] = [
  {
    id: "l1",
    title: "Cozy room in Sea Point",
    value: "Sea Point, Cape Town",
    color: "bg-gradient-to-br from-rose-500 to-pink-600",
  },
  {
    id: "l2",
    title: "Sunny studio in Gardens",
    value: "Gardens, Cape Town",
    color: "bg-gradient-to-br from-violet-500 to-purple-600",
  },
  {
    id: "l3",
    title: "Shared flat near CBD",
    value: "Cape Town CBD",
    color: "bg-gradient-to-br from-blue-500 to-cyan-600",
  },
]

const mockInquiries: Inquiry[] = [
  {
    id: "i1",
    listingId: "l1",
    listingTitle: "Cozy room in Sea Point",
    type: "roommate",
    inquireeUserId: "guest-1",
    inquireeName: "Ayanda Mbeki",
    moveInDate: "2026-09-01",
    occupants: 1,
    message: "Hi! I work hybrid in the CBD and would love to view the room this weekend.",
    status: "new",
    createdAt: "2026-08-10T08:30:00.000Z",
  },
  {
    id: "i2",
    listingId: "l2",
    listingTitle: "Sunny studio in Gardens",
    type: "rentals",
    inquireeUserId: "guest-2",
    inquireeName: "Lerato Nkosi",
    moveInDate: "2026-10-15",
    occupants: 2,
    message: "We're a quiet couple relocating from Joburg. Is the studio still available?",
    status: "contacted",
    createdAt: "2026-08-09T14:05:00.000Z",
  },
  {
    id: "i3",
    listingId: "l3",
    listingTitle: "Shared flat near CBD",
    type: "roommate",
    inquireeUserId: "guest-3",
    inquireeName: "Ravi Patel",
    moveInDate: "2026-09-01",
    occupants: 1,
    message: "",
    status: "accepted",
    createdAt: "2026-08-07T11:45:00.000Z",
  },
]

export const Default: Story = {
  args: {
    user: mockUser,
    userListings: mockListings,
    verified: ["email"],
    onVerify: () => {},
    onToggleFavorite: () => {},
    onViewListing: () => {},
  },
  render: () => {
    const [verified, setVerified] = useState<VerificationType[]>(["email"])
    return (
      <div className="mx-auto w-[420px]">
        <UserProfile
          user={mockUser}
          userListings={mockListings}
          verified={verified}
          onVerify={(type) =>
            setVerified((prev) =>
              prev.includes(type) ? prev : [...prev, type],
            )
          }
          onUpdateUser={(u) => console.log("update user", u)}
          onToggleFavorite={(id) => console.log("toggle favorite", id)}
          onViewListing={(id) => console.log("view listing", id)}
          onAddListing={(data: NewListingData) => console.log("add listing", data)}
          inquiries={mockInquiries}
          onUpdateInquiryStatus={(id, status) =>
            console.log("update inquiry status", id, status)
          }
        />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Verify" }))
    const dialog = await canvas.findByRole("heading", {
      name: "Verify Your Identity",
    })
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect(dialog).toBeVisible()
    await userEvent.keyboard("{Escape}")
  },
}

export const LandlordInquiries: Story = {
  args: {
    user: mockUser,
    userListings: mockListings,
    verified: ["phone", "email"],
    onVerify: () => {},
    onToggleFavorite: () => {},
    onViewListing: () => {},
    inquiries: mockInquiries,
    onUpdateInquiryStatus: () => {},
  },
  render: () => (
    <div className="mx-auto w-[420px]">
      <UserProfile
        user={mockUser}
        userListings={mockListings}
        verified={["phone", "email"]}
        onVerify={() => {}}
        onUpdateUser={(u) => console.log("update user", u)}
        onToggleFavorite={(id) => console.log("toggle favorite", id)}
        onViewListing={(id) => console.log("view listing", id)}
        onAddListing={(data: NewListingData) => console.log("add listing", data)}
        inquiries={mockInquiries}
        onUpdateInquiryStatus={(id, status) =>
          console.log("update inquiry status", id, status)
        }
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText("In Progress", { selector: "div" })
    await new Promise((resolve) => setTimeout(resolve, 300))
  },
}

export const NoInquiries: Story = {
  args: {
    user: mockUser,
    userListings: mockListings,
    verified: ["phone", "email"],
    onVerify: () => {},
    onToggleFavorite: () => {},
    onViewListing: () => {},
    inquiries: [],
    onUpdateInquiryStatus: () => {},
  },
  render: () => (
    <div className="mx-auto w-[420px]">
      <UserProfile
        user={mockUser}
        userListings={mockListings}
        verified={["phone", "email"]}
        onVerify={() => {}}
        onToggleFavorite={(id) => console.log("toggle favorite", id)}
        onViewListing={(id) => console.log("view listing", id)}
        onAddListing={(data: NewListingData) => console.log("add listing", data)}
        inquiries={[]}
        onUpdateInquiryStatus={() => {}}
      />
    </div>
  ),
}
