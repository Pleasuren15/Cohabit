"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import gsap from "gsap"

type DockIcon = React.ComponentType<{ className?: string }>

export interface DockItem {
  title: string
  icon: DockIcon
  onClick?: () => void
  href?: string
  /** Optional Tailwind classes applied to the item container. */
  className?: string
}

export interface GlassDockProps extends React.HTMLAttributes<HTMLDivElement> {
  items: DockItem[]
  dockClassName?: string
  /** Title of the currently active item; drives the highlighted state. */
  activeTitle?: string
  /** Render a persistent text label under each icon (mobile bottom-nav style). */
  showLabels?: boolean
}

interface MorphConfig {
  initial: string
  paths: [string, string, string]
  durations: [number, number, number]
  fill?: boolean
}

// Data-driven morph keyframes (deduped from seven near-identical animate* fns).
const MORPH_CONFIGS: Record<string, MorphConfig> = {
  home: {
    initial:
      "M3 18V10.5339C3 9.57062 3.46259 8.66591 4.24353 8.1019L10.2435 3.76856C11.2921 3.01128 12.7079 3.01128 13.7565 3.76856L19.7565 8.1019C20.5374 8.66591 21 9.57062 21 10.5339V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18Z",
    paths: [
      "M12.6387 3.53796L15.1949 7.69178C15.7004 8.51322 15.7802 9.5276 15.4092 10.4179L11.3846 20.0769C11.2016 20.516 11.5243 21 12 21V21C12.4757 21 12.7984 20.516 12.6154 20.0769L8.5908 10.4179C8.21983 9.5276 8.29956 8.51322 8.80506 7.69178L11.3613 3.53796C11.6541 3.06206 12.3459 3.06206 12.6387 3.53796Z",
      "M12.1483 3.46366L12.8548 8.05624C12.9493 8.67024 12.8508 9.29842 12.573 9.85405L8.08541 18.8292C7.58673 19.8265 8.31198 21 9.42705 21H14.5729C15.688 21 16.4133 19.8265 15.9146 18.8292L11.427 9.85405C11.1492 9.29842 11.0507 8.67024 11.1452 8.05624L11.8517 3.46366C11.8778 3.29407 12.1222 3.29407 12.1483 3.46366Z",
      "M21 18V10.5339C21 9.57062 20.5374 8.66591 19.7565 8.1019L13.7565 3.76856C12.7079 3.01128 11.2921 3.01128 10.2435 3.76856L4.24353 8.1019C3.46259 8.66591 3 9.57062 3 10.5339V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18Z",
    ],
    durations: [0.1, 0.09, 0.71],
  },
  blog: {
    initial:
      "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    paths: [
      "M12 21C12 21 15.3954 18.8605 13.3637 16C12.0647 14.1711 9.51275 11.9823 9 10C8 6.134 10.134 3 12 3C13.866 3 16 6.134 15 10C14.4873 11.9823 11.9353 14.1711 10.6363 16C8.60464 18.8605 12 21 12 21Z",
      "M12 21C12 21 14.0216 19.0215 14.3637 16C14.6026 13.8898 13.5128 11.9823 13 10C12 6.134 13.134 3 12 3C10.866 3 12 6.134 11 10C10.4873 11.9823 9.39736 13.8898 9.6363 16C9.97843 19.0215 12 21 12 21Z",
      "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    ],
    durations: [0.1, 0.05, 0.7],
  },
  marker: {
    initial:
      "M12 21C12 21 9.39536 18.8605 7.3637 16C6.06474 14.1711 5 12.0475 5 10C5 6.134 8.134 3 12 3C15.866 3 19 6.134 19 10C19 12.0475 17.9353 14.1711 16.6363 16C14.6046 18.8605 12 21 12 21Z",
    paths: [
      "M12 21C12 21 15.3954 18.8605 13.3637 16C12.0647 14.1711 9.51275 11.9823 9 10C8 6.134 10.134 3 12 3C13.866 3 16 6.134 15 10C14.4873 11.9823 11.9353 14.1711 10.6363 16C8.60464 18.8605 12 21 12 21Z",
      "M12 21C12 21 14.0216 19.0215 14.3637 16C14.6026 13.8898 13.5128 11.9823 13 10C12 6.134 13.134 3 12 3C10.866 3 12 6.134 11 10C10.4873 11.9823 9.39736 13.8898 9.6363 16C9.97843 19.0215 12 21 12 21Z",
      "M12 21C12 21 14.6062 18.8589 16.64 16C17.941 14.1711 19 12.0475 19 10C19 6.134 15.87 3 12 3C8.13 3 5 6.134 5 10C5 12.0475 6.05896 14.1711 7.36 16C9.39381 18.8589 12 21 12 21Z",
    ],
    durations: [0.1, 0.05, 0.75],
  },
  email: {
    initial:
      "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z",
    paths: [
      "M12 21C12 21 15.3954 18.8605 13.3637 16C12.0647 14.1711 9.51275 11.9823 9 10C8 6.134 10.134 3 12 3C13.866 3 16 6.134 15 10C14.4873 11.9823 11.9353 14.1711 10.6363 16C8.60464 18.8605 12 21 12 21Z",
      "M12 21C12 21 14.0216 19.0215 14.3637 16C14.6026 13.8898 13.5128 11.9823 13 10C12 6.134 13.134 3 12 3C10.866 3 12 6.134 11 10C10.4873 11.9823 9.39736 13.8898 9.6363 16C9.97843 19.0215 12 21 12 21Z",
      "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z",
    ],
    durations: [0.1, 0.05, 0.7],
  },
  linkedin: {
    initial:
      "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
    paths: [
      "M12 21C12 21 15.3954 18.8605 13.3637 16C12.0647 14.1711 9.51275 11.9823 9 10C8 6.134 10.134 3 12 3C13.866 3 16 6.134 15 10C14.4873 11.9823 11.9353 14.1711 10.6363 16C8.60464 18.8605 12 21 12 21Z",
      "M13.364 5.63604C14.0062 9.12971 7.68417 13.4401 8.36401 18.3639C8.84929 21.8787 15.1508 21.8787 15.6361 18.3639C16.316 13.4401 9.99389 9.12969 10.6361 5.63604C11.3564 1.71793 12.6438 1.71795 13.364 5.63604Z",
      "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
    ],
    durations: [0.125, 0.05, 0.8],
  },
  x: {
    initial:
      "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
    paths: [
      "M12 21C12 21 15.3954 18.8605 13.3637 16C12.0647 14.1711 9.51275 11.9823 9 10C8 6.134 10.134 3 12 3C13.866 3 16 6.134 15 10C14.4873 11.9823 11.9353 14.1711 10.6363 16C8.60464 18.8605 12 21 12 21Z",
      "M12 21C12 21 14.0216 19.0215 14.3637 16C14.6026 13.8898 13.5128 11.9823 13 10C12 6.134 13.134 3 12 3C10.866 3 12 6.134 11 10C10.4873 11.9823 9.39736 13.8898 9.6363 16C9.97843 19.0215 12 21 12 21Z",
      "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
    ],
    durations: [0.1, 0.05, 0.75],
  },
  github: {
    initial:
      "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
    paths: [
      "M12 21C12 21 15.3954 18.8605 13.3637 16C12.0647 14.1711 9.51275 11.9823 9 10C8 6.134 10.134 3 12 3C13.866 3 16 6.134 15 10C14.4873 11.9823 11.9353 14.1711 10.6363 16C8.60464 18.8605 12 21 12 21Z",
      "M12 21C12 21 14.0216 19.0215 14.3637 16C14.6026 13.8898 13.5128 11.9823 13 10C12 6.134 13.134 3 12 3C10.866 3 12 6.134 11 10C10.4873 11.9823 9.39736 13.8898 9.6363 16C9.97843 19.0215 12 21 12 21Z",
      "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
    ],
    durations: [0.1, 0.05, 0.75],
    fill: true,
  },
}

