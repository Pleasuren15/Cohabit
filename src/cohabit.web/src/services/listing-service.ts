/**
 * Listing data-access layer.
 *
 * The UI talks to this service (never to the mock array directly). Two
 * implementations exist and are selected at boot time via `VITE_USE_MOCK_DATA`:
 *
 * - `MockListingService`  — filters + paginates the in-memory FEATURED_PROFILES
 *   dataset (flag ON).
 * - `HttpListingService`  — calls the paginated `/api/listings` endpoints
 *   (PagedResult + ListingQuery already exist server-side) (flag OFF/default).
 *
 * The UI depends only on the `ListingService` interface, so either
 * implementation can be swapped in without UI changes.
 */

import { API_BASE_URL, USE_MOCK_DATA } from "@/services/config"
import { PROVINCES } from "@/lib/provinces"

export type VerificationType = "phone" | "email" | "id" | "credit"

export interface FeaturedProfile {
  id: string
  imageSrc: string
  name: string
  title?: string
  location: string
  mapAddress: string
  bio: string
  photoCount: number
  verified: VerificationType[]
  province: string
  type: "roommate" | "rentals"
  typeId?: number
  userId: string
  price: number
  deposit: number
  beds: number
  baths: number
  availableFrom: string
  responseTime: string
  rules: string[]
  amenities?: string[]
  addressLine1?: string
  addressLine2?: string
  postalCode?: string
  featured?: boolean
}

export interface ListingQuery {
  province: string
  type: "all" | "roommate" | "rentals"
  q: string
  page: number
  pageSize: number
  /** ids that should sort to the top (featured + promoted) */
  promotedIds: ReadonlySet<string>
}

