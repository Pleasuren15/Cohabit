"use client"

import { Check, FileCheck2, FilePenLine, IdCard } from "lucide-react"

const STEPS = [
  {
    title: "Create your profile",
    description: "Verify your identity to build trust.",
    icon: Check,
    completed: true,
  },
  {
    title: "Browse & list",
    description: "Find or post rooms across all 9 provinces.",
    icon: IdCard,
  },
  {
    title: "Connect & chat",
    description: "Message hosts and arrange viewings.",
    icon: FilePenLine,
  },
  {
    title: "Settle in",
    description: "Sign your agreement and move in.",
    icon: FileCheck2,
  },
]

/**
 * Numbered editorial timeline showing how Cohabit works, used on the Info page.
 */
export function HowCohabitWorks() {
  return (
    <ol className="relative border-s border-dashed border-accent/30">
      {STEPS.map((step, index) => (
        <li
          key={step.title}
          className={`ms-9 ${index < STEPS.length - 1 ? "mb-8" : ""}`}
        >
          <span className="absolute flex size-7 -start-[15px] items-center justify-center rounded-full border border-accent/30 bg-background text-[11px] font-bold text-accent">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-semibold leading-tight text-foreground">
            {step.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  )
}
