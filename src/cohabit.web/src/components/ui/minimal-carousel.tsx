"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart } from "lucide-react"

/* --- Types --- */
export interface CarouselCard {
  id: string
  title: string
  value: string
  color: string
  imageSrc?: string
}

interface MinimalCarouselProps {
  cards: CarouselCard[]
  onFavoriteToggle?: (card: CarouselCard) => void
}

export const MinimalCarousel: React.FC<MinimalCarouselProps> = ({
  cards,
  onFavoriteToggle,
}) => {
  // Default-select the first card
  const [activeId, setActiveId] = useState<string | null>(
    () => cards[0]?.id ?? null
  )

  // Keep selection valid when cards change (e.g., new favorite added)
  useEffect(() => {
    setActiveId((prev) => {
      if (cards.length === 0) return null
      if (!prev || !cards.some((c) => c.id === prev)) {
        return cards[0].id
      }
      return prev
    })
  }, [cards])

  const activeCard = cards.find((c) => c.id === activeId)
  const secondaryCards = cards.filter((c) => c.id !== activeId)

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setActiveId(null)
  }

  return (
    <div className="flex w-full items-start justify-center bg-transparent">
      <div
        className="flex w-full flex-col items-center px-3 font-sans select-none sm:px-4"
        onClick={handleBackgroundClick}
      >
        <div className="w-full max-w-105">
          <motion.div layout className="flex flex-col gap-3">
            {/* Expanded Card */}
            <AnimatePresence mode="popLayout">
              {activeCard && (
                <motion.div
                  key={activeCard.id}
                  layoutId={activeCard.id}
                  className="relative flex min-h-48 w-full flex-col justify-between overflow-hidden rounded-[28px] p-4 text-white shadow-2xl sm:h-56 sm:rounded-4xl sm:p-5"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                >
                  {/* Background image when available, otherwise gradient */}
                  {activeCard.imageSrc ? (
                    <>
                      <img
                        src={activeCard.imageSrc}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                    </>
                  ) : (
                    <div className={`absolute inset-0 ${activeCard.color}`} />
                  )}

                  {/* Top: view listing button + unfavorite heart */}
                  <div className="relative z-10 flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: navigate to full listing view
                      }}
                      className="rounded-full bg-black/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-black/30"
                    >
                      View listing
                    </button>

                    {onFavoriteToggle && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFavoriteToggle(activeCard)
                        }}
                        className="flex size-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-colors hover:bg-white/20"
                        aria-label="Remove from favorites"
                      >
                        <Heart className="size-4 fill-red-500 text-red-500" />
                      </motion.button>
                    )}
                  </div>

                  {/* Bottom: name + location */}
                  <div className="relative z-10 mt-auto pt-4">
                    <h3 className="truncate text-xl leading-tight font-semibold opacity-90 sm:text-2xl">
                      {activeCard.title}
                    </h3>
                    <p className="truncate text-lg font-semibold tracking-tight opacity-60 sm:text-xl">
                      {activeCard.value}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid Layout */}
            <motion.div
              layout
              className={`grid gap-2 transition-all duration-500 sm:gap-3 ${
                activeId ? "grid-cols-3" : "grid-cols-2"
              }`}
            >
              {(activeId ? secondaryCards : cards).map((card) => (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveId(card.id)
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  className={`relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[22px] p-3 text-white shadow-lg sm:rounded-[28px] sm:p-4 ${activeId ? "h-24 sm:h-28" : "h-28 sm:h-32"}`}
                >
                  {/* Background image for grid cards too */}
                  {card.imageSrc ? (
                    <>
                      <img
                        src={card.imageSrc}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <div className={`absolute inset-0 ${card.color}`} />
                  )}

                  <div className="relative z-10 overflow-hidden">
                    <h4
                      className={`${activeId ? "text-[10px] sm:text-xs" : "text-sm sm:text-base"} truncate leading-tight font-medium opacity-90`}
                    >
                      {card.title}
                    </h4>
                    <p
                      className={`${activeId ? "text-[10px] sm:text-xs" : "text-sm sm:text-base"} truncate font-semibold text-white/60`}
                    >
                      {card.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