export interface PagedListings {
  items: FeaturedProfile[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

/** Payload used to create/update a listing (mapped to the API request shapes). */
export interface ListingMutationInput {
  title: string
  description: string
  typeId: number
  price: number
  deposit: number
  beds: number
  baths: number
  /** ISO date `YYYY-MM-DD`. */
  availableFrom: string
  responseTime: string
  addressLine1: string
  addressLine2: string
  suburb: string
  postalCode: string
  provinceId: number
  amenityIds: number[]
  ruleIds: number[]
}

export interface ListingService {
  getListings(query: ListingQuery, all: FeaturedProfile[]): Promise<PagedListings>
  getListingById(id: string, all: FeaturedProfile[]): Promise<FeaturedProfile | null>
  getUserListings(userId: string, all: FeaturedProfile[]): Promise<FeaturedProfile[]>
  createListing(
    userId: string,
    input: ListingMutationInput,
    images: File[]
  ): Promise<FeaturedProfile>
  updateListing(
    userId: string,
    listingId: string,
    input: ListingMutationInput
  ): Promise<FeaturedProfile>
  resolveProvinceId(code: string): Promise<number | undefined>
}

/** `"1 Sep 2026"` / `"Flexible"` -> `"YYYY-MM-DD"` (used by the API). */
export function toIsoAvailableFrom(value: string): string {
  const trimmed = value.trim()
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (match) return trimmed

  const parsed = new Date(`${trimmed} 12:00:00`)
  if (!Number.isNaN(parsed.getTime())) {
    const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000)
    return local.toISOString().slice(0, 10)
  }

  return new Date().toISOString().slice(0, 10)
}

/** Tolerant lookup of a listing amenity name -> API amenity id. */
export function amenityNameToId(name: string): number | undefined {
  const key = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
  return AMENITY_ID_BY_KEY[key]
}

/** Tolerant lookup of a listing rule name -> API rule id. */
export function ruleNameToId(name: string): number | undefined {
  const key = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
  return RULE_ID_BY_KEY[key]
}

const AMENITY_ID_BY_KEY: Record<string, number> = {
  highspeedwifi: 1,
  wifi: 1,
  parking: 2,
  swimmingpool: 3,
  pool: 3,
  gym: 4,
  laundry: 5,
  washingmachine: 5,
  furnished: 6,
  airconditioning: 7,
  airconditioner: 7,
  balcony: 8,
  security: 9,
  petfriendly: 10,
  petswelcome: 10,
  cleaningservice: 11,
  solarpower: 12,
}

const RULE_ID_BY_KEY: Record<string, number> = {
  nosmoking: 1,
  nopets: 2,
  noparties: 3,
  noalcohol: 4,
  nodrugs: 5,
  quiethours: 6,
  noguests: 7,
  visitorsallowed: 8,
}

const ROOMMATE_TYPE_ID = 1
const RENTALS_TYPE_ID = 3

/** Maps the UI kind to the API listing type id. */
export function typeToId(type: FeaturedProfile["type"]): number {
  return type === "roommate" ? ROOMMATE_TYPE_ID : RENTALS_TYPE_ID
}

/** Mock implementation: filters + paginates the in-memory dataset. */
class MockListingService implements ListingService {
  async getListings(
    query: ListingQuery,
    all: FeaturedProfile[]
  ): Promise<PagedListings> {
    const q = query.q.trim().toLowerCase()
    const filtered = all
      .filter((p) => {
        if (p.province !== query.province) return false
        if (query.type === "roommate" && p.type !== "roommate") return false
        if (query.type === "rentals" && p.type !== "rentals") return false
        if (q && !`${p.name} ${p.location}`.toLowerCase().includes(q)) return false
        return true
      })
      .slice()
      .sort(
        (a, b) =>
          Number(query.promotedIds.has(b.id)) - Number(query.promotedIds.has(a.id))
      )

    const totalCount = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalCount / query.pageSize))
    const start = (query.page - 1) * query.pageSize
    const items = filtered.slice(start, start + query.pageSize)

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      totalCount,
      totalPages,
    }
  }

  async getListingById(
    id: string,
    all: FeaturedProfile[]
  ): Promise<FeaturedProfile | null> {
    return all.find((p) => p.id === id) ?? null
  }

  async getUserListings(
    userId: string,
    all: FeaturedProfile[]
  ): Promise<FeaturedProfile[]> {
    return all.filter((p) => p.userId === userId)
  }

  async createListing(
    userId: string,
    input: ListingMutationInput,
    images: File[]
  ): Promise<FeaturedProfile> {
    return {
      id: `mock-listing-${Date.now()}`,
      imageSrc: images[0]
        ? URL.createObjectURL(images[0])
        : FALLBACK_IMAGE,
      name: "You",
      title: input.title,
      location: input.suburb,
      mapAddress: input.suburb,
      bio: input.description,
      photoCount: images.length,
      verified: [],
      province: "",
      type: input.typeId === ROOMMATE_TYPE_ID ? "roommate" : "rentals",
      typeId: input.typeId,
      userId,
      price: input.price,
      deposit: input.deposit,
      beds: input.beds,
      baths: input.baths,
      availableFrom: input.availableFrom,
      responseTime: input.responseTime,
      rules: [],
      amenities: [],
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      postalCode: input.postalCode,
    }
  }

  async updateListing(
    userId: string,
    listingId: string,
    input: ListingMutationInput
  ): Promise<FeaturedProfile> {
    return this.createListing(userId, input, []).then((p) => ({
      ...p,
      id: listingId,
    }))
  }

  async resolveProvinceId(_code: string): Promise<number | undefined> {
    return 1
  }
}

/* ------------------------------------------------------------------ */
/* Real API implementation.                                             */
/* ------------------------------------------------------------------ */

/** Wire shapes of the Cohabit API DTOs (camelCase JSON). */

export interface ProvinceDto {
  id: number
  name: string
}

