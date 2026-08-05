"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Loader2 } from "lucide-react"
import { FaMap } from "react-icons/fa6"
import { cn } from "@/lib/utils"

interface ViewOnMapProps {
  locationName?: string
  address?: string
  mapImageUrl?: string
  className?: string
}

export function ViewOnMap({
  address = "Cape Town City Centre, Cape Town, South Africa",
  mapImageUrl = "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=2000&auto=format&fit=crop",
  className = "",
}: ViewOnMapProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    if (isOpen) setIsMapLoaded(false)
  }

  const springConfig = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  }

  const publicMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`

  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center justify-center">
        <div
          className={cn("relative flex w-full items-center justify-center", className)}
        >
          <AnimatePresence mode="popLayout">
            {!isOpen ? (
              <motion.div
                key="button"
                layoutId="map-container"
                onClick={toggleOpen}
                className="group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border/40 bg-background/60 shadow-sm backdrop-blur-sm transition-colors hover:bg-accent/5"
                style={{ width: "100%", height: 44 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={springConfig}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  layoutId="map-bg"
                  className="absolute inset-0 rounded-full opacity-10 brightness-110 grayscale transition-opacity dark:opacity-5"
                  style={{
                    backgroundImage: `url(${mapImageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <motion.div className="relative z-10 flex items-center justify-center gap-2 px-4">
                  <FaMap className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">
                    View on Map
                  </span>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="map"
                layoutId="map-container"
                className="relative w-full overflow-hidden bg-muted shadow-sm"
                style={{ borderRadius: 16, aspectRatio: "16/9" }}
                transition={springConfig}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="absolute inset-0 h-full w-full"
                >
                  <iframe
                    title="Google Map"
                    width="100%"
                    height="100%"
                    style={{
                      border: 0,
                      filter: "invert(15%) hue-rotate(180deg)",
                    }}
                    src={publicMapUrl}
                    allowFullScreen
                    onLoad={() => setIsMapLoaded(true)}
                    className={`transition-opacity duration-700 ${isMapLoaded ? "opacity-100" : "opacity-0"}`}
                  />
                </motion.div>

                {!isMapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={toggleOpen}
                  className="absolute top-3 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted"
                >
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
