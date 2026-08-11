"use client"

import * as React from "react"
import {
  FileText,
  Plus,
  Trash2,
  Eye,
  Download,
  ArrowLeft,
  Users,
  Home,
  ShieldCheck,
} from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  EMPTY_CONTRACT_DRAFT,
  type ContractDraft,
  type ContractType,
  type Roommate,
} from "@/lib/contracts"
import { downloadNodeAsPdf } from "@/lib/contract-pdf"
import { ContractDocument } from "@/components/ui/contract-document"

type Step = "type" | "details" | "preview"

const CONTRACT_TYPE_OPTIONS: {
  value: ContractType
  title: string
  description: string
}[] = [
  {
    value: "roommate",
    title: "Roommate Agreement",
    description:
      "Between people sharing a home — rent split, chores, guests, utilities and move-out terms.",
  },
  {
    value: "lease",
    title: "Residential Lease",
    description:
      "Between a landlord and tenant — rent, deposit, maintenance, utilities and house rules.",
  },
]

const STEP_LABELS: Record<Step, string> = {
  type: "Choose a contract",
  details: "Enter the details",
  preview: "Preview & download",
}

function newRoommate(): Roommate {
  return {
    id: `roommate-${Math.random().toString(36).slice(2, 9)}`,
    name: "",
    email: "",
    phone: "",
    moveInDate: "",
  }
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {children}
      {hint && (
        <span className="block text-[11px] text-muted-foreground">{hint}</span>
      )}
    </label>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-background/70 p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  )
}

function OptionToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
        checked
          ? "border-accent/50 bg-accent/5 text-foreground"
          : "border-border bg-background text-muted-foreground"
      )}
    >
      <span className="font-medium">{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-4" : ""
          )}
        />
      </span>
    </button>
  )
}

