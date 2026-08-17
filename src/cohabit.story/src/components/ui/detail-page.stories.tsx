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
  availableFrom: "1 Sep 2026",
  deposit: 6500,
  beds: 1,
  baths: 1,
  responseTime: "Within a day",
  rules: ["Non-smoking", "No pets", "Quiet after 10pm"],
  verified: ["phone", "email", "id"],
  relatedListings: [
    {
      id: "lst-rt1",
      imageSrc: "https://picsum.photos/seed/cottage/200/200",
      name: "Garden cottage in Rosebank",
      location: "Rosebank, Johannesburg",
    },
    {
      id: "lst-rt2",
      imageSrc: "https://picsum.photos/seed/studio/200/200",
      name: "Sunny studio in Gardens",
      location: "Gardens, Cape Town",
    },
  ],
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
    onBack: () => {},
    onToggleFavorite: () => {},
    onRequestView: () => {},
    onReport: () => {},
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
      deposit: 8200,
      beds: 2,
      baths: 1,
      responseTime: "Within 2 hours",
      rules: ["Non-smoking", "Garden maintenance optional"],
      verified: ["phone", "email", "id"],
    },
    onBack: () => {},
    onToggleFavorite: () => {},
    onRequestView: () => {},
    onReport: () => {},
  },
}

export const Favorited: Story = {
  args: {
    listing: {
      ...listing,
      id: "lst-003",
      imageSrc: "https://picsum.photos/seed/fav/400/300",
    },
    isFavorited: true,
    onBack: () => {},
  },
}