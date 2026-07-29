"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  ArrowLeft,
  MapPin,
  Smartphone,
  Mail,
  BadgeCheck,
  Shield,
  Expand,
  X,
  Phone,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { ViewOnMap } from "./view-on-map"

type VerificationType = "phone" | "email" | "id" | "credit"

interface RelatedListing {
  id: string
  imageSrc: string
  name: string
  location: string
}

interface DetailPageProps {
  id: string
  imageSrc: string
  name: string
  location: string
  mapAddress: string
  bio: string
  photoCount: number
  verified: VerificationType[]
  onBack: () => void
  relatedListings?: RelatedListing[]
  onViewRelated?: (id: string) => void
}

const INTERIOR_PHOTOS = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000&h=700",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1000&h=700",
  "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&q=80&w=1000&h=700",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000&h=700",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000&h=700",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1000&h=700",
]

const VERIFICATION_CONFIG: Record<
  VerificationType,
  { icon: typeof Smartphone; label: string; dotColor: string; description: string }
> = {
  phone: { icon: Smartphone, label: "Phone", dotColor: "bg-blue-500", description: "Phone number verified" },
  email: { icon: Mail, label: "Email", dotColor: "bg-purple-500", description: "Email address verified" },
  id: { icon: BadgeCheck, label: "ID", dotColor: "bg-green-500", description: "Identity verified" },
  credit: { icon: Shield, label: "Credit", dotColor: "bg-amber-500", description: "Credit check completed" },
}