export interface ListingOwnerDto {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

export interface ListingAddressDto {
  addressLine1: string
  addressLine2: string
  suburb: string
  postalCode: string
  province: ProvinceDto
}

export interface ListingSummaryDto {
  id: string
  title: string
  description: string
  typeId: number
  type: string
  price: number
  deposit: number
  beds: number
  baths: number
  availableFrom: string
  responseTime: string
  primaryImageUrl: string | null
  owner: ListingOwnerDto
  address: ListingAddressDto
}

export interface ListingDetailDto extends ListingSummaryDto {
  images: string[]
  amenities: string[]
  rules: string[]
  ownerVerifications: { typeId: number; name: string; isVerified: boolean }[]
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1000"

const PROVINCE_CODE_BY_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(PROVINCES).map(([code, name]) => [name, code])
)

const VERIFICATION_CODE_BY_NAME: Record<string, VerificationType> = {
  "Phone Number": "phone",
  Email: "email",
  "Identity Document": "id",
}

/** The backend treats "Room" listings as roommate matches; the rest are rentals. */
function mapListingType(name: string): FeaturedProfile["type"] {
  return name === "Room" ? "roommate" : "rentals"
}

/** "2026-09-01" -> "1 Sep 2026" (mock data uses this display format). */
function formatAvailableFrom(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value
  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  )
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function fromSummary(dto: ListingSummaryDto): FeaturedProfile {
  const name = [dto.owner.firstName, dto.owner.lastName]
    .filter(Boolean)
    .join(" ")
    .trim()

  return {
    id: dto.id,
    imageSrc: dto.primaryImageUrl ?? FALLBACK_IMAGE,
    name: name || dto.title,
    title: dto.title,
    location: dto.address.suburb,
    mapAddress: [
      dto.address.suburb,
      dto.address.province.name,
      "South Africa",
    ]
      .filter(Boolean)
      .join(", "),
    bio: dto.description,
    photoCount: 0,
    verified: [],
    province: PROVINCE_CODE_BY_NAME[dto.address.province.name] ?? "",
    type: mapListingType(dto.type),
    typeId: dto.typeId,
    userId: dto.owner.id,
    price: dto.price,
    deposit: dto.deposit,
    beds: dto.beds,
    baths: dto.baths,
    availableFrom: formatAvailableFrom(dto.availableFrom),
    responseTime: dto.responseTime,
    rules: [],
    amenities: [],
    addressLine1: dto.address.addressLine1,
    addressLine2: dto.address.addressLine2,
    postalCode: dto.address.postalCode,
  }
}

function fromDetail(dto: ListingDetailDto): FeaturedProfile {
  return {
    ...fromSummary(dto),
    photoCount: dto.images.length,
    imageSrc: dto.primaryImageUrl ?? dto.images[0] ?? FALLBACK_IMAGE,
    verified: dto.ownerVerifications
      .filter((v) => v.isVerified)
      .map((v) => VERIFICATION_CODE_BY_NAME[v.name])
      .filter((v): v is VerificationType => v !== undefined),
    amenities: dto.amenities,
    rules: dto.rules,
  }
}

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Calls the live Cohabit API (/api/listings, /api/listings/{id}). */
class HttpListingService implements ListingService {
  private provinceIdsByCode: Record<string, number> | null = null

  private async loadProvinceIds(): Promise<Record<string, number>> {
    if (this.provinceIdsByCode) return this.provinceIdsByCode

    const res = await fetch(`${API_BASE_URL}/api/provinces`)
    if (!res.ok) throw new Error(`Failed to load provinces (${res.status})`)
    const provinces: ProvinceDto[] = await res.json()

    this.provinceIdsByCode = Object.fromEntries(
      provinces
        .filter((p) => PROVINCE_CODE_BY_NAME[p.name])
        .map((p) => [PROVINCE_CODE_BY_NAME[p.name], p.id])
    )
    return this.provinceIdsByCode
  }

