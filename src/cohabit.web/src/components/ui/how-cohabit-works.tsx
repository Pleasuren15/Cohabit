"use client"

import { Check, FileCheck2, FilePenLine, IdCard } from "lucide-react"

const STEPS = [
  {
    title: "Create your profile",
    description:
      "Add your personal info and verify your identity to build trust with the community.",
    icon: Check,
    completed: true,
  },
  {
    title: "Browse & save",
    description:
      "Explore listings from verified members across all 9 provinces and save your favourites.",
    icon: IdCard,
  },
  {
    title: "Connect & chat",
    description:
      "Message potential housemates, arrange viewings, and agree on the details that matter.",
    icon: FilePenLine,
  },
  {
    title: "Move in together",
    description:
      "Finalise your agreement and start your new co-habitation journey with confidence.",
    icon: FileCheck2,
  },
]

/**
 * Vertical timeline showing how Cohabit works, used on the Info page.
 */
export function HowCohabitWorks() {
  return (
    <ol className="relative border-s border-border/40">
      {STEPS.map((step, index) => {
        const Icon = step.icon
        return (
          <li
            key={step.title}
            className={`ms-7 ${index < STEPS.length - 1 ? "mb-10" : ""}`}
          >
            <span
              className={`absolute flex size-8 -start-4 items-center justify-center rounded-full ring-4 ring-background ${
                step.completed
                  ? "bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                  : "bg-muted text-foreground"
              }`}
            >
              <Icon className="size-5" />
            </span>
            <h3 className="font-medium leading-tight text-foreground">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </li>
        )
      })}
    </ol>
  )
}
