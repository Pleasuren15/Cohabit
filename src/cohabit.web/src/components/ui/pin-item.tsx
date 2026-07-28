import React, { useState } from "react"
import {
  motion,
  AnimatePresence,
  MotionConfig,
  type Transition,
} from "motion/react"
import {
  Pin,
  MessageCircle,
  Building,
  Coffee,
  UtensilsCrossed,
  Fuel,
  Pill,
} from "lucide-react"
import { MessagePopover } from "@/components/ui/popover-12"

export type PlaceItem = {
  id: number
  name: string
  type: string
  status: string
  icon?: React.ComponentType<{ size?: number }>
  avatarUrl?: string
  pinned?: boolean
}

const INITIAL_PLACES: PlaceItem[] = [
  {
    id: 1,
    name: "Harbor Bay Marina",
    type: "Marina",
    status: "Closes 7:00 PM",
    icon: Building,
    pinned: false,
  },
  {
    id: 2,
    name: "Mocha Brew",
    type: "Cafe",
    status: "Closes 9:00 PM",
    icon: Coffee,
    pinned: false,
  },
  {
    id: 3,
    name: "Olive Bistro",
    type: "Restaurant",
    status: "Closes 11:00 PM",
    icon: UtensilsCrossed,
    pinned: false,
  },
  {
    id: 4,
    name: "GreenVolt Hub",
    type: "EV Charger",
    status: "Open 24 hours",
    icon: Fuel,
    pinned: false,
  },
  {
    id: 5,
    name: "CarePlus Pharmacy",
    type: "Pharmacy",
    status: "Open 24 hours",
    icon: Pill,
    pinned: false,
  },
]

const springConfig: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 40,
}

type PinItemComponentProps = {
  items?: PlaceItem[]
  pinnedLabel?: string
  allLabel?: string
}

export const PinItemComponent = ({
  items = INITIAL_PLACES,
  pinnedLabel = "Pinned",
  allLabel = "All",
}: PinItemComponentProps) => {
  const [places, setPlaces] = useState<PlaceItem[]>(
    items.map((p) => ({ ...p, pinned: p.pinned ?? false }))
  )

  const togglePin = (id: number) => {
    setPlaces((prev) =>
      prev.map((place) =>
        place.id === id ? { ...place, pinned: !place.pinned } : place
      )
    )
  }

  const pinnedPlaces = places.filter((p) => p.pinned)
  const unpinnedPlaces = places.filter((p) => !p.pinned)

  return (
    <div className="w-full space-y-6">
      <MotionConfig transition={springConfig}>
        <AnimatePresence mode="popLayout" initial={false}>
          {pinnedPlaces.length > 0 && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <motion.div layout className="flex items-center gap-2">
                <Pin className="size-3.5 text-accent" />
                <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  {pinnedLabel}
                </span>
                <div className="h-px flex-1 bg-border" />
              </motion.div>
              <div className="space-y-2">
                {pinnedPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onToggle={togglePin}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout className="space-y-3">
          <motion.div layout className="flex items-center gap-2">
            <MessageCircle className="size-3.5 text-accent" />
            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {allLabel}
            </span>
            <div className="h-px flex-1 bg-border" />
          </motion.div>
          <div className="space-y-3">
            {unpinnedPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} onToggle={togglePin} />
            ))}
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  )
}

const PlaceCard = ({
  place,
  onToggle,
}: {
  place: PlaceItem
  onToggle: (id: number) => void
}) => {
  return (
    <motion.div
      layoutId={`card-${place.id}`}
      transition={springConfig}
      className="relative flex items-center justify-between gap-2.5 rounded-xl border border-border/60 bg-muted/50 p-2.5 shadow-xs transition-shadow hover:shadow-sm sm:p-3"
    >
      <MessagePopover
        name={place.name}
        type={place.type}
        status={place.status}
        pinned={place.pinned}
      >
        <div className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
          <motion.div layout className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate text-base font-semibold text-foreground">
                {place.name}
              </h4>
              <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">
                {place.type}
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {place.status}
            </p>
          </motion.div>
        </div>
      </MessagePopover>

      <motion.button
        layout
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          onToggle(place.id)
        }}
        className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
          place.pinned
            ? "bg-yellow-400 text-white opacity-100"
            : "bg-muted-foreground/20 text-muted-foreground/60 opacity-100 hover:bg-muted-foreground/30"
        }`}
      >
        <Pin size={16} className="fill-white" />
      </motion.button>
    </motion.div>
  )
}
