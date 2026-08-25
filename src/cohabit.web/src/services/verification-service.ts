/**
 * ID verification data-access layer.
 *
 * Talks to the Cohabit API's identity-document verification endpoints:
 *
 * - `GET  /api/users/me/verifications` — the caller's submissions, newest first.
 * - `POST /api/users/me/verifications` — multipart submit (type + front/back).
 *
 * Images are prepared client-side before upload: downscaled to a max edge of
 * 2000px and re-encoded to JPEG. Drawing through a canvas also strips EXIF
 * metadata (orientation is baked in, GPS data never leaves the device) and
 * keeps payloads under the API's 8 MB limit.
 *
 * When the app runs in mock mode (no Supabase / USE_MOCK_DATA) submissions are
 * kept in localStorage so the flow can be demoed without the backend.
 */

import { supabase } from "@/services/supabase"
import { API_BASE_URL, USE_MOCK_DATA } from "@/services/config"
import { appendMockSystemMessage } from "@/services/messages-service"

export type IdDocumentType = "identity_document" | "passport" | "drivers_license"

export const ID_DOCUMENT_TYPES: { value: IdDocumentType; label: string; hint: string }[] = [
  { value: "identity_document", label: "ID Document", hint: "Green book or smart card" },
  { value: "passport", label: "Passport", hint: "Photo page" },
  { value: "drivers_license", label: "Driver's License", hint: "Front of card" },
]

/** Mirror of the API's UserVerificationDto. */
export interface VerificationSubmission {
  id: string
  type: string
  status: "Pending" | "Approved" | "Rejected"
  frontImageUrl: string | null
  backImageUrl: string | null
  submittedAt: string
  reviewedAt: string | null
  rejectionReason: string | null
}

export interface SubmitVerificationInput {
  type: IdDocumentType
  frontImage: File
  backImage?: File | null
  selfieImage: File
}

/** API error with its machine-readable code so the UI can react specifically. */
export class VerificationApiError extends Error {
  readonly errorCode: string
  readonly status?: number

  constructor(message: string, errorCode = "unknown", status?: number) {
    super(message)
    this.name = "VerificationApiError"
    this.errorCode = errorCode
    this.status = status
  }
}

const MAX_EDGE_PX = 2000
const JPEG_QUALITY = 0.85

/**
 * Downscales and re-encodes an image through a canvas: caps the longest edge,
 * flattens to JPEG (dropping EXIF/GPS metadata in the process).
 */
export async function processIdImage(file: File | Blob): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is not supported in this browser.")
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  )
  if (!blob) throw new Error("Could not process the image.")

  return new File([blob], `id-photo-${Date.now()}.jpg`, { type: "image/jpeg" })
}

async function requireAccessToken(): Promise<string> {
  if (!supabase) {
    throw new VerificationApiError(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      "not_configured"
    )
  }
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new VerificationApiError("You need to sign in first.", "not_authenticated")
  return session.access_token
}

async function parseError(res: Response): Promise<VerificationApiError> {
  let message = `Request failed (${res.status})`
  let errorCode = "unknown"
  try {
    const body = (await res.json()) as { errorCode?: string; error?: string }
    if (body?.error) message = body.error
    if (body?.errorCode) errorCode = body.errorCode
  } catch {
    // keep defaults for non-JSON error bodies
  }
  return new VerificationApiError(message, errorCode, res.status)
}

interface VerificationService {
  getMyVerifications(): Promise<VerificationSubmission[]>
  submit(input: SubmitVerificationInput): Promise<VerificationSubmission>
}

class HttpVerificationService implements VerificationService {
  private url(path = ""): string {
    return `${API_BASE_URL}/api/users/me/verifications${path}`
  }

  async getMyVerifications(): Promise<VerificationSubmission[]> {
    const token = await requireAccessToken()
    const res = await fetch(this.url(), {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw await parseError(res)
    return (await res.json()) as VerificationSubmission[]
  }

  async submit(input: SubmitVerificationInput): Promise<VerificationSubmission> {
    const token = await requireAccessToken()
    const [frontImage, backImage, selfieImage] = await Promise.all([
      processIdImage(input.frontImage),
      input.backImage ? processIdImage(input.backImage) : Promise.resolve(null),
      processIdImage(input.selfieImage),
    ])

    const form = new FormData()
    form.append("type", input.type)
    form.append("frontImage", frontImage)
    form.append("selfieImage", selfieImage)
    if (backImage) form.append("backImage", backImage)

    const res = await fetch(this.url(), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    if (!res.ok) throw await parseError(res)
    return (await res.json()) as VerificationSubmission
  }
}

const MOCK_STORAGE_KEY = "cohabit:id-verifications"

function readMockSubmissions(): VerificationSubmission[] {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as VerificationSubmission[]) : null
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeMockSubmissions(submissions: VerificationSubmission[]): void {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(submissions))
  } catch {
    // ignore storage failures
  }
}

class MockVerificationService implements VerificationService {
  async getMyVerifications(): Promise<VerificationSubmission[]> {
    return readMockSubmissions()
  }

  async submit(input: SubmitVerificationInput): Promise<VerificationSubmission> {
    // Demo mode approves instantly so the whole flow can be experienced
    // without the API + admin review loop. The in-app confirmation message
    // mirrors what the API sends on real submissions.
    const label =
      ID_DOCUMENT_TYPES.find((t) => t.value === input.type)?.label ?? input.type
    const submittedAt = new Date().toISOString()
    const submission: VerificationSubmission = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `id-${Date.now()}`,
      type: label,
      status: "Approved",
      frontImageUrl: null,
      backImageUrl: null,
      submittedAt,
      reviewedAt: new Date().toISOString(),
      rejectionReason: null,
    }
    writeMockSubmissions([submission, ...readMockSubmissions()])

    appendMockSystemMessage({
      title: "ID Verification Submitted",
      content: `We received your ${label.toLowerCase()} photos and they are now awaiting review by our team. You can check the status any time under Profile > Verify Your Identity.`,
      timestamp: submittedAt,
      imageUrls: [
        URL.createObjectURL(input.frontImage),
        URL.createObjectURL(input.selfieImage),
        ...(input.backImage ? [URL.createObjectURL(input.backImage)] : []),
      ],
    })

    return submission
  }
}

/** Picks the implementation backing the app at boot time. */
export function createVerificationService(): VerificationService {
  return USE_MOCK_DATA || !supabase
    ? new MockVerificationService()
    : new HttpVerificationService()
}

export const verificationService: VerificationService = createVerificationService()

/**
 * True when any submission for the given document type is still awaiting review.
 */
export function hasPendingSubmission(
  submissions: VerificationSubmission[],
): boolean {
  return submissions.some((s) => s.status === "Pending")
}
