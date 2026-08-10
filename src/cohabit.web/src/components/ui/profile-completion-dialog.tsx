"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { UserData, VerificationType } from "./user-profile"

/** A single item in the "Still missing" completion checklist. */
export interface ProfileCompletionStep {
  id: string
  label: string
  hint: string
  icon: LucideIcon
}

interface ProfileCompletionDialogProps {
  step: ProfileCompletionStep
  open: boolean
  onClose: () => void
  user: UserData
  verified: VerificationType[]
  onVerify: (type: VerificationType) => void
  onSave: (stepId: string, updated: UserData) => Promise<void>
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30 dark:[color-scheme:dark]"

const labelClass = "text-xs font-medium text-muted-foreground"

/** Builds the field definitions for each completion step. */
function stepFields(stepId: string, user: UserData) {
  switch (stepId) {
    case "photo":
      return {
        type: "avatar" as const,
        title: "Add a profile photo",
        description:
          "Add a photo so hosts and housemates can recognise you.",
        initial: user.avatarUrl ?? "",
        placeholder: "https://...",
        inputType: "url" as const,
      }
    case "bio":
      return {
        type: "bio" as const,
        title: "Tell us about yourself",
        description:
          "A short bio helps hosts and housemates get to know you.",
        initial: user.bio ?? "",
        placeholder: "e.g. Designer, quiet, loves hiking…",
        inputType: "textarea" as const,
      }
    case "phone":
      return {
        type: "phone" as const,
        title: "Add your phone number",
        description: "So people can reach you about viewings.",
        initial: user.cellphone ?? "",
        placeholder: "+27 82 123 4567",
        inputType: "tel" as const,
      }
    case "dob":
      return {
        type: "dob" as const,
        title: "Add your date of birth",
        description: "Required for identity checks.",
        initial: user.dateOfBirth ?? "",
        placeholder: "",
        inputType: "date" as const,
      }
    case "email":
      return {
        type: "email" as const,
        title: "Confirm your email address",
        description:
          "Verify your account ownership so hosts can reach you reliably.",
        initial: user.email ?? "",
        placeholder: "you@example.com",
        inputType: "email" as const,
      }
    case "address":
      return {
        type: "address" as const,
        title: "Add your address",
        description: "Help people find your area.",
        initial: user.address ?? "",
        placeholder: "e.g. Sea Point, Cape Town",
        inputType: "text" as const,
      }
    default:
      return {
        type: "text" as const,
        title: stepId,
        description: "",
        initial: "",
        placeholder: "",
        inputType: "text" as const,
      }
  }
}

export function ProfileCompletionDialog({
  step,
  open,
  onClose,
  user,
  verified,
  onVerify,
  onSave,
}: ProfileCompletionDialogProps) {
  const fields = stepFields(step.id, user)
  const [value, setValue] = useState(fields.initial)
  const [saving, setSaving] = useState(false)

  const canSave =
    fields.type === "email"
      ? value.trim().length > 0
      : value.trim().length > 0

  const handleSave = async () => {
    if (!canSave || saving) return
    const updated: UserData = { ...user }
    switch (fields.type) {
      case "avatar":
        updated.avatarUrl = value.trim()
        break
      case "bio":
        updated.bio = value.trim()
        break
      case "phone":
        updated.cellphone = value.trim()
        break
      case "dob":
        updated.dateOfBirth = value.trim()
        break
      case "email":
        updated.email = value.trim()
        break
      case "address":
        updated.address = value.trim()
        break
    }
    setSaving(true)
    try {
      if (fields.type === "email") {
        onVerify("email")
      }
      await onSave(step.id, updated)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={fields.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <step.icon className="size-4" />
                </span>
                <div>
                  <h2 className="text-base font-semibold">{fields.title}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {fields.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="completion-field"
                  className={labelClass}
                >
                  {fields.type === "avatar" && "Photo URL"}
                  {fields.type === "bio" && "Bio"}
                  {fields.type === "phone" && "Phone number"}
                  {fields.type === "dob" && "Date of birth"}
                  {fields.type === "email" && "Email address"}
                  {fields.type === "address" && "Address"}
                </label>
                {fields.inputType === "textarea" ? (
                  <textarea
                    id="completion-field"
                    rows={3}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={fields.placeholder}
                    className={`${inputClass} resize-none`}
                  />
                ) : (
                  <input
                    id="completion-field"
                    type={fields.inputType}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={fields.placeholder}
                    className={inputClass}
                  />
                )}
              </div>

              {fields.type === "email" && (
                <p className="text-[11px] text-muted-foreground">
                  {verified.includes("email")
                    ? "Your email is already verified."
                    : "Confirming marks your email as verified."}
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave || saving}
                className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? "Saving…" : fields.type === "email" ? "Confirm" : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
