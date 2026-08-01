import {
  Wifi,
  Car,
  Coffee,
  ShowerHead,
  WashingMachine,
  Dumbbell,
  Flame,
  Snowflake,
  Tv,
  Refrigerator,
} from "lucide-react"

export interface Amenity {
  name: string
  icon: React.ComponentType<{ className?: string }>
}

export const AMENITIES: Amenity[] = [
  { name: "Wi-Fi", icon: Wifi },
  { name: "Parking", icon: Car },
  { name: "Coffee bar", icon: Coffee },
  { name: "En-suite bathroom", icon: ShowerHead },
  { name: "Laundry", icon: WashingMachine },
  { name: "Gym", icon: Dumbbell },
  { name: "Heating", icon: Flame },
  { name: "Air conditioning", icon: Snowflake },
  { name: "Smart TV", icon: Tv },
  { name: "Fridge", icon: Refrigerator },
]

export const AMENITY_NAMES = AMENITIES.map((a) => a.name)

export const amenityByName = (name: string): Amenity | undefined =>
  AMENITIES.find((a) => a.name === name)