/** Derive a consistent phone number from the profile id. */
function derivePhone(id: string): string {
  const digits = id
    .split("")
    .map((c) => c.charCodeAt(0) % 10)
    .join("")
  return `+27 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
}

/** Derive a consistent email from the profile name. */
function deriveEmail(name: string): string {
  return `${name.toLowerCase().replace(/\s+/g, ".")}@cohabit.co.za`
}

export function DetailPage({
  id,
  imageSrc,
  name,
  location,
  mapAddress,
  bio,
  photoCount,
  verified,
  onBack,
  relatedListings,
  onViewRelated,
}: DetailPageProps) {
  const [fullScreenIndex, setFullScreenIndex] = useState<number | null>(null)

  const galleryPhotos = useMemo(() => {
    const photos = [imageSrc]
    const startIdx =
      id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
      INTERIOR_PHOTOS.length
    for (let i = 1; i < Math.min(photoCount, 6); i++) {
      photos.push(INTERIOR_PHOTOS[(startIdx + i) % INTERIOR_PHOTOS.length])
    }
    return photos
  }, [id, imageSrc, photoCount])

  const goNext = useCallback(() => {
    if (fullScreenIndex === null) return
    setFullScreenIndex((fullScreenIndex + 1) % galleryPhotos.length)
  }, [fullScreenIndex, galleryPhotos.length])

  const goPrev = useCallback(() => {
    if (fullScreenIndex === null) return
    setFullScreenIndex(
      (fullScreenIndex - 1 + galleryPhotos.length) % galleryPhotos.length
    )
  }, [fullScreenIndex, galleryPhotos.length])

  // Keyboard navigation
  useEffect(() => {
    if (fullScreenIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext()
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev()
      else if (e.key === "Escape") setFullScreenIndex(null)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [fullScreenIndex, goNext, goPrev])

  const phoneNumber = useMemo(() => derivePhone(id), [id])
  const emailAddress = useMemo(() => deriveEmail(name), [name])
  const hasPhone = verified.includes("phone")
  const hasEmail = verified.includes("email")

  return (
    <>
      {/* Full-screen image viewer modal — scrollable with prev/next */}
      <AnimatePresence>
        {fullScreenIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
            onClick={() => setFullScreenIndex(null)}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setFullScreenIndex(null)}
              className="absolute top-4 right-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Close full screen"
            >
              <X className="size-6" />
            </button>

            {/* Image counter */}
            <span className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
              {fullScreenIndex + 1} / {galleryPhotos.length}
            </span>

            {/* Previous arrow */}
            {galleryPhotos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                className="absolute left-2 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-4"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}

            {/* Next arrow */}
            {galleryPhotos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                className="absolute right-2 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-4"
                aria-label="Next image"
              >
                <ChevronRight className="size-6" />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={fullScreenIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={galleryPhotos[fullScreenIndex]}
              alt={`Photo ${fullScreenIndex + 1} of ${galleryPhotos.length}`}
              className="max-h-[85vh] max-w-[85vw] cursor-pointer rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => {
                // Click left half → prev, right half → next
                if (galleryPhotos.length <= 1) return
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                if (x < rect.width / 2) goPrev()
                else goNext()
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main detail page */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed inset-0 z-40 overflow-y-auto bg-background"
      >
        <div className="mx-auto min-h-screen max-w-md">
          {/* Hero image — click to zoom */}
          <div className="relative h-64 sm:h-80">
            <img
              src={imageSrc}
              alt={name}
              className="h-full w-full cursor-pointer object-cover"
              onClick={() => setFullScreenIndex(0)}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Back button */}
            <button
              type="button"
              onClick={onBack}
              className="absolute top-4 left-4 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              aria-label="Go back"
            >
              <ArrowLeft className="size-5" />
            </button>

            {/* Full-screen icon on hero image */}
            <button
              type="button"
              onClick={() => setFullScreenIndex(0)}
              className="absolute top-4 right-4 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              aria-label="View full screen"
            >
              <Expand className="size-4" />
            </button>

            {/* Name + location at bottom of hero */}
            <div className="pointer-events-none absolute right-0 bottom-0 left-0 px-5 pb-4">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                {name}
              </h1>
              <p className="flex items-center gap-1 text-sm text-white/80">
                <MapPin className="size-3.5 shrink-0" />
                {location}
              </p>
            </div>
          </div>

          {/* Content sections */}
          <div className="space-y-6 px-5 py-6">
            {/* Verification badges */}
            {verified.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  Verification
                </h2>
                <div className="flex flex-wrap gap-2">
                  {verified.map((v) => {
                    const config = VERIFICATION_CONFIG[v]
                    const Icon = config.icon
                    return (
                      <span
                        key={v}
                        className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        <span
                          className={`size-1.5 rounded-full ${config.dotColor}`}
                        />
                        <Icon className="size-3" />
                        {config.description}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* About / Bio */}
            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                About
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {bio}
              </p>
            </div>

            {/* Listed by — with contact actions */}
            <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Listed by
              </h2>
              <div className="flex items-center gap-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-full">
                  <img
                    src={imageSrc}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {location}
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    {verified.map((v) => {
                      const config = VERIFICATION_CONFIG[v]
                      const Icon = config.icon
                      const colorMap: Record<string, string> = {
                        phone: "bg-blue-100 text-blue-700",
                        email: "bg-purple-100 text-purple-700",
                        id: "bg-green-100 text-green-700",
                        credit: "bg-amber-100 text-amber-700",
                      }
                      return (
                        <span
                          key={v}
                          className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${colorMap[v]}`}
                        >
                          <Icon className="size-2.5" />
                          {config.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Contact actions */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {hasPhone && (
                  <a
                    href={`tel:${phoneNumber.replace(/\s/g, "")}`}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-blue-600"
                  >
                    <Phone className="size-3" />
                    Call
                  </a>
                )}
                {hasEmail && (
                  <a
                    href={`mailto:${emailAddress}`}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-purple-500 px-3 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-purple-600"
                  >
                    <Mail className="size-3" />
                    Email
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    // TODO: open messaging thread
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-[10px] font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <MessageSquare className="size-3" />
                  Message
                </button>
              </div>
            </div>

            {/* Photo gallery — each image clickable to zoom */}
            {galleryPhotos.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  Photos ({photoCount})
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {galleryPhotos.map((photo, i) => (
                    <div
                      key={i}
                      className="group relative overflow-hidden rounded-xl"
                    >
                      <img
                        src={photo}
                        alt={`${name} photo ${i + 1}`}
                        className="h-32 w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105 sm:h-40"
                        onClick={() => setFullScreenIndex(i)}
                      />
                      <button
                        type="button"
                        onClick={() => setFullScreenIndex(i)}
                        className="absolute top-2 right-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white/80 opacity-0 backdrop-blur-sm transition-all hover:opacity-100 group-hover:opacity-100"
                        aria-label="View full screen"
                      >
                        <Expand className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location / map */}
            {mapAddress && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  Location
                </h2>
                <ViewOnMap address={mapAddress} />
              </div>
            )}

            {/* More related listings */}
            {relatedListings && relatedListings.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  More listings
                </h2>
                <div className="flex flex-col gap-2">
                  {relatedListings.slice(0, 4).map((related) => (
                    <button
                      key={related.id}
                      type="button"
                      onClick={() => onViewRelated?.(related.id)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-background p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="size-14 shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={related.imageSrc}
                          alt={related.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {related.name}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate">{related.location}</span>
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
                {relatedListings.length > 4 && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    +{relatedListings.length - 4} more listings
                  </p>
                )}
              </div>
            )}

            {/* Bottom spacing */}
            <div className="h-8" />
          </div>
        </div>
      </motion.div>
    </>
  )
}
