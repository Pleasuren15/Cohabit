"use client"

import { ChevronLeftIcon, ShieldCheck } from "lucide-react"

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

const PRIVACY_SECTIONS = [
  {
    title: "1. Why we collect your data",
    body: "We collect only what's needed to run Cohabit: your profile, preferences, and listings so we can match you with compatible co-habitants and keep the platform safe.",
  },
  {
    title: "2. We never sell your data",
    body: "We do not sell, rent, or trade your personal information to anyone. Ever. There is no data broker in our business model — trust is.",
  },
  {
    title: "3. What we share",
    body: "Only the minimum needed to connect you. Your profile is shown to members you contact, and service providers (hosting, email) get access on a need-to-know basis under strict confidentiality agreements.",
  },
  {
    title: "4. Your control",
    body: "You can edit or remove your profile data at any time from this page. Deleting your account removes your data from our systems.",
  },
  {
    title: "5. Data retention",
    body: "We keep your data only while your account is active, or as long as the law requires. We don't hold onto it 'just in case'.",
  },
]

/**
 * Privacy card shown on the account page. Opens a sticky-header dialog that
 * explains how Cohabit uses member data and that it is never shared or sold.
 */
export function PrivacyDialog() {
  return (
    <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-b from-emerald-50/60 to-background p-5 shadow-sm dark:border-emerald-500/25 dark:from-emerald-500/10 dark:to-background">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="size-4 text-emerald-500" />
        <h3 className="text-sm font-semibold">Privacy Promise</h3>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        Your data is yours. We never sell it, and we only share the minimum
        needed to connect you with co-habitants.
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full rounded-xl px-6 py-2 font-medium shadow-sm"
          >
            How we use your data
          </Button>
        </DialogTrigger>
        <DialogContent className="flex max-h-[min(650px,90vh)] flex-col gap-0 overflow-hidden rounded-xl border border-border/40 p-0 shadow-xl sm:max-w-md">
          <DialogHeader className="border-b border-border/40 px-6 py-4 text-left">
            <DialogTitle className="text-lg font-semibold">
              How we use your data
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 text-sm text-muted-foreground">
              <div className="space-y-4 [&_strong]:font-semibold [&_strong]:text-foreground">
                <div className="space-y-1">
                  <p>
                    <strong>Last updated:</strong> August 2026
                  </p>
                  <p>
                    We believe you should know exactly what happens with your
                    information on Cohabit. Here's our plain-language promise.
                  </p>
                </div>
                {PRIVACY_SECTIONS.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <p>
                      <strong>{section.title}</strong>
                    </p>
                    <p>{section.body}</p>
                  </div>
                ))}
                <div className="space-y-1">
                  <p>
                    <strong>Our commitment:</strong>
                  </p>
                  <p>
                    We're building Cohabit on trust. Your data stays yours —
                    we'll always tell you before anything changes.
                  </p>
                </div>
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
    </div>
  )
}
