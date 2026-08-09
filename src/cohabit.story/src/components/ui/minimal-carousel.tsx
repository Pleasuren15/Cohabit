import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart } from "lucide-react"

/* --- Types --- */
export interface CarouselBadge {
  label: string
  tone: "new" | "updated" | "off"
}

export interface CarouselCard {
  id: string
  title: string
  value: string
  color: string
  imageSrc?: string
  badge?: CarouselBadge
}

const BADGE_TONES: Record<CarouselBadge["tone"], string> = {
  new: "bg-emerald-500",
  updated: "bg-amber-500",
  off: "bg-zinc-500",
}

interface MinimalCarouselProps {
  cards: CarouselCard[]
  onFavoriteToggle?: (card: CarouselCard) => void
  onViewListing?: (card: CarouselCard) => void
}

export function MinimalCarousel({
  cards,
  onFavoriteToggle,
  onViewListing,
}: MinimalCarouselProps) {
  const [activeId, setActiveId] = useState<string | null>(
    () => cards[0]?.id ?? null
  )

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
            <AnimatePresence mode="popLayout">
              {activeCard && (
                <motion.div
                  key={activeCard.id}
                  layoutId={activeCard.id}
                  className="relative flex min-h-48 w-full flex-col justify-between overflow-hidden rounded-[28px] p-4 text-white shadow-2xl sm:h-56 sm:rounded-4xl sm:p-5"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                >
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

                  <div className="relative z-10 flex items-start justify-between gap-2">
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

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewListing?.(activeCard)
                      }}
                      className="rounded-full bg-black/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-black/30"
                    >
                      View listing
                    </button>
                  </div>

                  <div className="relative z-10 mt-auto pt-4">
                    {activeCard.badge && (
                      <span
                        className={`mb-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase ${BADGE_TONES[activeCard.badge.tone]}`}
                      >
                        {activeCard.badge.label}
                      </span>
                    )}
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

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewListing?.(card)
                    }}
                    className="absolute top-2 right-2 z-10 cursor-pointer rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-black/50"
                  >
                    View
                  </button>

                  {card.badge && (
                    <span
                      className={`absolute top-2 left-2 z-10 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white uppercase ${BADGE_TONES[card.badge.tone]}`}
                    >
                      {card.badge.label}
                    </span>
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
