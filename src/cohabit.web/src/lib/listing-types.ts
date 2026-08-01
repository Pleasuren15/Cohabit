export type VerificationType = "phone" | "email" | "id" | "credit"

export interface FeaturedProfile {
  id: string
  imageSrc: string
  name: string
  location: string
  mapAddress: string
  bio: string
  photoCount: number
  verified: VerificationType[]
  province: string
  type: "roommate" | "rentals"
  userId: string
  price: number
  deposit: number
  beds: number
  baths: number
  availableFrom: string
  responseTime: string
  rules: string[]
  amenities?: string[]
}
