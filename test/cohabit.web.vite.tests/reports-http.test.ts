import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ReportDetails } from "@/services/reports-service"

vi.stubEnv("VITE_USE_MOCK_DATA", "false")

const BASE_DETAILS: ReportDetails = {
  listingId: "9d726b3e-8303-4e41-91ee-9898e5c2974d",
  listingTitle: "Sea Point Flat",
  listingImageSrc: "https://example.com/pic.jpg",
  type: "rentals",
  reporterName: "Thabo Mokoena",
  reason: "scam",
}

beforeEach(() => {
  vi.resetModules()
})

describe("reportsService (API mode)", () => {
  it("POSTs the report to /api/reports and maps the response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        listingId: BASE_DETAILS.listingId,
        reason: "scam",
        status: "open",
        submittedAt: "2026-08-10T12:00:00Z",
      }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { reportsService } = await import("@/services/reports-service")

    const report = await reportsService.submitReport(BASE_DETAILS)

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/reports",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: BASE_DETAILS.listingId,
          reporterName: "Thabo Mokoena",
          reason: "scam",
        }),
      })
    )
    expect(report).toMatchObject({
      listingId: BASE_DETAILS.listingId,
      listingTitle: "Sea Point Flat",
      status: "open",
      createdAt: "2026-08-10T12:00:00Z",
    })
    expect(report.id).toBe(
      `report-${BASE_DETAILS.listingId}-2026-08-10T12:00:00Z`
    )
  })

  it("throws when the API rejects the report", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    )

    const { reportsService } = await import("@/services/reports-service")

    await expect(reportsService.submitReport(BASE_DETAILS)).rejects.toThrow(
      "Failed to submit report (500)"
    )
  })

  it("keeps an empty local report list in API mode", async () => {
    const { reportsService } = await import("@/services/reports-service")

    const reports = await reportsService.loadReports()

    expect(reports).toEqual([])
  })
})
