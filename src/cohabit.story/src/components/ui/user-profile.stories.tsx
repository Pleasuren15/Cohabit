import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"

import {
  UserProfile,
  type UserData,
  type VerificationType,
  type NewListingData,
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
        />
      </div>
    )
  },
}
