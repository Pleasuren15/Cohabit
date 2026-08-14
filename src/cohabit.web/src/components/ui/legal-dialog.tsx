"use client"

import { ChevronLeftIcon, FileText, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  LEGAL_LAST_UPDATED,
  PRIVACY_POLICY,
  TERMS_OF_USE,
  type LegalSection,
} from "@/lib/legal-content"

const LEGAL_CONFIG = {
  terms: {
    title: "Terms of Use",
    icon: FileText,
    sections: TERMS_OF_USE,
  },
  privacy: {
    title: "Privacy Policy",
    icon: ShieldCheck,
    sections: PRIVACY_POLICY,
  },
} as const

export type LegalDocumentType = keyof typeof LEGAL_CONFIG

interface LegalDialogProps {
  type: LegalDocumentType
  children: React.ReactNode
  className?: string
}

/**
 * Opens a scrollable dialog containing the requested legal document
 * (Terms of Use or Privacy Policy). The trigger renders as an inline
 * link-style button so it can sit inside a sentence.
 */
export function LegalDialog({ type, children, className }: LegalDialogProps) {
  const config = LEGAL_CONFIG[type]
  const Icon = config.icon

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline text-accent underline-offset-4 hover:underline",
            className
          )}
        >
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(650px,90vh)] flex-col gap-0 overflow-hidden rounded-xl border border-border/40 p-0 shadow-xl sm:max-w-md">
        <DialogHeader className="border-b border-border/40 px-6 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Icon className="size-4 text-accent" />
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 text-sm text-muted-foreground">
            <div className="space-y-4 [&_strong]:font-semibold [&_strong]:text-foreground">
              <div className="space-y-1">
                <p>
                  <strong>Last updated:</strong> {LEGAL_LAST_UPDATED}
                </p>
                <p>
                  Please read this document carefully. It explains your rights
                  and obligations when using Cohabit.
                </p>
              </div>
              {config.sections.map((section: LegalSection) => (
                <div key={section.title} className="space-y-1">
                  <p>
                    <strong>{section.title}</strong>
                  </p>
                  <p>{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/40 bg-background/50 p-4 sm:px-6 sm:pb-6">
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-medium shadow-none sm:w-auto"
            >
              <ChevronLeftIcon className="size-4" />
              Close
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button className="w-full rounded-lg bg-accent px-7 py-2.5 font-semibold text-white shadow-md hover:opacity-90 sm:w-auto">
              Got it
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}