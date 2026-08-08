import type { Meta, StoryObj } from "@storybook/react"

import { DetailPage, type DetailListing } from "./detail-page"

const listing: DetailListing = {
  id: "lst-001",
  title: "Sunny room in Observatory",
  location: "Observatory, Cape Town",
  address: "12 Lower Main Road, Observatory, Cape Town",
  price: 6500,
  priceUnit: "/month",
  type: "Shared room",
  rating: 4.8,
  reviews: 23,
  amenities: [
    "Wi-Fi",
    "Electricity included",
    "Water included",
    "Parking",
    "Shared kitchen",
  ],
  description:
    "A bright and spacious room in a friendly shared home, minutes from UCT and the Lower Main Road buzz. The house has a sunny garden, fast fibre and a well-equipped kitchen.",
  host: {
    name: "Nomvula Dlamini",
    avatarUrl: "https://picsum.photos/seed/nomvula/200/200",
  },
  availableFrom: "1 September 2026",
}

const meta = {
  title: "ui/DetailPage",
  component: DetailPage,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof DetailPage>

export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    listing: null,
    onBack: () => {},
  },
}

export const Populated: Story = {
  args: {
    listing,
  },
}

export const PopulatedWithImage: Story = {
  args: {
    listing: {
      ...listing,
      id: "lst-002",
      title: "Garden cottage in Rosebank",
      location: "Rosebank, Johannesburg",
      address: "18 Jellicoe Avenue, Rosebank, Johannesburg",
      price: 8200,
      imageSrc: "https://picsum.photos/seed/house/400/300",
      type: "Cottage",
      rating: 4.9,
      reviews: 41,
      amenities: [
        "Furnished",
        "Backup power",
        "Secure parking",
        "Fibre",
        "Garden",
      ],
      host: {
        name: "Sipho Mbeki",
        avatarUrl: "https://picsum.photos/seed/sipho/200/200",
      },
    },
    onBack: () => {},
  },
}
