/**
 * Inquiries data-access layer (core marketplace mechanic).
 *
 * A structured inquiry is created when a viewer taps "Request to view" on a
 * listing and includes a move-in date, number of occupants and a short
 * message. The listing owner manages these leads from their Profile
 * ("Inquiries"), moving each through a status pipeline:
 *
 *   new -> contacted -> accepted (or declined)
 *
 * The store is client-side for now: it persists to localStorage so leads
 * survive reloads in the demo. When the Cohabit API grows inquiry endpoints
 * this module can be swapped for an HTTP-backed implementation without
 * touching the UI (mirrors `favoritesService`).
 */

import { USE_MOCK_DATA } from "@/services/config"
import { FEATURED_PROFILES } from "@/services/listing-service"

export type InquiryStatus = "new" | "contacted" | "accepted" | "declined"

/** Fields collected from the viewer when they request a viewing. */
export interface InquiryDetails {
  listingId: string
  listingTitle: string
  listingImageSrc: string
  type: "roommate" | "rentals"
  inquireeUserId: string
  inquireeName: string
  /** ISO date `YYYY-MM-DD`. */
  moveInDate: string
  occupants: number
  message: string
}

export interface Inquiry extends InquiryDetails {
  id: string
  status: InquiryStatus
  createdAt: string
}

export interface InquiriesService {
  loadInquiries(): Promise<Inquiry[]>
  submitInquiry(details: InquiryDetails): Promise<Inquiry>
  updateStatus(id: string, status: InquiryStatus): Promise<void>
}

const STORAGE_KEY = "cohabit:inquiries"

function readStored(): Inquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Inquiry[]) : null
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStored(inquiries: Inquiry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries))
  } catch {
    // ignore storage failures
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `inquiry-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Builds a seed inquiry from a known demo listing. */
function seedFor(
  listingId: string,
  partial: Omit<InquiryDetails, "listingId" | "listingTitle" | "listingImageSrc" | "type"> & {
    status: InquiryStatus
    createdAt: string
  }
): Inquiry {
  const listing = FEATURED_PROFILES.find((p) => p.id === listingId) ?? FEATURED_PROFILES[0]
  return {
    listingId,
    listingTitle: listing.title ?? listing.name,
    listingImageSrc: listing.imageSrc,
    type: listing.type,
    ...partial,
    id: `seed-${partial.inquireeName}-${listingId}`.toLowerCase().replace(/\s+/g, "-"),
  }
}

/** Sample leads so the landlord dashboard has data to manage in mock mode. */
const SEED_INQUIRIES: Inquiry[] = [
  seedFor("9390dd68-f9e8-4e8f-b3d2-766bd148f410", {
    inquireeUserId: "guest-ayanda",
    inquireeName: "Ayanda Mbeki",
    moveInDate: "2026-09-15",
    occupants: 1,
    message:
      "Hi! I'm a junior designer relocating to Cape Town. The room looks perfect — could we arrange a viewing this week?",
    status: "new",
    createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
  }),
  seedFor("9390dd68-f9e8-4e8f-b3d2-766bd148f410", {
    inquireeUserId: "guest-ruth",
    inquireeName: "Ruth Khumalo",
    moveInDate: "2026-10-01",
    occupants: 1,
    message: "Hi Thabo, I'm available to move from the 1st of October. Would love to meet the housemates!",
    status: "contacted",
    createdAt: new Date(Date.now() - 6 * 86_400_000).toISOString(),
  }),
  seedFor("cc58e6e4-d1b2-4cb6-b27d-55e2f01302f8", {
    inquireeUserId: "guest-lerato",
    inquireeName: "Lerato Sithole",
    moveInDate: "2026-08-20",
    occupants: 1,
    message: "Hey! I work in marketing too — Fourways would be ideal. Is the room still available?",
    status: "new",
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
  }),
  seedFor("cc58e6e4-d1b2-4cb6-b27d-55e2f01302f8", {
    inquireeUserId: "guest-michael",
    inquireeName: "Michael Okafor",
    moveInDate: "2026-08-25",
    occupants: 2,
    message: "My partner and I are looking for a larger shared space. Are two people okay for this listing?",
    status: "accepted",
    createdAt: new Date(Date.now() - 12 * 86_400_000).toISOString(),
  }),
  seedFor("a4b9ead2-325b-4bb0-b25a-175b57b5d0e8", {
    inquireeUserId: "guest-naledi",
    inquireeName: "Naledi Tshabalala",
    moveInDate: "2026-09-01",
    occupants: 2,
    message: "Gorgeous spot in Gardens! We're a tidy couple with no pets — keen for a viewing this weekend.",
    status: "new",
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  }),
  seedFor("a4b9ead2-325b-4bb0-b25a-175b57b5d0e8", {
    inquireeUserId: "guest-peter",
    inquireeName: "Peter van Zyl",
    moveInDate: "2026-08-10",
    occupants: 3,
    message: "Three students looking for a place close to town. Happy to pay the deposit upfront.",
    status: "declined",
    createdAt: new Date(Date.now() - 20 * 86_400_000).toISOString(),
  }),
]

/** Client-side store: reads/writes localStorage so leads survive reloads. */
class LocalInquiriesService implements InquiriesService {
  async loadInquiries(): Promise<Inquiry[]> {
    const stored = readStored()
    if (stored.length > 0) return stored
    if (!USE_MOCK_DATA) return []

    writeStored(SEED_INQUIRIES)
    return SEED_INQUIRIES
  }

  async submitInquiry(details: InquiryDetails): Promise<Inquiry> {
    const inquiry: Inquiry = {
      ...details,
      id: newId(),
      status: "new",
      createdAt: new Date().toISOString(),
    }
    writeStored([inquiry, ...readStored()])
    return inquiry
  }

  async updateStatus(id: string, status: InquiryStatus): Promise<void> {
    const next = readStored().map((i) => (i.id === id ? { ...i, status } : i))
    writeStored(next)
  }
}

/** Picks the implementation backing the app at boot time. */
export function createInquiriesService(): InquiriesService {
  return new LocalInquiriesService()
}

export const inquiriesService: InquiriesService = createInquiriesService()