const ITEM_WIDTH = 52

// Helper component for morphing icons, driven by MORPH_CONFIGS.
const MorphingIcon = ({
  type,
  isActive,
  onClick,
}: {
  type: string
  isActive: boolean
  onClick: () => void
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const config = MORPH_CONFIGS[type]

  // Kill any running tweens on unmount to avoid leaks.
  useEffect(() => {
    const button = buttonRef.current
    const path = pathRef.current
    return () => {
      if (button) gsap.killTweensOf(button)
      if (path) gsap.killTweensOf(path)
    }
  }, [])

  const animate = () => {
    if (!config || !buttonRef.current || !pathRef.current) return
    const button = buttonRef.current
    const path = pathRef.current
    const [d1, d2, d3] = config.durations

    gsap.to(button, {
      [`--tab-bar-${type}-scale`]: 0.25,
      [`--tab-bar-${type}-opacity`]: 0,
      duration: 0.1,
      onComplete: () => {
        gsap.to(path, {
          keyframes: [
            { morphSVG: config.paths[0], duration: d1 },
            { morphSVG: config.paths[1], duration: d2 },
            {
              morphSVG: config.paths[2],
              duration: d3,
              ease: "elastic.out(1, .9)",
              onStart: () => {
                gsap.to(button, {
                  [`--tab-bar-${type}-scale`]: 0.7,
                  duration: d3,
                  ease: "elastic.out(1, .9)",
                })
                gsap.to(button, {
                  [`--tab-bar-${type}-opacity`]: 1,
                  duration: 0.2,
                })
              },
            },
          ],
        })
      },
    })
  }

  if (!config) return null

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={type}
      onClick={onClick}
      onMouseEnter={animate}
      className={cn(type, isActive ? "active" : "")}
    >
      <svg viewBox="0 0 24 24">
        <path
          ref={pathRef}
          d={config.initial}
          fill={config.fill ? "currentColor" : undefined}
          stroke={config.fill ? "none" : undefined}
          fillRule={config.fill ? "evenodd" : undefined}
          clipRule={config.fill ? "evenodd" : undefined}
        />
      </svg>
    </button>
  )
}

