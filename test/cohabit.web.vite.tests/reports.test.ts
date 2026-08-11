import { describe, expect, it, beforeEach, vi } from "vitest"
import type { ReportDetails } from "@/services/reports-service"

vi.stubEnv("VITE_USE_MOCK_DATA", "true")

const BASE_DETAILS: ReportDetails = {
  listingId: "listing-1",
  listingTitle: "Sea Point Flat",
  listingImageSrc: "https://example.com/pic.jpg",
  type: "rentals",
  reporterName: "Thabo Mokoena",
  reason: "scam",
}

async function loadService() {
  const { reportsService } = await import("@/services/reports-service")
  return reportsService
}

beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
})

describe("reportsService", () => {
  it("starts with an empty report list", async () => {
    const reports = await (await loadService()).loadReports()
    expect(reports).toEqual([])
  })

  it("submits a report with an open status and timestamp", async () => {
    const report = await (await loadService()).submitReport(BASE_DETAILS)

    expect(report).toMatchObject({
      listingId: "listing-1",
      reporterName: "Thabo Mokoena",
      reason: "scam",
      status: "open",
    })
    expect(report.id).toBeTruthy()
    expect(report.createdAt).toBeTruthy()
  })

  it("persists submitted reports across loads", async () => {
    const service = await loadService()
    await service.submitReport(BASE_DETAILS)
    await service.submitReport({
      ...BASE_DETAILS,
      reason: "fraud",
      details: "Asked me to e-wallet a deposit before viewing.",
    })

    const reports = await service.loadReports()
    expect(reports).toHaveLength(2)
    expect(reports[0].reason).toBe("fraud")
    expect(reports[0].details).toContain("e-wallet")
  })

  it("does not seed demo reports in mock mode", async () => {
    const reports = await (await loadService()).loadReports()
    expect(reports).toHaveLength(0)
  })

  it("updates a report status", async () => {
    const service = await loadService()
    const report = await service.submitReport(BASE_DETAILS)
    await service.updateStatus(report.id, "reviewed")

    const reports = await service.loadReports()
    expect(reports[0].status).toBe("reviewed")
  })
})