  async getListings(
    query: ListingQuery,
    _all: FeaturedProfile[]
  ): Promise<PagedListings> {
    const params = new URLSearchParams()
    if (query.province) {
      const ids = await this.loadProvinceIds()
      const provinceId = ids[query.province]
      if (provinceId !== undefined) params.set("provinceId", String(provinceId))
    }
    if (query.type !== "all") params.set("type", query.type)
    if (query.q.trim()) params.set("q", query.q.trim())
    params.set("page", String(query.page))
    params.set("pageSize", String(query.pageSize))

    const res = await fetch(`${API_BASE_URL}/api/listings?${params.toString()}`)
    if (!res.ok) throw new Error(`Failed to load listings (${res.status})`)
    const data: PagedResult<ListingSummaryDto> = await res.json()

    return {
      items: data.items.map(fromSummary),
      page: data.page,
      pageSize: data.pageSize,
      totalCount: data.totalCount,
      totalPages: data.totalPages,
    }
  }

  async getListingById(
    id: string,
    _all: FeaturedProfile[]
  ): Promise<FeaturedProfile | null> {
    if (!GUID_PATTERN.test(id)) return null

    const res = await fetch(`${API_BASE_URL}/api/listings/${id}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Failed to load listing (${res.status})`)
    const data: ListingDetailDto = await res.json()
    return fromDetail(data)
  }

  async getUserListings(
    userId: string,
    _all: FeaturedProfile[]
  ): Promise<FeaturedProfile[]> {
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}/listings`)
    if (!res.ok) throw new Error(`Failed to load listings (${res.status})`)
    const data: ListingSummaryDto[] = await res.json()
    return data.map(fromSummary)
  }

  async createListing(
    userId: string,
    input: ListingMutationInput,
    images: File[]
  ): Promise<FeaturedProfile> {
    const form = new FormData()
    form.append("userId", userId)
    form.append("title", input.title)
    form.append("description", input.description)
    form.append("typeId", String(input.typeId))
    form.append("price", String(input.price))
    form.append("deposit", String(input.deposit))
    form.append("beds", String(input.beds))
    form.append("baths", String(input.baths))
    form.append("availableFrom", input.availableFrom)
    form.append("responseTime", input.responseTime)
    form.append("addressLine1", input.addressLine1)
    form.append("addressLine2", input.addressLine2)
    form.append("suburb", input.suburb)
    form.append("postalCode", input.postalCode)
    form.append("provinceId", String(input.provinceId))
    if (input.amenityIds.length > 0)
      form.append("amenityIds", input.amenityIds.join(","))
    if (input.ruleIds.length > 0)
      form.append("ruleIds", input.ruleIds.join(","))
    form.append("primaryImageIndex", "0")
    images.forEach((file) => form.append("images", file))

    const res = await fetch(`${API_BASE_URL}/api/listings`, {
      method: "POST",
      body: form,
    })
    if (!res.ok) throw new Error(`Failed to create listing (${res.status})`)
    const data: ListingDetailDto = await res.json()
    return fromDetail(data)
  }

  async updateListing(
    userId: string,
    listingId: string,
    input: ListingMutationInput
  ): Promise<FeaturedProfile> {
    const res = await fetch(
      `${API_BASE_URL}/api/users/${userId}/listings/${listingId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          typeId: input.typeId,
          price: input.price,
          deposit: input.deposit,
          beds: input.beds,
          baths: input.baths,
          availableFrom: input.availableFrom,
          responseTime: input.responseTime,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2,
          suburb: input.suburb,
          postalCode: input.postalCode,
          provinceId: input.provinceId,
          amenityIds: input.amenityIds,
          ruleIds: input.ruleIds,
        }),
      }
    )
    if (!res.ok) throw new Error(`Failed to update listing (${res.status})`)
    const data: ListingDetailDto = await res.json()
    return fromDetail(data)
  }

  async resolveProvinceId(code: string): Promise<number | undefined> {
    const ids = await this.loadProvinceIds()
    return ids[code]
  }
}

/** Picks the implementation backing the app at boot time. */
export function createListingService(): ListingService {
  return USE_MOCK_DATA ? new MockListingService() : new HttpListingService()
}

export const listingService: ListingService = createListingService()

/* ------------------------------------------------------------------ */
/* Static demo dataset (mock source of truth).                         */
/* ------------------------------------------------------------------ */

