/**
 * Property reports data-access layer.
 *
 * A report is created when a viewer taps "Report listing" on a listing's
 * detail page and picks a reason (scam, misleading info, etc.) with an
 * optional description.
 *
 * Two implementations exist and are selected at boot time via
 * `VITE_USE_MOCK_DATA` (mirrors `listingService`):
 *
 * - `LocalReportsService` — persists to localStorage so reports survive
 *   reloads in the demo (flag ON).
 * - `HttpReportsService`  — POSTs to `/api/reports`; the Cohabit API emails
 *   a styled HTML summary of the report to the safety team (flag OFF/default).
 */

import { supabase } from "@/services/supabase"
import { API_BASE_URL, USE_MOCK_DATA } from "@/services/config"

export type ReportReason =
  | "scam"
  | "misleading"
  | "inappropriate"
  | "fraud"
  | "unsafe"
  | "other"

export type ReportStatus = "open" | "reviewed"

/** Human-readable labels for the report reasons, used by the report dialog. */
export const REPORT_REASONS: { id: ReportReason; label: string }[] = [
  { id: "scam", label: "It's a scam" },
  { id: "misleading", label: "Misleading information" },
  { id: "inappropriate", label: "Inappropriate content" },
  { id: "fraud", label: "Deposit or payment fraud" },
  { id: "unsafe", label: "Unsafe or suspicious listing" },
  { id: "other", label: "Something else" },
]

/** Fields collected from the viewer when they report a property. */
export interface ReportDetails {
  listingId: string
  listingTitle: string
  listingImageSrc: string
  type: "roommate" | "rentals"
  reporterName: string
  reason: ReportReason
  details?: string
}

export interface PropertyReport extends ReportDetails {
  id: string
  status: ReportStatus
  createdAt: string
}

export interface ReportsService {
  loadReports(): Promise<PropertyReport[]>
  submitReport(details: ReportDetails): Promise<PropertyReport>
  updateStatus(id: string, status: ReportStatus): Promise<void>
}

const STORAGE_KEY = "cohabit:property-reports"

function readStored(): PropertyReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as PropertyReport[]) : null
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStored(reports: PropertyReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  } catch {
    // ignore storage failures
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `report-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Client-side store: reads/writes localStorage so reports survive reloads. */
class LocalReportsService implements ReportsService {
  async loadReports(): Promise<PropertyReport[]> {
    return readStored()
  }

  async submitReport(details: ReportDetails): Promise<PropertyReport> {
    const report: PropertyReport = {
      ...details,
      id: newId(),
      status: "open",
      createdAt: new Date().toISOString(),
    }
    writeStored([report, ...readStored()])
    return report
  }

  async updateStatus(id: string, status: ReportStatus): Promise<void> {
    const next = readStored().map((r) => (r.id === id ? { ...r, status } : r))
    writeStored(next)
  }
}

interface ReportResultDto {
  listingId: string
  reason: string
  status: string
  submittedAt: string
}

/** HTTP-backed store: submits to `/api/reports`, which emails the safety team. */
class HttpReportsService implements ReportsService {
  async loadReports(): Promise<PropertyReport[]> {
    return []
  }

  async submitReport(details: ReportDetails): Promise<PropertyReport> {
    const token = await currentAccessToken()
    const res = await fetch(`${API_BASE_URL}/api/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        listingId: details.listingId,
        reporterName: details.reporterName,
        reason: details.reason,
        details: details.details,
      }),
    })
    if (!res.ok) throw new Error(`Failed to submit report (${res.status})`)
    const data: ReportResultDto = await res.json()

    return {
      ...details,
      id: `report-${data.listingId}-${data.submittedAt}`,
      status: data.status === "reviewed" ? "reviewed" : "open",
      createdAt: data.submittedAt,
    }
  }

  async updateStatus(_id: string, _status: ReportStatus): Promise<void> {
    // The API is fire-and-forget: reports are emailed to the safety team and
    // are not persisted client-side for review in live mode.
  }
}

async function currentAccessToken(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

/** Picks the implementation backing the app at boot time. */
export function createReportsService(): ReportsService {
  return USE_MOCK_DATA ? new LocalReportsService() : new HttpReportsService()
}

export const reportsService: ReportsService = createReportsService()
