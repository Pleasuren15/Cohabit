"use client"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"
import React, { useCallback, useEffect, useRef, useState } from "react"

interface ImagesSliderProps {
  images: string[]
  children?: React.ReactNode
  overlay?: boolean
  overlayClassName?: string
  className?: string
  autoplay?: boolean
  direction?: "up" | "down"
  /** Called with the slide index when the current image is clicked */
  onImageClick?: (index: number) => void
  /** Positioning classes for the dot indicators */
  indicatorClassName?: string
}

/**
 * Aceternity UI "Images Slider" — full-bleed fading/rotating image slider
 * with keyboard navigation and optional autoplay.
 * Adapted for Cohabit: optional children, hover-gated keyboard nav,
 * dot indicators, click handling, token-friendly overlay.
 */
export function ImagesSlider({
  images,
  children,
  overlay = true,
  overlayClassName,
  className,
  autoplay = true,
  direction = "up",
  onImageClick,
  indicatorClassName,
}: ImagesSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<string[]>([])
  const [isHovered, setIsHovered] = useState(false)
  const imagesKeyRef = useRef("")

  const handleNext = useCallback(() => {
    if (images.length === 0) return
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 === images.length ? 0 : prevIndex + 1,
    )
  }, [images.length])

  const handlePrevious = useCallback(() => {
    if (images.length === 0) return
    setCurrentIndex((prevIndex) =>
      prevIndex - 1 < 0 ? images.length - 1 : prevIndex - 1,
    )
  }, [images.length])

  useEffect(() => {
    // Skip redundant reloads when the parent re-renders with an equal array
    const key = images.join("|")
    if (key === imagesKeyRef.current || images.length === 0) return
    imagesKeyRef.current = key

    const loadPromises = images.map((image) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image()
        img.src = image
        img.onload = () => resolve(image)
        img.onerror = reject
      })
    })

    Promise.all(loadPromises)
      .then(setLoadedImages)
      .catch((error) => console.error("Failed to load images", error))
  }, [images])

  useEffect(() => {
    if (!isHovered && !autoplay) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNext()
      } else if (event.key === "ArrowLeft") {
        handlePrevious()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    let interval: number | undefined
    if (autoplay) {
      interval = window.setInterval(handleNext, 5000)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (interval !== undefined) window.clearInterval(interval)
    }
  }, [autoplay, isHovered, handleNext, handlePrevious])

  const slideVariants = {
    initial: {
      scale: 0,
      opacity: 0,
      rotateX: 45,
    },
    visible: {
      scale: 1,
      rotateX: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.645, 0.045, 0.355, 1.0] as const,
      },
    },
    upExit: {
      opacity: 1,
      y: "-150%",
      transition: {
        duration: 1,
      },
    },
    downExit: {
      opacity: 1,
      y: "150%",
      transition: {
        duration: 1,
      },
    },
  }

  const areImagesLoaded = loadedImages.length > 0

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        onImageClick && "cursor-pointer",
        className,
      )}
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {areImagesLoaded && children}
      {areImagesLoaded && overlay && (
        <div
          className={cn("absolute inset-0 z-40 bg-black/60", overlayClassName)}
        />
      )}

      {areImagesLoaded && (
        <>
          <AnimatePresence>
            <motion.img
              key={currentIndex}
              src={loadedImages[currentIndex]}
              alt={`Photo ${currentIndex + 1} of ${loadedImages.length}`}
              initial="initial"
              animate="visible"
              exit={direction === "up" ? "upExit" : "downExit"}
              variants={slideVariants}
              onClick={() => onImageClick?.(currentIndex)}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </AnimatePresence>

          {/* Dot indicators */}
          {loadedImages.length > 1 && (
            <div
              className={cn(
                "pointer-events-auto absolute bottom-3 left-1/2 z-40 flex -translate-x-1/2 gap-1.5",
                indicatorClassName,
              )}
            >
              {loadedImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to photo ${index + 1}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentIndex(index)
                  }}
                  className={cn(
                    "size-1.5 rounded-full transition-all",
                    index === currentIndex
                      ? "w-4 bg-white"
                      : "bg-white/50 hover:bg-white/80",
                  )}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
