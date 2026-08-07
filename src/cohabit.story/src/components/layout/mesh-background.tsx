import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

export interface MeshBackgroundProps {
  className?: string
  animated?: boolean
  intensity?: "subtle" | "medium" | "strong"
}

const BLOBS = [
  {
    className: "h-96 w-96 md:h-[32rem] md:w-[32rem]",
    style: { left: "-10%", top: "-12%" },
    drift: { x: 160, y: 90 },
    duration: 26,
    bg: "bg-accent/50",
  },
  {
    className: "h-80 w-80 md:h-[28rem] md:w-[28rem]",
    style: { right: "-8%", top: "8%" },
    drift: { x: -140, y: 130 },
    duration: 30,
    bg: "bg-primary/25",
  },
  {
    className: "h-72 w-72 md:h-[26rem] md:w-[26rem]",
    style: { left: "12%", bottom: "-14%" },
    drift: { x: 170, y: -110 },
    duration: 22,
    bg: "bg-accent/40",
  },
  {
    className: "h-80 w-80 md:h-[30rem] md:w-[30rem]",
    style: { right: "10%", bottom: "-10%" },
    drift: { x: -150, y: -130 },
    duration: 18,
    bg: "bg-primary/20",
  },
]

const INTENSITY_OPACITY: Record<
  NonNullable<MeshBackgroundProps["intensity"]>,
  string
> = {
  subtle: "opacity-30",
  medium: "opacity-60",
  strong: "opacity-100",
}

export function MeshBackground({
  className,
  animated = true,
  intensity = "medium",
}: MeshBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-background",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity",
          INTENSITY_OPACITY[intensity]
        )}
      >
        {BLOBS.map((blob, index) => (
          <motion.div
            key={index}
            className={cn("absolute rounded-full blur-3xl", blob.bg, blob.className)}
            style={blob.style}
            initial={false}
            animate={
              animated ? { x: blob.drift.x, y: blob.drift.y } : undefined
            }
            transition={
              animated
                ? {
                    duration: blob.duration,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror",
                  }
                : undefined
            }
          />
        ))}
      </div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in oklch, var(--foreground) 8%, transparent) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  )
}

export default MeshBackground
