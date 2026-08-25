/**
 * Storybook-only stand-in for the app's verification service.
 *
 * The real implementation lives in cohabit.web (`services/verification-service.ts`)
 * and talks to the Cohabit API. Stories only need the same surface area backed
 * by an in-memory mock so the flow can be demoed without a backend.
 */

export type IdDocumentType = "identity_document" | "passport" | "drivers_license"

export interface IdDocumentTypeOption {
  value: IdDocumentType
  label: string
  hint: string
}

export const ID_DOCUMENT_TYPES: IdDocumentTypeOption[] = [
  { value: "identity_document", label: "ID Document", hint: "Smart card ID" },
  { value: "passport", label: "Passport", hint: "Photo page" },
  { value: "drivers_license", label: "Driver's License", hint: "Both sides" },
]

export interface VerificationSubmission {
  id: string
  /** API display name, e.g. "Identity Document". */
  type: string
  status: "Pending" | "Approved" | "Rejected"
  frontImageUrl: string | null
  backImageUrl: string | null
  submittedAt: string
  reviewedAt: string | null
  rejectionReason: string | null
}

export class VerificationApiError extends Error {
  readonly errorCode: string

  constructor(errorCode: string, message: string) {
    super(message)
    this.name = "VerificationApiError"
    this.errorCode = errorCode
  }
}

/**
 * In the app this downscales to a max edge of 2000px and re-encodes as JPEG.
 * Stories skip the canvas work and pass the file straight through.
 */
export async function processIdImage(file: File | Blob): Promise<File> {
  return file instanceof File ? file : new File([file], "capture.jpg", { type: file.type })
}

const SEED_SUBMISSIONS: VerificationSubmission[] = [
  {
    id: "seed-approved",
    type: "Identity Document",
    status: "Approved",
    frontImageUrl: null,
    backImageUrl: null,
    submittedAt: new Date(Date.now() - 14 * 86_400_000).toISOString(),
    reviewedAt: new Date(Date.now() - 13 * 86_400_000).toISOString(),
    rejectionReason: null,
  },
  {
    id: "seed-rejected",
    type: "Driver's License",
    status: "Rejected",
    frontImageUrl: null,
    backImageUrl: null,
    submittedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    reviewedAt: new Date(Date.now() - 86_400_000).toISOString(),
    rejectionReason: "The photo was too blurry to read the card number.",
  },
]

/** Mock implementation: instant submit that lands in "Under review". */
class MockVerificationService {
  private submissions = [...SEED_SUBMISSIONS]

  async getMyVerifications(): Promise<VerificationSubmission[]> {
    return [...this.submissions]
  }

  async submit(input: {
    type: IdDocumentType
    frontImage: File
    backImage?: File | null
  }): Promise<VerificationSubmission> {
    const label =
      ID_DOCUMENT_TYPES.find((t) => t.value === input.type)?.label ?? input.type
    await new Promise((resolve) => setTimeout(resolve, 600))
    this.submissions = [
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `id-${Date.now()}`,
        type: label,
        status: "Pending",
        frontImageUrl: null,
        backImageUrl: null,
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        rejectionReason: null,
      },
      ...this.submissions,
    ]
    return this.submissions[0]
  }
}

export const verificationService = new MockVerificationService()
