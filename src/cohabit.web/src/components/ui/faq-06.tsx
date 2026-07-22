"use client"

import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FaPlus, FaMinus } from "react-icons/fa"
import { cn } from "@/lib/utils"

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface Faq6Props {
  badge?: string
  title: React.ReactNode
  faqs: FaqItem[]
  className?: string
}

export function Faq6({ badge, title, faqs, className }: Faq6Props) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-6xl border-y border-dashed border-border md:border-x",
        className,
      )}
    >
      <div className="relative grid grid-cols-1 md:grid-cols-12">
        <div className="flex flex-col justify-start border-b border-dashed border-border p-8 md:col-span-4 md:border-b-0 md:border-r md:p-12 lg:col-span-5">
          {badge && (
            <span className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {badge}
            </span>
          )}
          <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {title}
          </h2>
        </div>

        <div className="relative md:col-span-8 lg:col-span-7">
          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px border-l border-dashed border-border md:block" />
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-b border-dashed border-border px-6 md:px-8 last:border-b-0"
              >
                <AccordionTrigger className="group flex items-center py-6 md:py-8 hover:no-underline [&_[data-slot=accordion-trigger-icon]]:hidden">
                  <div className="flex flex-1 items-center gap-6">
                    <span className="text-xs font-semibold tracking-widest text-muted-foreground">
                      Q{index + 1}
                    </span>
                    <span className="text-left text-base font-medium text-foreground md:text-lg">
                      {faq.question}
                    </span>
                  </div>
                  <div className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-muted/80">
                    <FaPlus className="block h-3 w-3 group-data-[state=open]:hidden" />
                    <FaMinus className="hidden h-3 w-3 group-data-[state=open]:block" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-8 pl-[3.25rem] pr-12">
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
