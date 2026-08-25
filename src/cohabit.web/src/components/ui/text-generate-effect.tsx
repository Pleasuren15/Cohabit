"use client"

import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import type { MotionProps } from "motion/react"

interface TextGenerateEffectProps extends MotionProps {
  /** Text to reveal word by word */
  words: string
  className?: string
  /** Seconds between each word */
  stagger?: number
  /** Animate every time the element scrolls into view */
  repeatOnView?: boolean
}

/**
 * Aceternity UI "Text Generate Effect" — reveals words one by one with a
 * blur-to-sharp fade as the element enters the viewport.
 * Adapted to Cohabit tokens (semantic colours, motion/react).
 */
export function TextGenerateEffect({
  words,
  className,
  stagger = 0.06,
  repeatOnView = false,
  ...motionProps
}: TextGenerateEffectProps) {
  const tokens = words.split(" ")

  return (
    <motion.p
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !repeatOnView, amount: 0.4 }}
      {...motionProps}
      className={cn("text-balance leading-relaxed", className)}
    >
      {tokens.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={{
            hidden: { opacity: 0, filter: "blur(8px)" },
            visible: { opacity: 1, filter: "blur(0px)" },
          }}
          transition={{ duration: 0.4, ease: "easeOut", delay: index * stagger }}
          className="inline-block"
        >
          {word}
          {index < tokens.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.p>
  )
}
