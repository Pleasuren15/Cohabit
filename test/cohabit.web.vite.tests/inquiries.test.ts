import { describe, expect, it, beforeEach, beforeAll, vi } from "vitest"
import type { InquiriesService } from "@/services/inquiries-service"

let createInquiriesService: () => InquiriesService
let service: InquiriesService

// The service reads USE_MOCK_DATA from import.meta.env at module load, so pin
// real-data mode before importing it to keep this suite deterministic (the
// mock store seeds demo inquiries instead of starting empty).
beforeAll(async () => {
  vi.stubEnv("VITE_USE_MOCK_DATA", "false")
  ;({ createInquiriesService } = await import("@/services/inquiries-service"))
  service = createInquiriesService()
})

const base = {
  listingId: "l1",
  listingTitle: "Sea Point Flat",
  listingImageSrc: "https://example.com/1.jpg",
  type: "rentals" as const,
  inquireeUserId: "u2",
  inquireeName: "Ayanda Mbeki",
  moveInDate: "2026-09-15",
  occupants: 1,
  message: "Hello!",
}

describe("inquiriesService", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("starts empty", async () => {
    expect(await service.loadInquiries()).toEqual([])
  })

  it("submits a new inquiry with a fresh status", async () => {
    const created = await service.submitInquiry(base)

    expect(created.id).toBeTruthy()
    expect(created.status).toBe("new")
    expect(created.createdAt).toBeTruthy()
    expect(created.listingId).toBe("l1")

    const list = await service.loadInquiries()
    expect(list).toHaveLength(1)
    expect(list[0]).toEqual(created)
  })

  it("persists submitted inquiries across loads", async () => {
    await service.submitInquiry(base)
    await service.submitInquiry({ ...base, inquireeName: "Ruth Khumalo" })

    expect(await service.loadInquiries()).toHaveLength(2)
  })

  it("updates the status of an inquiry", async () => {
    const created = await service.submitInquiry(base)

    await service.updateStatus(created.id, "accepted")

    const list = await service.loadInquiries()
    expect(list[0].status).toBe("accepted")
  })

  it("leaves other inquiries untouched when updating one", async () => {
    const a = await service.submitInquiry(base)
    const b = await service.submitInquiry({
      ...base,
      inquireeName: "Ruth Khumalo",
    })

    await service.updateStatus(a.id, "declined")

    const list = await service.loadInquiries()
    expect(list.find((i) => i.id === a.id)?.status).toBe("declined")
    expect(list.find((i) => i.id === b.id)?.status).toBe("new")
  })
})
