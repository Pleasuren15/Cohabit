import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

export interface DockItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
  href?: string
  className?: string
}

export interface GlassDockProps {
  items: DockItem[]
  className?: string
  dockClassName?: string
  activeTitle?: string
  showLabels?: boolean
}

const GlassDock = React.forwardRef<HTMLDivElement, GlassDockProps>(
  (
    { items, className, dockClassName, activeTitle, showLabels = false },
    ref
  ) => {
    const [hoveredTitle, setHoveredTitle] = React.useState<string | null>(null)

    return (
      <div ref={ref} className={cn("relative", className)}>
        <div
          className={cn(
            "glass-border flex items-end gap-1.5 rounded-2xl border border-white/10 bg-background/80 p-2 shadow-2xl backdrop-blur-xl",
            dockClassName
          )}
        >
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeTitle === item.title
            const isHovered = hoveredTitle === item.title

            return (
              <motion.div
                key={item.title}
                className="relative flex flex-col items-center"
                onHoverStart={() => setHoveredTitle(item.title)}
                onHoverEnd={() => setHoveredTitle(null)}
                whileHover={{ y: -4, scale: 1.12 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
              >
                <AnimatePresence>
                  {isHovered && !showLabels && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, x: "-50%", scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                      exit={{ opacity: 0, y: 6, x: "-50%", scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="pointer-events-none absolute -top-10 left-1/2 z-10 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md ring-1 ring-border"
                    >
                      {item.title}
                    </motion.div>
                  )}
                </AnimatePresence>

                {item.href ? (
                  <a
                    href={item.href}
                    onClick={item.onClick}
                    aria-label={item.title}
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors",
                      isActive && "bg-accent/10 text-accent",
                      isHovered && !isActive && "text-foreground",
                      item.className
                    )}
                  >
                    <Icon className="size-5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    aria-label={item.title}
                    className={cn(
                      "flex size-11 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors",
                      isActive && "bg-accent/10 text-accent",
                      isHovered && !isActive && "text-foreground",
                      item.className
                    )}
                  >
                    <Icon className="size-5" />
                  </button>
                )}

                {showLabels && (
                  <span className="mt-1 text-[10px] font-medium text-muted-foreground">
                    {item.title}
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }
)
GlassDock.displayName = "GlassDock"

export { GlassDock }
export default GlassDock
