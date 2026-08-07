"use client"

import { type FC, type ReactNode } from "react"
import { motion } from "motion/react"

/* --- Props --- */
interface SwitchModeProps {
  checked: boolean
  onChange: (checked: boolean) => void
  width?: number
  height?: number
  onColor?: string
  offColor?: string
  knobOnColor?: string
  knobOffColor?: string
  borderOnColor?: string
  borderOffColor?: string
  onIcon?: ReactNode
  offIcon?: ReactNode
  ariaLabel?: string
}

/**
 * Controlled switch (radio-style toggle) with sliding knob and icons.
 * Adapted from the watermelon.sh `switch-mode` registry item to be a
 * controlled component (no next-themes dependency).
 */
export const SwitchMode: FC<SwitchModeProps> = ({
  checked,
  onChange,
  width = 144,
  height = 72,
  onColor = "#0B0B0B",
  offColor = "#FFFFFF",
  knobOnColor = "#2A2A2E",
  knobOffColor = "#F3F2F7",
  borderOnColor = "#4C4C50",
  borderOffColor = "#D8D6E0",
  onIcon,
  offIcon,
  ariaLabel = "Toggle",
}) => {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="relative flex items-center rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
      style={{
        width,
        height,
        borderColor: checked ? borderOnColor : borderOffColor,
      }}
    >
      {/* TRACK */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ backgroundColor: checked ? onColor : offColor }}
        transition={{ duration: 0.4 }}
      />

      {/* SLIDING KNOB */}
      <motion.div
        layout
        layoutId="switch-knob"
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="absolute z-30 rounded-full border-2"
        style={{
          width: height,
          height,
          right: checked ? -2 : undefined,
          left: checked ? undefined : -2,
          backgroundColor: checked ? knobOnColor : knobOffColor,
          borderColor: checked ? borderOnColor : borderOffColor,
        }}
      />

      {/* OFF ICON */}
      <motion.div
        className="relative z-30 flex items-center justify-center"
        style={{ width: height, height }}
        animate={{ rotate: checked ? 0 : 15 }}
        transition={{ stiffness: 20, damping: 14 }}
      >
        {offIcon}
      </motion.div>

      {/* ON ICON */}
      <motion.div
        className="relative z-30 flex items-center justify-center"
        style={{ width: height, height }}
        animate={{ rotate: checked ? 45 : 0 }}
        transition={{ stiffness: 20 }}
      >
        {onIcon}
      </motion.div>
    </motion.button>
  )
}