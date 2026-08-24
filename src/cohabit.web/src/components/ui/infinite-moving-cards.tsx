"use client"

import { cn } from "@/lib/utils"

interface InfiniteMovingCardsProps {
  /** Flat list of strings rendered as pill cards */
  items: string[]
  direction?: "left" | "right"
  speed?: "slow" | "normal" | "fast"
  pauseOnHover?: boolean
  className?: string
}

/**
 * Aceternity UI "Infinite Moving Cards" — an endless marquee of cards.
 * Requires the `--animate-scroll` theme token and `@keyframes scroll`
 * defined in `index.css`. Adapted to Cohabit tokens.
 */
export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: InfiniteMovingCardsProps) {
  const duplicatedItems = [...items, ...items]

  return (
    <div
      className={cn(
        "relative z-0 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_4%,white_96%,transparent)]",
        className,
      )}
    >
      <ul
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-3 py-1",
          "animate-scroll",
          "[animation-duration:var(--animation-duration)] [animation-direction:var(--animation-direction)]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={
          {
            "--animation-direction": direction === "left" ? "forwards" : "reverse",
            "--animation-duration": speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s",
          } as React.CSSProperties
        }
      >
        {duplicatedItems.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="relative shrink-0 whitespace-nowrap rounded-full border border-border/50 bg-muted/60 px-4 py-1.5"
          >
            <span className="text-[13px] leading-none font-medium text-muted-foreground">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
