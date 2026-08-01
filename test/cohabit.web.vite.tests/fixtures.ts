import type { FeaturedProfile } from "@/lib/listing-types"
import type { UserData } from "@/components/ui/user-profile"
import type { CarouselCard } from "@/components/ui/minimal-carousel"
import type { PlaceItem } from "@/components/ui/pin-item"
import type { FaqItem } from "@/components/ui/faq-06"

interface RelatedListing {
  id: string
  imageSrc: string
  name: string
  location: string
}

export const makeProfile = (
  overrides: Partial<FeaturedProfile> = {}
): FeaturedProfile => ({
  id: "profile-1",
  imageSrc: "https://example.com/1.jpg",
  name: "Test User",
  location: "Testville",
  mapAddress: "Testville, South Africa",
  bio: "Test bio",
  photoCount: 3,
  verified: ["phone"],
  province: "wc",
  type: "roommate",
  userId: "user-1",
  price: 5000,
  deposit: 5000,
  beds: 1,
  baths: 1,
  availableFrom: "1 Sep 2026",
  responseTime: "Within the hour",
  rules: ["No smoking"],
  amenities: ["Wi-Fi"],
  ...overrides,
})

/** Synthetic dataset covering every filter combination we care about. */
export const SAMPLE_PROFILES: FeaturedProfile[] = [
  makeProfile({
    id: "wc-roommate-1",
    name: "Alice Waters",
    location: "Sea Point, Cape Town",
    province: "wc",
    type: "roommate",
    price: 7500,
  }),
  makeProfile({
    id: "wc-roommate-2",
    name: "Bob Zondo",
    location: "Gardens, Cape Town",
    province: "wc",
    type: "roommate",
    price: 6800,
  }),
  makeProfile({
    id: "wc-rental-1",
    name: "Carol Smith",
    location: "Observatory, Cape Town",
    province: "wc",
    type: "rentals",
    price: 12000,
  }),
  makeProfile({
    id: "kzn-roommate-1",
    name: "David Naidoo",
    location: "Umhlanga, Durban",
    province: "kzn",
    type: "roommate",
    price: 5200,
  }),
  makeProfile({
    id: "gp-rental-1",
    name: "Emma van Wyk",
    location: "Fourways, Johannesburg",
    province: "gp",
    type: "rentals",
    price: 14000,
  }),
]

export const makeUser = (overrides: Partial<UserData> = {}): UserData => ({
  id: "user-1",
  firstName: "Thabo",
  lastName: "Mokoena",
  cellphone: "+27 82 123 4567",
  email: "thabo@example.com",
  dateOfBirth: "1994-05-12",
  gender: "male",
  bio: "Creative designer",
  isOtpVerified: true,
  avatarUrl: "https://example.com/avatar.jpg",
  timestamp: "June 2025",
  ...overrides,
})

export const SAMPLE_CARDS: CarouselCard[] = [
  { id: "card-1", title: "Sea Point Flat", value: "Cape Town", color: "bg-red-500", imageSrc: "https://example.com/a.jpg" },
  { id: "card-2", title: "Umhlanga Room", value: "Durban", color: "bg-blue-500" },
  { id: "card-3", title: "Fourways Studio", value: "Johannesburg", color: "bg-green-500" },
]

export const SAMPLE_PLACES: PlaceItem[] = [
  { id: 1, name: "Welcome to Cohabit", type: "Today", status: "Account created", pinned: false },
  { id: 2, name: "New Property Alert", type: "Today", status: "New shared home listed", pinned: true },
  { id: 3, name: "Price Drop", type: "Yesterday", status: "Price reduced by R1,500", pinned: false },
]

export const SAMPLE_FAQS: FaqItem[] = [
  { id: "verify", question: "How do I verify a roommate?", answer: "Video call and references." },
  { id: "deposit", question: "How do deposits work?", answer: "First month plus deposit." },
  { id: "bills", question: "How are bills split?", answer: "Agree upfront, equally or by usage." },
]

export const SAMPLE_RELATED_LISTINGS: RelatedListing[] = Array.from(
  { length: 6 },
  (_, i) => ({
    id: `related-${i + 1}`,
    imageSrc: `https://example.com/related-${i + 1}.jpg`,
    name: `Related Listing ${i + 1}`,
    location: `Area ${i + 1}`,
  })
)