export const GlassDock = React.forwardRef<HTMLDivElement, GlassDockProps>(
  (
    {
      items,
      className,
      dockClassName,
      activeTitle,
      showLabels = false,
      ...props
    },
    ref
  ) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [direction, setDirection] = useState(0)

    // Register MorphSVGPlugin once, without a module-scope side effect.
    useEffect(() => {
      let cancelled = false
      import("gsap/MorphSVGPlugin")
        .then((plugin) => {
          if (!cancelled) gsap.registerPlugin(plugin.MorphSVGPlugin)
        })
        .catch(() => {
          // Morphing animations disabled; plain icons still render.
        })
      return () => {
        cancelled = true
      }
    }, [])

    const handleMouseEnter = (index: number) => {
      if (hoveredIndex !== null && index !== hoveredIndex) {
        setDirection(index > hoveredIndex ? 1 : -1)
      }
      setHoveredIndex(index)
    }

    const getTooltipPosition = (index: number) => index * ITEM_WIDTH + 12

    return (
      <div ref={ref} className={cn("w-max", className)} {...props}>
        <div
          className={cn(
            "glass-dock relative flex items-center gap-4 rounded-2xl px-4 py-3",
            "glass-border justify-center bg-background/80 shadow-2xl backdrop-blur-xl",
            dockClassName
          )}
          onMouseLeave={() => {
            setHoveredIndex(null)
            setDirection(0)
          }}
        >
          <AnimatePresence>
            {!showLabels && hoveredIndex !== null && (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: -60,
                  x: getTooltipPosition(hoveredIndex),
                }}
                exit={{ opacity: 0, scale: 0.92, y: 12 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="pointer-events-none absolute top-0 left-0 z-30"
              >
                <div
                  className={cn(
                    "rounded-lg px-5 py-2",
                    "bg-white text-accent",
                    "flex items-center justify-center shadow-md",
                    "border border-neutral-700 dark:border-neutral-300",
                    "min-w-[100px]"
                  )}
                >
                  <div className="relative flex h-4 w-full items-center justify-center overflow-hidden">
                    <AnimatePresence mode="popLayout" custom={direction}>
                      <motion.span
                        key={items[hoveredIndex].title}
                        custom={direction}
                        initial={{
                          x: direction > 0 ? 35 : -35,
                          opacity: 0,
                          filter: "blur(6px)",
                        }}
                        animate={{
                          x: 0,
                          opacity: 1,
                          filter: "blur(0px)",
                        }}
                        exit={{
                          x: direction > 0 ? -35 : 35,
                          opacity: 0,
                          filter: "blur(6px)",
                        }}
                        transition={{
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                        className="text-[13px] font-medium tracking-wide whitespace-nowrap"
                      >
                        {items[hoveredIndex].title}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {items.map((el, index) => {
            const Icon = el.icon
            const isHovered = hoveredIndex === index
            const isActive = activeTitle ? activeTitle === el.title : isHovered
            const isHighlighted = isActive || isHovered

            const handleClick = () => {
              if (el.onClick) {
                el.onClick()
              } else if (el.href) {
                window.location.href = el.href
              }
            }

            // Titles matching a morph config render a real <button> inside,
            // so the wrapper must not also be interactive (no nested buttons).
            const type = el.title.toLowerCase()
            const isAnimated = type in MORPH_CONFIGS

            return (
              <div
                key={el.title}
                onMouseEnter={() => handleMouseEnter(index)}
                onClick={isAnimated ? undefined : handleClick}
                className={cn(
                  "relative flex cursor-pointer flex-col items-center justify-center",
                  showLabels ? "h-auto flex-1 gap-1 py-1" : "h-10 w-10",
                  el.className
                )}
                role={isAnimated ? undefined : "button"}
                aria-current={isActive ? "page" : undefined}
                tabIndex={isAnimated ? undefined : 0}
                onKeyDown={
                  isAnimated
                    ? undefined
                    : (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleClick()
                        }
                      }
                }
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                    y: isHovered ? -3 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  {isAnimated ? (
                    <MorphingIcon
                      type={type}
                      isActive={isActive}
                      onClick={handleClick}
                    />
                  ) : (
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] transition-colors duration-200",
                        isHighlighted ? "text-accent" : "text-muted-foreground"
                      )}
                    />
                  )}
                </motion.div>

                {showLabels && (
                  <span
                    className={cn(
                      "text-[9px] leading-none font-medium whitespace-nowrap transition-colors duration-200",
                      isHighlighted ? "text-accent" : "text-muted-foreground"
                    )}
                  >
                    {el.title}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

GlassDock.displayName = "GlassDock"
export default GlassDock
