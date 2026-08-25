

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  X,
  Camera,
  Upload,
  BadgeCheck,
  Clock,
  CircleX,
  TriangleAlert,
  ShieldCheck,
} from "lucide-react"
import {
  ID_DOCUMENT_TYPES,
  processIdImage,
  verificationService,
  VerificationApiError,
  type IdDocumentType,
  type VerificationSubmission,
} from "@/services/verification-service"

interface IdVerificationDialogProps {
  open: boolean
  onClose: () => void
  submissions: VerificationSubmission[]
  onSubmitted: (submission: VerificationSubmission) => void
}

type CaptureSlot = "front" | "back"

const STATUS_META: Record<
  VerificationSubmission["status"],
  { label: string; className: string; icon: typeof Clock }
> = {
  Pending: {
    label: "Under review",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    icon: Clock,
  },
  Approved: {
    label: "Approved",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    icon: BadgeCheck,
  },
  Rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    icon: CircleX,
  },
}

/** Maps API type names ("Identity Document") back to the slug values. */
const TYPE_VALUE_BY_API_NAME: Record<string, IdDocumentType> = {
  "identity document": "identity_document",
  "id document": "identity_document",
  identity_document: "identity_document",
  passport: "passport",
  "driver's license": "drivers_license",
  "drivers license": "drivers_license",
  drivers_license: "drivers_license",
}

function apiTypeToValue(apiType: string): IdDocumentType | undefined {
  return TYPE_VALUE_BY_API_NAME[apiType.toLowerCase()]
}

/**
 * Identity-document submission dialog. Users pick a document type and capture
 * front/back photos with their device camera or a file upload, then submit for
 * manual admin review.
 */