interface ContractGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContractGenerator({
  open,
  onOpenChange,
}: ContractGeneratorProps) {
  const [step, setStep] = React.useState<Step>("type")
  const [draft, setDraft] = React.useState<ContractDraft>({
    ...EMPTY_CONTRACT_DRAFT,
    roommates: [newRoommate()],
  })
  const [downloading, setDownloading] = React.useState(false)
  const documentRef = React.useRef<HTMLDivElement>(null)
  const wasOpenRef = React.useRef(false)

  // Reset the wizard each time the dialog is reopened (the open state is an
  // external prop we synchronise with).
  React.useEffect(() => {
    if (open && !wasOpenRef.current) {
      setStep("type")
      setDownloading(false)
    }
    wasOpenRef.current = open
  }, [open])

  const update = (patch: Partial<ContractDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }))

  const updateRoommate = (id: string, patch: Partial<Roommate>) =>
    setDraft((prev) => ({
      ...prev,
      roommates: prev.roommates.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    }))

  const addRoommate = () =>
    setDraft((prev) => ({
      ...prev,
      roommates: [...prev.roommates, newRoommate()],
    }))

  const removeRoommate = (id: string) =>
    setDraft((prev) => ({
      ...prev,
      roommates:
        prev.roommates.length > 1
          ? prev.roommates.filter((r) => r.id !== id)
          : prev.roommates,
    }))

  const handleDownload = async () => {
    if (!documentRef.current) return
    setDownloading(true)
    try {
      await downloadNodeAsPdf(
        documentRef.current,
        `${draft.type === "roommate" ? "roommate-agreement" : "residential-lease"}-${Date.now()}.pdf`
      )
      toast.success("Contract downloaded", {
        description: "Your PDF has been saved.",
      })
    } catch (err) {
      toast.error("Couldn't generate the PDF", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setDownloading(false)
    }
  }

  const switchType = (type: ContractType) => {
    setDraft((prev) => ({ ...prev, type }))
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Content
          aria-describedby="contract-generator-description"
          className="fixed top-1/2 left-1/2 z-50 grid max-h-[88vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 grid-rows-[auto_auto_1fr_auto] gap-4 border border-border bg-background p-6 shadow-xl sm:max-w-2xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="size-5 text-accent" aria-hidden="true" />
                Contract Generator
              </Dialog.Title>
              <Dialog.Description
                id="contract-generator-description"
                className="mt-1 text-sm text-muted-foreground"
              >
                {STEP_LABELS[step]} — Step{" "}
                {["type", "details", "preview"].indexOf(step) + 1} of 3
              </Dialog.Description>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span className="sr-only">Close</span>
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {(["type", "details", "preview"] as Step[]).map((s, i) => {
              const current = s === step
              const done =
                ["type", "details", "preview"].indexOf(s) <
                ["type", "details", "preview"].indexOf(step)
              return (
                <React.Fragment key={s}>
                  {i > 0 && (
                    <span
                      className={cn(
                        "h-px flex-1",
                        done ? "bg-accent" : "bg-border"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      current
                        ? "bg-accent text-white"
                        : done
                          ? "bg-accent/20 text-accent"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {done ? <CheckIcon /> : i + 1}
                  </span>
                </React.Fragment>
              )
            })}
          </div>

          <div className="min-h-0 overflow-y-auto pr-1">
            {step === "type" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {CONTRACT_TYPE_OPTIONS.map((option) => {
                  const Icon = option.value === "roommate" ? Users : Home
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        switchType(option.value)
                        setStep("details")
                      }}
                      className={cn(
                        "group flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all",
                        draft.type === option.value
                          ? "border-accent bg-accent/5"
                          : "border-border bg-background/70 hover:border-accent/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-xl transition-colors",
                          draft.type === option.value
                            ? "bg-accent text-white"
                            : "bg-muted text-muted-foreground group-hover:text-accent"
                        )}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-foreground">
                          {option.title}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {step === "details" && (
              <div className="space-y-4">
                <SectionCard title="Property & dates">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Property address">
                        <input
                          className={inputClass}
                          value={draft.propertyAddress}
                          onChange={(e) =>
                            update({ propertyAddress: e.target.value })
                          }
                          placeholder="12 Long Street, Cape Town"
                        />
                      </Field>
                    </div>
                    <Field label="Agreement date">
                      <input
                        type="date"
                        className={inputClass}
                        value={draft.agreementDate}
                        onChange={(e) =>
                          update({ agreementDate: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Start date">
                      <input
                        type="date"
                        className={inputClass}
                        value={draft.termStart}
                        onChange={(e) => update({ termStart: e.target.value })}
                      />
                    </Field>
                    <Field
                      label="End date"
                      hint="Leave blank for a continuing term."
                    >
                      <input
                        type="date"
                        className={inputClass}
                        value={draft.termEnd}
                        onChange={(e) => update({ termEnd: e.target.value })}
                      />
                    </Field>
                    <Field label="Monthly rent (R)">
                      <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={draft.monthlyRent}
                        onChange={(e) =>
                          update({ monthlyRent: e.target.value })
                        }
                        placeholder="4500"
                      />
                    </Field>
                  </div>
                </SectionCard>

                {draft.type === "roommate" ? (
                  <SectionCard title="Roommates">
                    <div className="space-y-3">
                      {draft.roommates.map((roommate, index) => (
                        <div
                          key={roommate.id}
                          className="space-y-2 rounded-xl border border-border/60 bg-background/50 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              Roommate {index + 1}
                            </span>
                            {draft.roommates.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeRoommate(roommate.id)}
                                className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                aria-label={`Remove roommate ${index + 1}`}
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Field label="Full name">
                              <input
                                className={inputClass}
                                value={roommate.name}
                                onChange={(e) =>
                                  updateRoommate(roommate.id, {
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Jane Doe"
                              />
                            </Field>
                            <Field label="Email">
                              <input
                                type="email"
                                className={inputClass}
                                value={roommate.email}
                                onChange={(e) =>
                                  updateRoommate(roommate.id, {
                                    email: e.target.value,
                                  })
                                }
                                placeholder="jane@example.com"
                              />
                            </Field>
                            <Field label="Phone">
                              <input
                                className={inputClass}
                                value={roommate.phone}
                                onChange={(e) =>
                                  updateRoommate(roommate.id, {
                                    phone: e.target.value,
                                  })
                                }
                                placeholder="071 234 5678"
                              />
                            </Field>
                            <Field label="Move-in date">
                              <input
                                type="date"
                                className={inputClass}
                                value={roommate.moveInDate}
                                onChange={(e) =>
                                  updateRoommate(roommate.id, {
                                    moveInDate: e.target.value,
                                  })
                                }
                              />
                            </Field>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addRoommate}
                      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-accent/50 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/5"
                    >
                      <Plus className="size-3.5" />
                      Add roommate
                    </button>
                  </SectionCard>
                ) : (
                  <SectionCard title="Parties">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Landlord name">
                        <input
                          className={inputClass}
                          value={draft.landlordName}
                          onChange={(e) =>
                            update({ landlordName: e.target.value })
                          }
                          placeholder="John Smith"
                        />
                      </Field>
                      <Field label="Landlord contact">
                        <input
                          className={inputClass}
                          value={draft.landlordContact}
                          onChange={(e) =>
                            update({ landlordContact: e.target.value })
                          }
                          placeholder="Email or phone"
                        />
                      </Field>
                      <Field label="Tenant name">
                        <input
                          className={inputClass}
                          value={draft.tenantName}
                          onChange={(e) =>
                            update({ tenantName: e.target.value })
                          }
                          placeholder="Jane Doe"
                        />
                      </Field>
                      <Field label="Tenant contact">
                        <input
                          className={inputClass}
                          value={draft.roommates[0]?.email ?? ""}
                          onChange={(e) => {
                            const first = draft.roommates[0]
                            if (first)
                              updateRoommate(first.id, {
                                email: e.target.value,
                              })
                          }}
                          placeholder="Email or phone"
                        />
                      </Field>
                    </div>
                  </SectionCard>
                )}

                <SectionCard title="Money">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Security deposit (R)">
                      <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={draft.deposit}
                        onChange={(e) => update({ deposit: e.target.value })}
                        placeholder="9000"
                      />
                    </Field>
                    <Field label="Deposit returned within (days)">
                      <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={draft.depositReturnDays}
                        onChange={(e) =>
                          update({ depositReturnDays: e.target.value })
                        }
                        placeholder="14"
                      />
                    </Field>
                    {draft.type === "roommate" && (
                      <Field label="How is rent split?">
                        <select
                          className={inputClass}
                          value={draft.rentSplit}
                          onChange={(e) =>
                            update({
                              rentSplit: e.target
                                .value as ContractDraft["rentSplit"],
                            })
                          }
                        >
                          <option value="equal">Equally</option>
                          <option value="custom">Custom amounts</option>
                        </select>
                      </Field>
                    )}
                    {draft.type === "lease" && (
                      <Field label="Annual rent increase (%)">
                        <input
                          type="number"
                          min="0"
                          className={inputClass}
                          value={draft.annualIncrease}
                          onChange={(e) =>
                            update({ annualIncrease: e.target.value })
                          }
                          placeholder="8"
                        />
                      </Field>
                    )}
                    <Field label="Notice period (days)">
                      <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={draft.noticePeriod}
                        onChange={(e) =>
                          update({ noticePeriod: e.target.value })
                        }
                        placeholder="30"
                      />
                    </Field>
                  </div>

                  {draft.type === "roommate" &&
                    draft.rentSplit === "custom" &&
                    draft.roommates.filter((r) => r.name.trim()).length > 1 && (
                      <div className="space-y-2 rounded-xl bg-muted/30 p-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          Individual rent shares (R/month)
                        </p>
                        {draft.roommates
                          .filter((r) => r.name.trim())
                          .map((r) => (
                            <div key={r.id} className="flex items-center gap-2">
                              <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                                {r.name}
                              </span>
                              <input
                                type="number"
                                min="0"
                                className={cn(inputClass, "w-32")}
                                value={draft.rentSplits?.[r.name] ?? ""}
                                onChange={(e) =>
                                  update({
                                    rentSplits: {
                                      ...draft.rentSplits,
                                      [r.name]: e.target.value,
                                    },
                                  })
                                }
                                placeholder="0"
                              />
                            </div>
                          ))}
                      </div>
                    )}
                </SectionCard>

                <SectionCard title="House rules">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Utilities included / shared monthly amount (R)">
                      <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={draft.utilityMonthly}
                        onChange={(e) =>
                          update({ utilityMonthly: e.target.value })
                        }
                        placeholder="1200"
                      />
                    </Field>
                    {draft.type === "roommate" && (
                      <Field label="How are bills split?">
                        <select
                          className={inputClass}
                          value={draft.billsSplit}
                          onChange={(e) =>
                            update({
                              billsSplit: e.target
                                .value as ContractDraft["billsSplit"],
                            })
                          }
                        >
                          <option value="equal">Equally</option>
                          <option value="usage">By usage</option>
                          <option value="custom">Custom</option>
                        </select>
                      </Field>
                    )}
                    <Field label="Quiet hours start">
                      <input
                        type="time"
                        className={inputClass}
                        value={draft.quietHours}
                        onChange={(e) => update({ quietHours: e.target.value })}
                      />
                    </Field>
                    <Field label="Guest / overnight stay rule">
                      <input
                        className={inputClass}
                        value={draft.guestsNotice}
                        onChange={(e) =>
                          update({ guestsNotice: e.target.value })
                        }
                        placeholder="e.g. max 3 nights, or 48h notice"
                      />
                    </Field>
                  </div>

                  {draft.type === "roommate" && (
                    <Field label="Chores & cleaning schedule (optional)">
                      <textarea
                        className={cn(inputClass, "min-h-20 resize-y")}
                        value={draft.chores}
                        onChange={(e) => update({ chores: e.target.value })}
                        placeholder="e.g. Weekly kitchen rotation on Sundays; bathroom fortnightly."
                      />
                    </Field>
                  )}

                  <div className="grid gap-2 sm:grid-cols-2">
                    <OptionToggle
                      checked={draft.includeUtilities}
                      onChange={(v) => update({ includeUtilities: v })}
                      label="Include utilities clause"
                    />
                    {draft.type === "roommate" && (
                      <OptionToggle
                        checked={draft.includeChores}
                        onChange={(v) => update({ includeChores: v })}
                        label="Include chores & cleaning"
                      />
                    )}
                    <OptionToggle
                      checked={draft.includeGuests}
                      onChange={(v) => update({ includeGuests: v })}
                      label="Include guest policy"
                    />
                    <OptionToggle
                      checked={draft.includePets}
                      onChange={(v) => update({ includePets: v })}
                      label="Include pets clause"
                    />
                    {draft.includePets && (
                      <OptionToggle
                        checked={draft.petsAllowed}
                        onChange={(v) => update({ petsAllowed: v })}
                        label="Pets allowed"
                      />
                    )}
                    <OptionToggle
                      checked={draft.smokingAllowed}
                      onChange={(v) => update({ smokingAllowed: v })}
                      label="Smoking allowed"
                    />
                    {draft.type === "lease" && (
                      <>
                        <OptionToggle
                          checked={draft.includeSubletting}
                          onChange={(v) => update({ includeSubletting: v })}
                          label="Include subletting clause"
                        />
                        {draft.includeSubletting && (
                          <OptionToggle
                            checked={draft.sublettingAllowed}
                            onChange={(v) => update({ sublettingAllowed: v })}
                            label="Subletting allowed"
                          />
                        )}
                        <OptionToggle
                          checked={draft.furnished}
                          onChange={(v) => update({ furnished: v })}
                          label="Furnished property"
                        />
                        <OptionToggle
                          checked={draft.repairsByLandlord}
                          onChange={(v) => update({ repairsByLandlord: v })}
                          label="Landlord handles repairs"
                        />
                      </>
                    )}
                    <OptionToggle
                      checked={draft.includeInsurance}
                      onChange={(v) => update({ includeInsurance: v })}
                      label="Include insurance clause"
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Additional terms">
                  <Field
                    label="Special terms (optional)"
                    hint="Anything else you want covered — short stays, parking, deposit deductions, etc."
                  >
                    <textarea
                      className={cn(inputClass, "min-h-20 resize-y")}
                      value={draft.specialTerms}
                      onChange={(e) => update({ specialTerms: e.target.value })}
                      placeholder="e.g. No subletting. One parking bay included. WiFi R400/m shared."
                    />
                  </Field>
                </SectionCard>
              </div>
            )}

            {step === "preview" && (
              <div className="space-y-3">
                <div className="max-h-[52vh] overflow-auto rounded-xl border border-border bg-muted/40 p-4">
                  <ContractDocument ref={documentRef} draft={draft} />
                </div>
                <p className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-accent" />
                  This document is a general template to help you record your
                  arrangement. It is not legal advice. Have it reviewed by a
                  qualified professional before signing.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {step === "type" ? "Cancel" : "Close"}
            </button>
            <div className="flex items-center gap-2">
              {step !== "type" && (
                <button
                  type="button"
                  onClick={() =>
                    setStep(step === "preview" ? "details" : "type")
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  Back
                </button>
              )}
              {step === "details" && (
                <button
                  type="button"
                  onClick={() => setStep("preview")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                >
                  <Eye className="size-3.5" aria-hidden="true" />
                  Preview
                </button>
              )}
              {step === "preview" && (
                <button
                  type="button"
                  onClick={() => void handleDownload()}
                  disabled={downloading}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-60"
                >
                  <Download className="size-3.5" aria-hidden="true" />
                  {downloading ? "Generating…" : "Download PDF"}
                </button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function CheckIcon() {
  return (
    <svg
      className="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
