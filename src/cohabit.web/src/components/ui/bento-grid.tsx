"use client"

import { cn } from "@/lib/utils"

type BentoGridProps = React.HTMLAttributes<HTMLDivElement>

/**
 * Aceternity UI "Bento Grid" — responsive masonry-style grid.
 * Cards span columns via the `col-span-*` / `row-span-*` utilities.
 */
export function BentoGrid({ className, children, ...props }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[14rem] grid-cols-1 gap-3 md:auto-rows-[15rem] md:grid-cols-3 md:gap-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon rendered in an accent chip at the top of the card */
  icon?: React.ReactNode
  name: string
  description: string
  /** Rendered under the copy (e.g. a marquee, chart, illustration) */
  children?: React.ReactNode
}

/**
 * Single bento cell with an accent glow that follows hover,
 * restyled for Cohabit tokens (border-border/70, bg-background, accent).
 */
export function BentoCard({
  icon,
  name,
  description,
  children,
  className,
  ...props
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-background p-5",
        "transition-colors duration-300 hover:border-accent/40",
        className,
      )}
      {...props}
    >
      {/* Hover glow */}
      <div
        className={cn(
          "pointer-events-none absolute -bottom-24 -left-16 z-0 h-56 w-[130%] rounded-full opacity-0 blur-3xl",
          "bg-accent/10 transition-opacity duration-500 group-hover:opacity-100 dark:bg-accent/15",
        )}
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-2">
        {icon && (
          <span className="flex size-8 items-center justify-center rounded-full bg-accent/10 text-accent">
            {icon}
          </span>
        )}
        <h3 className="font-semibold leading-tight tracking-tight text-foreground">
          {name}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {children && <div className="relative z-10">{children}</div>}
    </div>
  )
}