export function IdVerificationDialog({
  open,
  onClose,
  submissions,
  onSubmitted,
}: IdVerificationDialogProps) {
  const [documentType, setDocumentType] = useState<IdDocumentType>("identity_document")
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [webcamSlot, setWebcamSlot] = useState<CaptureSlot | null>(null)

  const resetForm = useCallback(() => {
    setFrontImage(null)
    setBackImage(null)
    setError(null)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  // One open submission per document type is enforced by the API.
  const blockedByPending = submissions.some(
    (s) =>
      s.status === "Pending" &&
      apiTypeToValue(s.type) === documentType
  )

  const acceptFile = async (slot: CaptureSlot, file?: File | null) => {
    if (!file || file.size === 0) return
    try {
      const processed = await processIdImage(file)
      if (slot === "front") setFrontImage(processed)
      else setBackImage(processed)
      setError(null)
    } catch {
      setError("That image could not be read. Try another photo.")
    }
  }

  const handleSubmit = async () => {
    if (!frontImage || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const submission = await verificationService.submit({
        type: documentType,
        frontImage,
        backImage,
      })
      onSubmitted(submission)
      resetForm()
      onClose()
    } catch (err) {
      setError(
        err instanceof VerificationApiError
          ? friendlyError(err)
          : "Something went wrong. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-label="Verify your identity with an ID document"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Verify Your ID</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Recent submissions */}
        {submissions.length > 0 && (
          <div className="mb-4 space-y-2">
            {submissions.slice(0, 3).map((submission) => {
              const meta = STATUS_META[submission.status]
              const StatusIcon = meta.icon
              return (
                <div
                  key={submission.id}
                  className="rounded-xl border border-border/60 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {submission.type}
                    </span>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.className}`}
                    >
                      <StatusIcon className="size-3" />
                      {meta.label}
                    </span>
                  </div>
                  {submission.status === "Rejected" && submission.rejectionReason && (
                    <p className="mt-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">
                      Reason: {submission.rejectionReason}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {blockedByPending ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200/70 bg-amber-50/70 p-3.5 dark:border-amber-500/25 dark:bg-amber-500/10">
            <Clock className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You already have a submission of this type under review.
              We&apos;ll update this panel once it has been reviewed.
            </p>
          </div>
        ) : (
          <>
            {/* Document type */}
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Document type
            </p>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {ID_DOCUMENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setDocumentType(type.value)}
                  className={`rounded-xl border px-2 py-3 text-center transition-all ${
                    documentType === type.value
                      ? "border-accent bg-accent/10"
                      : "border-border bg-background hover:border-accent/40"
                  }`}
                >
                  <span className="block text-xs font-medium">{type.label}</span>
                  <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground">
                    {type.hint}
                  </span>
                </button>
              ))}
            </div>

            {/* Captures */}
            <div className="space-y-3">
              <CaptureField
                slot="front"
                label="Front of document"
                required
                file={frontImage}
                onChange={(file) => void acceptFile("front", file)}
                onOpenCamera={() => setWebcamSlot("front")}
              />
              <CaptureField
                slot="back"
                label="Back of document (optional)"
                file={backImage}
                onChange={(file) => void acceptFile("back", file)}
                onOpenCamera={() => setWebcamSlot("back")}
              />
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200/70 bg-red-50/70 p-3 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                {error}
              </div>
            )}

            <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3 shrink-0" />
              Photos are stored securely, are never public, and are only seen by
              our review team. Blurred documents will be rejected.
            </p>

            <div className="mt-4 flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  onClose()
                }}
                className="rounded-xl bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!frontImage || submitting}
                className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Submitting…" : "Submit for review"}
              </button>
            </div>
          </>
        )}

        {/* Desktop webcam capture */}
        {webcamSlot && (
          <WebcamCapture
            slot={webcamSlot}
            onCaptured={(file) => {
              void acceptFile(webcamSlot, file)
              setWebcamSlot(null)
            }}
            onClose={() => setWebcamSlot(null)}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

/**
 * One photo field: native camera input on touch devices, webcam modal on
 * desktop, plus a regular file picker everywhere. Images are downscaled and
 * re-encoded through the verification service before being kept in state.
 */
function CaptureField({
  slot,
  label,
  required = false,
  file,
  onChange,
  onOpenCamera,
}: {
  slot: CaptureSlot
  label: string
  required?: boolean
  file: File | null
  onChange: (file: File | null) => void
  onOpenCamera: () => void
}) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewUrl = usePreviewUrl(file)

  const isCoarsePointer =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches

  const triggerFilePicker = () => fileInputRef.current?.click()
  const triggerNativeCamera = () => cameraInputRef.current?.click()

  const sharedInputProps = {
    type: "file" as const,
    accept: "image/*",
    className: "hidden",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.files?.[0] ?? null)
      e.target.value = ""
    },
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          <img
            src={previewUrl}
            alt={`${slot} preview`}
            className="max-h-44 w-full object-contain"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[11px] font-medium shadow-sm transition-colors hover:bg-muted"
          >
            <X className="size-3" />
            Remove
          </button>
        </div>
      ) : (
        <>
          {/* Touch devices open the rear camera natively via the capture attribute. */}
          <input
            {...sharedInputProps}
            aria-label={`Camera capture for ${label}`}
            ref={cameraInputRef}
            capture={isCoarsePointer ? "environment" : undefined}
          />
          <input {...sharedInputProps} ref={fileInputRef} aria-label={`File upload for ${label}`} />

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={isCoarsePointer ? triggerNativeCamera : onOpenCamera}
              className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-border px-2 py-4 transition-colors hover:border-accent/50 hover:bg-accent/5"
            >
              <Camera className="size-5 text-accent" />
              <span className="text-xs font-medium">
                {isCoarsePointer ? "Take photo" : "Use webcam"}
              </span>
            </button>
            <button
              type="button"
              onClick={triggerFilePicker}
              className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-border px-2 py-4 transition-colors hover:border-accent/50 hover:bg-accent/5"
            >
              <Upload className="size-5 text-accent" />
              <span className="text-xs font-medium">Choose file</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function usePreviewUrl(file: File | null): string | null {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  // Revoke when the URL is replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])
  return url
}

/** Desktop webcam modal: getUserMedia -> canvas frame grab -> JPEG File. */
function WebcamCapture({
  slot,
  onCaptured,
  onClose,
}: {
  slot: CaptureSlot
  onCaptured: (file: File) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 } },
      })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop())
          return
        }
        stream = mediaStream
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          void videoRef.current.play()
        }
      })
      .catch(() =>
        setError("Camera unavailable or permission denied — choose a file instead.")
      )

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const grabFrame = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        onCaptured(new File([blob], `webcam-${slot}.jpg`, { type: "image/jpeg" }))
      },
      "image/jpeg",
      0.9
    )
  }, [onCaptured, slot])

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background p-4">
      <div className="w-full space-y-3">
        {error ? (
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80"
            >
              Back
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className="aspect-video w-full rounded-xl border border-border object-cover"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={grabFrame}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Camera className="size-4" />
                Capture photo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** Friendly copy for known API error codes. */
function friendlyError(err: VerificationApiError): string {
  switch (err.errorCode) {
    case "verification_pending":
      return "You already have a submission awaiting review."
    case "image_too_large":
      return "Each image must be 8 MB or smaller."
    case "unsupported_image":
      return "Images must be PNG, JPEG or WebP."
    case "unsupported_document_type":
      return "That document type is not supported."
    case "not_authenticated":
      return "Your session expired — please sign in again."
    default:
      return err.message
  }
}