export const FEATURED_PROFILES: FeaturedProfile[] = [
  {
    id: "9390dd68-f9e8-4e8f-b3d2-766bd148f410",
    imageSrc:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Thabo Mokoena",
    location: "Sea Point, Cape Town",
    mapAddress: "Sea Point, Cape Town, South Africa",
    bio: "Creative graphic designer looking for a shared space with like-minded people. I love hosting braais on weekends and exploring hiking trails.",
    price: 7500,
    deposit: 7500,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["No smoking indoors", "Pets welcome", "Guests welcome"],
    photoCount: 6,
    verified: ["phone", "email", "id"],
    province: "wc",
    type: "roommate",
    userId: "user-1",
    featured: true,
  },
  {
    id: "5a4164c8-3068-4071-b136-adc93397e64d",
    imageSrc:
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Priya Naidoo",
    location: "Umhlanga, Durban",
    mapAddress: "Umhlanga, Durban, South Africa",
    bio: "Remote software developer seeking a quiet, clean flatmate. I enjoy cooking, yoga, and beach walks. Non-smoker, pet-friendly.",
    price: 6800,
    deposit: 6800,
    beds: 1,
    baths: 1,
    availableFrom: "15 Aug 2026",
    responseTime: "Within a few hours",
    rules: ["Non-smoking home", "No pets", "Quiet after 10pm"],
    photoCount: 8,
    verified: ["phone", "email", "id", "credit"],
    province: "kzn",
    type: "roommate",
    userId: "user-2",
    featured: true,
  },
  {
    id: "33588bf8-21d7-4429-aedf-ad3b0a8e4daf",
    imageSrc:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "James van der Merwe",
    location: "Observatory, Cape Town",
    mapAddress: "Observatory, Cape Town, South Africa",
    bio: "Medical student at UCT. I keep irregular hours but I'm tidy and respectful. Love board games and morning runs.",
    price: 6200,
    deposit: 6200,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["No smoking", "Tidy shared spaces", "Flexible guests"],
    photoCount: 4,
    verified: ["phone", "id"],
    province: "wc",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "cc58e6e4-d1b2-4cb6-b27d-55e2f01302f8",
    imageSrc:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Lindiwe Dlamini",
    location: "Fourways, Johannesburg",
    mapAddress: "Fourways, Johannesburg, South Africa",
    bio: "Marketing manager at a tech startup. I work from home 3 days a week and enjoy wine tasting, live music, and meeting new people.",
    price: 5900,
    deposit: 5900,
    beds: 1,
    baths: 1,
    availableFrom: "1 Aug 2026",
    responseTime: "Same day",
    rules: ["Non-smoking home", "Pets welcome", "Visitors welcome"],
    photoCount: 10,
    verified: ["phone", "email", "id", "credit"],
    province: "gp",
    type: "roommate",
    userId: "user-1",
    featured: true,
  },
  {
    id: "fe3cc607-64c0-4dc7-ae8d-d22b1d022729",
    imageSrc:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Sipho Zulu",
    location: "Maboneng, Johannesburg",
    mapAddress: "Maboneng, Johannesburg, South Africa",
    bio: "Freelance photographer and content creator. I'm out most days shooting but enjoy cozy nights in. Looking for an artsy flatmate.",
    price: 5500,
    deposit: 5500,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["No smoking indoors", "Artistic chaos OK", "Guests welcome"],
    photoCount: 7,
    verified: ["phone", "email"],
    province: "gp",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "5b7d0599-df6e-4da5-a970-94c0e14a3f5b",
    imageSrc:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Emma Coetzee",
    location: "Stellenbosch, Winelands",
    mapAddress: "Stellenbosch, South Africa",
    bio: "Postgraduate student in viticulture. Quiet and dedicated, but I unwind with hiking and dog parks on weekends. Non-smoker.",
    price: 4800,
    deposit: 4800,
    beds: 1,
    baths: 1,
    availableFrom: "1 Feb 2026",
    responseTime: "Within a few hours",
    rules: ["Non-smoking", "No pets", "Quiet evenings"],
    photoCount: 5,
    verified: ["phone", "id", "credit"],
    province: "wc",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "2a0745b0-e19d-4a6b-94a9-6a5475cc25ea",
    imageSrc:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Nomsa Mthembu",
    location: "Morningside, Durban",
    mapAddress: "Morningside, Durban, South Africa",
    bio: "Registered nurse working night shifts at Addington Hospital. I need a calm, clean space during the day to rest. Respectful and drama-free.",
    price: 5200,
    deposit: 5200,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["Non-smoking home", "No pets", "Calm & quiet"],
    photoCount: 3,
    verified: ["phone", "email", "id"],
    province: "kzn",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "a4b9ead2-325b-4bb0-b25a-175b57b5d0e8",
    imageSrc:
      "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Kyle Petersen",
    location: "Gardens, Cape Town",
    mapAddress: "Gardens, Cape Town, South Africa",
    bio: "Chef at a restaurant in town. I bring home leftovers and love sharing meals. Tidy in shared spaces, out most evenings. Looking for a relaxed flatmate.",
    price: 12000,
    deposit: 12000,
    beds: 2,
    baths: 2,
    availableFrom: "Immediately",
    responseTime: "Within the hour",
    rules: ["No smoking", "Pets by arrangement", "Shared kitchen"],
    photoCount: 6,
    verified: ["phone", "id", "credit"],
    province: "wc",
    type: "rentals",
    userId: "user-1",
    featured: true,
  },
  {
    id: "091d14ed-77a6-498f-93b7-1690f0307d2a",
    imageSrc:
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Zanele Khumalo",
    location: "Waterkloof, Pretoria",
    mapAddress: "Waterkloof, Pretoria, South Africa",
    bio: "Civil engineer working on infrastructure projects. I'm outdoorsy and enjoy trail running, but also love quiet evenings with a good book. Pet-friendly.",
    price: 14000,
    deposit: 14000,
    beds: 3,
    baths: 2,
    availableFrom: "1 Sep 2026",
    responseTime: "Same day",
    rules: ["No smoking indoors", "Pets welcome", "Parking available"],
    photoCount: 9,
    verified: ["phone", "email", "id"],
    province: "gp",
    type: "rentals",
    userId: "user-2",
    featured: true,
  },
  {
    id: "f6c36140-4f50-43e3-bc9b-c69ce57a0f4f",
    imageSrc:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Mandla Grootboom",
    location: "Summerstrand, Gqeberha",
    mapAddress: "Summerstrand, Gqeberha, South Africa",
    bio: "Lecturer at NMU looking for a quiet flatmate. I enjoy reading, surfing on weekends, and live music. Non-smoker, no pets.",
    price: 4600,
    deposit: 4600,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within a few hours",
    rules: ["Non-smoker only", "No pets", "Quiet after 11pm"],
    photoCount: 5,
    verified: ["phone", "email", "id"],
    province: "ec",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "14125c66-7dbd-4642-96f5-af4c954e6c2c",
    imageSrc:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Natasha Kemp",
    location: "Eastern Beach, East London",
    mapAddress: "East London, South Africa",
    bio: "Accountant at a firm in town. I'm neat, organised, and enjoy a peaceful home environment. Love beach walks and Sunday roasts.",
    price: 9500,
    deposit: 9500,
    beds: 2,
    baths: 1,
    availableFrom: "1 Oct 2026",
    responseTime: "Within the hour",
    rules: ["Non-smoking home", "No pets", "Peaceful home"],
    photoCount: 7,
    verified: ["phone", "id", "credit"],
    province: "ec",
    type: "rentals",
    userId: "user-2",
  },
  {
    id: "8c0ae681-cf63-4442-a039-a5ed8c7058e8",
    imageSrc:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Katlego Mokoena",
    location: "Bloemfontein Central",
    mapAddress: "Bloemfontein, South Africa",
    bio: "Journalist covering local news. I work flexible hours and enjoy hiking, photography, and trying new restaurants. Looking for a laid-back flatmate.",
    price: 4200,
    deposit: 4200,
    beds: 1,
    baths: 1,
    availableFrom: "Immediately",
    responseTime: "Same day",
    rules: ["No smoking indoors", "Pets welcome", "Flexible hours"],
    photoCount: 4,
    verified: ["phone", "email"],
    province: "fs",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "b04e51c9-7dbf-42b2-a811-61588cb820cc",
    imageSrc:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Anelize Visser",
    location: "Universitas, Bloemfontein",
    mapAddress: "Bloemfontein, South Africa",
    bio: "Masters student at UFS. I need a quiet study environment but enjoy board games and coffee chats. Tidy, respectful, and drama-free.",
    price: 3800,
    deposit: 3800,
    beds: 1,
    baths: 1,
    availableFrom: "1 Feb 2026",
    responseTime: "Within a few hours",
    rules: ["Quiet study environment", "No smoking", "No pets"],
    photoCount: 3,
    verified: ["phone", "id"],
    province: "fs",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "ded583f9-5dc2-4de2-a53f-816533ebc8d5",
    imageSrc:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Tendai Masuku",
    location: "Polokwane Central",
    mapAddress: "Polokwane, South Africa",
    bio: "Pharmacist at a local hospital. I work shifts but keep a tidy home. Love gardening, cooking, and weekend braais. Pet-friendly.",
    price: 4500,
    deposit: 4500,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["No smoking", "Pets welcome", "Weekend braais"],
    photoCount: 6,
    verified: ["phone", "email", "id"],
    province: "lp",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "774b4add-94ac-4ff8-97ba-a68b588250b7",
    imageSrc:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Megan Dlamini",
    location: "Mbombela City Center",
    mapAddress: "Mbombela, South Africa",
    bio: "Tourism guide specialising in Kruger Park safaris. Outgoing, adventurous, and love sharing travel stories. Looking for an easygoing flatmate.",
    price: 4700,
    deposit: 4700,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["Non-smoking home", "No pets", "Guests welcome"],
    photoCount: 8,
    verified: ["phone", "email", "id", "credit"],
    province: "mp",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "fc3caa84-0ee3-4279-b832-684aceec5998",
    imageSrc:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Johan du Preez",
    location: "Kimberley City",
    mapAddress: "Kimberley, South Africa",
    bio: "Mining engineer with a calm demeanour. I spend most weekends at the diamond fields but need a clean home base. Non-smoker, no pets.",
    price: 4100,
    deposit: 4100,
    beds: 1,
    baths: 1,
    availableFrom: "1 Nov 2026",
    responseTime: "Same day",
    rules: ["Non-smoker only", "No pets", "Clean home base"],
    photoCount: 4,
    verified: ["phone", "id"],
    province: "nc",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "4de1f514-2217-4aa8-8932-9a166e1f73ad",
    imageSrc:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Olwethu Ntuli",
    location: "Mahikeng City",
    mapAddress: "Mahikeng, South Africa",
    bio: "Social worker passionate about community development. I enjoy quiet evenings, cooking traditional meals, and tending to my plants.",
    price: 3900,
    deposit: 3900,
    beds: 1,
    baths: 1,
    availableFrom: "Immediately",
    responseTime: "Within a few hours",
    rules: ["No smoking", "Plants welcome", "Quiet evenings"],
    photoCount: 5,
    verified: ["phone", "email", "id"],
    province: "nw",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "787bd6ac-d80a-41e4-a607-8a9d4adf6990",
    imageSrc:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Nadia van Wyk",
    location: "Klerksdorp Central",
    mapAddress: "Klerksdorp, South Africa",
    bio: "High school teacher looking for a quiet, respectful flatmate. I'm tidy, love baking, and enjoy weekend hikes. Non-smoker.",
    price: 8500,
    deposit: 8500,
    beds: 2,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["Non-smoking home", "No pets", "Respectful flatmate"],
    photoCount: 6,
    verified: ["phone", "email", "id", "credit"],
    province: "nw",
    type: "rentals",
    userId: "user-2",
  },
]