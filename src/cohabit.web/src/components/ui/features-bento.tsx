"use client"

import {
  FileCheck2,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from "lucide-react"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { PROVINCES } from "@/lib/provinces"

/**
 * "Why Cohabit" bento band for the Info page — Aceternity UI Bento Grid
 * combined with Text Generate Effect and Infinite Moving Cards.
 */
export function FeaturesBento() {
  return (
    <section
      id="info-features"
      className="w-full scroll-mt-16 rounded-3xl border border-border/70 bg-background p-5 shadow-sm"
    >
      <span className="text-[10px] font-bold tracking-[0.22em] text-accent uppercase">
        Why Cohabit
      </span>
      <TextGenerateEffect
        words="Everything you need to cohabit with confidence"
        className="mt-1 max-w-md text-xl font-semibold tracking-tight text-foreground"
        stagger={0.05}
      />

      <BentoGrid className="mt-5">
        <BentoCard
          icon={<MapPin className="size-4" aria-hidden="true" />}
          name="Coast to coast"
          description="Listings across all nine South African provinces."
          className="md:col-span-2"
        >
          <InfiniteMovingCards items={Object.values(PROVINCES)} speed="normal" />
        </BentoCard>

        <BentoCard
          icon={<ShieldCheck className="size-4" aria-hidden="true" />}
          name="Verified hosts & tenants"
          description="Multi-level ID verification builds trust on both sides of every listing."
        />

        <BentoCard
          icon={<MessageSquare className="size-4" aria-hidden="true" />}
          name="Connect & chat"
          description="Message hosts directly and arrange viewings without leaving the app."
        />

        <BentoCard
          icon={<FileCheck2 className="size-4" aria-hidden="true" />}
          name="Paperwork, sorted"
          description="Generate and sign your rental agreement digitally before move-in day."
          className="md:col-span-2"
        />
      </BentoGrid>
    </section>
  )
}
