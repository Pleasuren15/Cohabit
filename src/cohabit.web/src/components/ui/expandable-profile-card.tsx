"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  MapPin,
  ChevronDown,
  Camera,
  Smartphone,
  Mail,
  BadgeCheck,
  Shield,
  Share2,
  Check,
} from "lucide-react"
import { ViewOnMap } from "./view-on-map"

type VerificationType = "phone" | "email" | "id" | "credit"

interface ExpandableProfileCardProps {
  imageSrc?: string
  name: string
  location: string
  bio?: string
  mapAddress?: string
  photoCount?: number
  verified?: VerificationType[]
}

const VERIFICATION_CONFIG: Record<
  VerificationType,
  { icon: typeof Smartphone; label: string; dotColor: string }
> = {
  phone: { icon: Smartphone, label: "Phone", dotColor: "bg-blue-500" },
  email: { icon: Mail, label: "Email", dotColor: "bg-purple-500" },
  id: { icon: BadgeCheck, label: "ID", dotColor: "bg-green-500" },
  credit: { icon: Shield, label: "Credit", dotColor: "bg-amber-500" },
}

export function ExpandableProfileCard({
  imageSrc = "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1000",
  name,
  location,
  bio,
  mapAddress,
  photoCount,
  verified = [],
}: ExpandableProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/profile/${name.toLowerCase().replace(/\s+/g, "-")}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/40 bg-background shadow-sm transition-colors">
      {/* --- Image background + header overlay (always visible) --- */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="relative block w-full cursor-pointer text-left"
      >
        {/* Full-width background image */}
        <div className="relative h-48 overflow-hidden sm:h-56">
          <img
            src={imageSrc}
            alt={name}
            className="h-full w-full object-cover"
          />

          {/* Photo count badge — top-right */}
          {photoCount !== undefined && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              <Camera className="size-3" />
              {photoCount}
            </span>
          )}

          {/* Share button — bottom-right */}
          <button
            type="button"
            onClick={handleShare}
            className="absolute bottom-2 right-2 z-10 flex size-7 items-center justify-center text-white/70 transition-colors hover:text-white"
            aria-label="Share profile"
          >
            <Share2 className="size-3.5" />
          </button>
        </div>

        {/* Dark gradient bed + overlaid content at the bottom of the image */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent pt-8">
          <div className="space-y-1.5 px-4 pb-3">
          {/* Name + chevron */}
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-white drop-shadow-sm">
                {name}
              </h3>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="shrink-0"
            >
              <ChevronDown className="size-5 text-white/70" />
            </motion.div>
          </div>

          {/* Location */}
          <p className="flex items-center gap-1 text-xs text-white/80">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{location}</span>
          </p>

          {/* Verification badges */}
          {verified.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {verified.map((v) => {
                const config = VERIFICATION_CONFIG[v]
                const Icon = config.icon
                return (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
                  >
                    <span
                      className={`size-1.5 rounded-full ${config.dotColor}`}
                    />
                    <Icon className="size-2.5" />
                    {config.label}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        </div>
      </button>

      {/* --- Expanded content (animated vertical reveal) --- */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/30 px-4 pb-4 pt-3">
              {/* Bio */}
              {bio && (
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                  {bio}
                </p>
              )}

              {/* View on Map */}
              {mapAddress && (
                <ViewOnMap address={mapAddress} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copied toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
          >
            <Check className="mr-1.5 inline size-4" />
            Link copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
