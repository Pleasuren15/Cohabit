"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
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
  Heart,
  Check,
  Share2,
  BedDouble,
  Bath,
  Calendar,
  Wallet,
  Zap,
  ShieldCheck,
  Send,
  Flag,
} from "lucide-react"
import { AMENITIES } from "@/lib/amenities"
import { ViewOnMap } from "./view-on-map"
import { NativeSelect } from "@/components/base-ui/native-select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  REPORT_REASONS,
  type ReportReason,
} from "@/services/reports-service"

type VerificationType = "phone" | "email" | "id" | "credit"

/** Structured fields collected when a viewer requests a viewing. */
export interface ViewingRequest {
  moveInDate: string
  occupants: number
  message: string
}

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
  price: number
  deposit: number
  beds: number
  baths: number
  availableFrom: string
  responseTime: string
  rules: string[]
  amenities?: string[]
  isFavorited?: boolean
  onToggleFavorite?: (id: string) => void
  onRequestView?: (id: string, details: ViewingRequest) => void
  onReport?: (id: string, details: { reason: ReportReason; details?: string }) => void
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
  { icon: typeof Smartphone; label: string }
> = {
  phone: { icon: Smartphone, label: "Phone" },
  email: { icon: Mail, label: "Email" },
  id: { icon: BadgeCheck, label: "ID" },
  credit: { icon: Shield, label: "Credit" },
}

const VERIFICATION_COLORS: Record<VerificationType, string> = {
  phone: "bg-blue-100 text-blue-700",
  email: "bg-purple-100 text-purple-700",
  id: "bg-green-100 text-green-700",
  credit: "bg-amber-100 text-amber-700",
}

const formatPrice = (value: number) => `R ${value.toLocaleString("en-ZA")}`

/** ISO date `YYYY-MM-DD` two weeks from today — the inquiry form's default. */
function defaultMoveInDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
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
  price,
  deposit,
  beds,
  baths,
  availableFrom,
  responseTime,
  rules,
  amenities,
  isFavorited = false,
  onToggleFavorite,
  onRequestView,
  onReport,
  onBack,
  relatedListings,
  onViewRelated,
}: DetailPageProps) {
  const [fullScreenIndex, setFullScreenIndex] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [inquiryMoveInDate, setInquiryMoveInDate] = useState(() => defaultMoveInDate())
  const [inquiryOccupants, setInquiryOccupants] = useState("1")
  const [inquiryMessage, setInquiryMessage] = useState("")
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState<ReportReason | null>(null)
  const [reportDetails, setReportDetails] = useState("")
  const [amenitiesScroll, setAmenitiesScroll] = useState({
    canLeft: false,
    canRight: false,
  })
  const amenitiesRef = useRef<HTMLDivElement>(null)
  const copiedTimer = useRef<number | null>(null)

  // Clear any pending "copied" timer on unmount.
  useEffect(() => {
    return () => {
      if (copiedTimer.current !== null) {
        window.clearTimeout(copiedTimer.current)
      }
    }
  }, [])

  const updateAmenitiesScroll = useCallback(() => {
    const el = amenitiesRef.current
    if (!el) return
    setAmenitiesScroll({
      canLeft: el.scrollLeft > 4,
      canRight: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    })
  }, [])

  useEffect(() => {
    updateAmenitiesScroll()
    const el = amenitiesRef.current
    if (!el) return
    el.addEventListener("scroll", updateAmenitiesScroll, { passive: true })
    window.addEventListener("resize", updateAmenitiesScroll)
    return () => {
      el.removeEventListener("scroll", updateAmenitiesScroll)
      window.removeEventListener("resize", updateAmenitiesScroll)
    }
  }, [updateAmenitiesScroll])

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

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/profile/${name
      .toLowerCase()
      .replace(/\s+/g, "-")}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${name} — ${location}`,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        if (copiedTimer.current !== null) {
          window.clearTimeout(copiedTimer.current)
        }
        copiedTimer.current = window.setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      /* share dismissed */
    }
  }, [name, location])

  return (
    <>
      {/* Full-screen image viewer modal — scrollable with prev/next */}
      <AnimatePresence>
        {fullScreenIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
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

            {/* Top-right actions: favourite + share + full-screen */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleFavorite?.(id)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                aria-label={
                  isFavorited ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart
                  className={`size-4 ${
                    isFavorited ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                aria-label="Share listing"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Share2 className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setFullScreenIndex(0)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                aria-label="View full screen"
              >
                <Expand className="size-4" />
              </button>
            </div>

            {/* Price badge */}
            <span className="absolute bottom-16 left-5 z-10 rounded-lg bg-accent px-2.5 py-1 text-sm font-bold text-white shadow-lg">
              {formatPrice(price)}
              <span className="text-[10px] font-medium text-white/80">
                {" "}
                /month
              </span>
            </span>

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
            {/* Key facts bar */}
            <div className="grid grid-cols-4 divide-x divide-border/40 overflow-hidden rounded-2xl border border-border/40 bg-background shadow-sm">
              <Fact
                icon={BedDouble}
                label="Bedrooms"
                value={`${beds}`}
              />
              <Fact
                icon={Bath}
                label="Bathrooms"
                value={`${baths}`}
              />
              <Fact
                icon={Calendar}
                label="Available"
                value={availableFrom}
              />
              <Fact
                icon={Wallet}
                label="Deposit"
                value={formatPrice(deposit)}
              />
            </div>

            {/* Amenities — single-line scrollable row */}
            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Amenities
              </h2>
              <div className="relative">
                {amenitiesScroll.canLeft && (
                  <button
                    type="button"
                    onClick={() =>
                      amenitiesRef.current?.scrollBy({ left: -120, behavior: "smooth" })
                    }
                    className="absolute top-1/2 -left-1.5 z-10 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition-colors hover:text-foreground"
                    aria-label="Scroll amenities left"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                )}
                <div
                  ref={amenitiesRef}
                  className="flex gap-2 overflow-x-auto scroll-smooth py-1 pr-1 [&::-webkit-scrollbar]:hidden"
                  style={{ scrollbarWidth: "none" }}
                >
                  {AMENITIES.filter(
                    (amenity) =>
                      !amenities || amenities.length === 0 || amenities.includes(amenity.name)
                  ).map((amenity) => (
                    <Tooltip key={amenity.name}>
                      <TooltipTrigger asChild>
                        <span className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/50 bg-muted/30 text-muted-foreground">
                          <amenity.icon className="size-5" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-neutral-200 text-neutral-950 dark:bg-neutral-50 [&_svg]:bg-neutral-200 [&_svg]:fill-neutral-200 dark:[&_svg]:bg-neutral-50 dark:[&_svg]:fill-neutral-50">
                        <p>{amenity.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                {amenitiesScroll.canRight && (
                  <button
                    type="button"
                    onClick={() =>
                      amenitiesRef.current?.scrollBy({ left: 120, behavior: "smooth" })
                    }
                    className="absolute top-1/2 -right-1.5 z-10 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition-colors hover:text-foreground"
                    aria-label="Scroll amenities right"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Listed by — owner details card */}
            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Listed by
              </h2>
              <div className="overflow-hidden rounded-2xl border border-border/40 bg-background shadow-sm">
                <div className="flex items-center gap-4 bg-gradient-to-r from-accent/5 to-transparent p-5">
                  <div className="size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-accent/20">
                    <img
                      src={imageSrc}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{bio}</p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 px-5 pb-1">
                  <DetailRow icon={MapPin} label="Location" value={location} />
                  <DetailRow
                    icon={Phone}
                    label="Cellphone"
                    value={hasPhone ? phoneNumber : "Not shared"}
                  />
                  <DetailRow icon={Mail} label="Email" value={hasEmail ? emailAddress : "Not shared"} />
                </div>

                {/* Verification badges */}
                {verified.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 border-t border-border/40 px-5 py-3">
                    {verified.map((v) => {
                      const config = VERIFICATION_CONFIG[v]
                      const Icon = config.icon
                      return (
                        <span
                          key={v}
                          className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${VERIFICATION_COLORS[v]}`}
                        >
                          <Icon className="size-2.5" />
                          {config.label}
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Contact actions */}
                <div className="flex flex-wrap gap-1.5 border-t border-border/40 px-5 py-3">
                  <span className="mr-1 inline-flex w-full items-center gap-1.5 text-xs text-muted-foreground">
                    <Zap className="size-3.5 text-accent" />
                    Responds {responseTime.toLowerCase()}
                  </span>
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
                      setInquiryMessage("")
                      setShowInquiryForm(true)
                    }}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-accent/90"
                  >
                    <MessageSquare className="size-3" />
                    Is this still available?
                  </button>
                </div>
              </div>
            </div>

            {/* Home rules */}
            {rules.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-foreground">
                  Home rules
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {rules.map((rule) => (
                    <span
                      key={rule}
                      className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      <ShieldCheck className="size-3.5 text-accent" />
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photo gallery — each image clickable to zoom */}
            {galleryPhotos.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  Photos ({photoCount})
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {galleryPhotos.map((photo, i) => (
                    <div
                      key={`${photo}-${i}`}
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
                      {i === galleryPhotos.length - 1 && (
                        <button
                          type="button"
                          onClick={() => setFullScreenIndex(0)}
                          className="absolute inset-x-0 bottom-0 flex cursor-pointer items-center justify-center gap-1 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 text-[10px] font-semibold text-white"
                        >
                          <Expand className="size-3" />
                          View all photos
                        </button>
                      )}
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

            {/* Report listing */}
            <div className="rounded-2xl border border-dashed border-border/60 p-4 text-center">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Something wrong with this listing? Our safety team reviews
                every report within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setReportReason(null)
                  setReportDetails("")
                  setShowReportForm(true)
                }}
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-800 dark:hover:bg-red-950/30"
              >
                <Flag className="size-3.5" />
                Report this listing
              </button>
            </div>

            {/* Bottom spacing */}
            <div className="h-8" />
          </div>
        </div>

        {/* Sticky bottom action bar */}
        <div className="sticky bottom-0 z-30 border-t border-border bg-background/95 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-foreground">
                {formatPrice(price)}
                <span className="text-xs font-medium text-muted-foreground">
                  {" "}
                  /month
                </span>
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{location}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setInquiryMessage("")
                setShowInquiryForm(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-accent/90"
            >
              <MessageSquare className="size-3.5" />
              Request to view
            </button>
          </div>
        </div>
      </motion.div>

      {/* Structured inquiry form — the core marketplace mechanic */}
      <AnimatePresence>
        {showInquiryForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Request to view"
            className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center"
            onClick={() => setShowInquiryForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-t-3xl border border-border bg-background p-5 shadow-xl sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="size-12 shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={imageSrc}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">
                      Request to view
                    </h2>
                    <p className="truncate text-xs text-muted-foreground">
                      {name} · {location}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInquiryForm(false)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!inquiryMoveInDate.trim()) return
                  onRequestView?.(id, {
                    moveInDate: inquiryMoveInDate.trim(),
                    occupants: Math.max(1, parseInt(inquiryOccupants, 10) || 1),
                    message: inquiryMessage.trim(),
                  })
                  setShowInquiryForm(false)
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="inquiry-move-in"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Move-in date
                    </label>
                    <input
                      id="inquiry-move-in"
                      type="date"
                      value={inquiryMoveInDate}
                      onChange={(e) => setInquiryMoveInDate(e.target.value)}
                      required
                      aria-label="Move-in date"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 dark:[color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="inquiry-occupants"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Occupants
                    </label>
                    <NativeSelect
                      id="inquiry-occupants"
                      value={inquiryOccupants}
                      onChange={(e) => setInquiryOccupants(e.target.value)}
                      aria-label="Number of occupants"
                      className="w-full rounded-xl border border-border bg-background focus:ring-1 focus:ring-accent/30 dark:bg-zinc-950 dark:[&_select]:bg-zinc-950 dark:[&_select]:[color-scheme:dark]"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "person" : "people"}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="inquiry-message"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Message to {name.split(" ")[0]}
                  </label>
                  <textarea
                    id="inquiry-message"
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Tell the host a little about yourself and when you'd like to visit."
                    rows={4}
                    aria-label="Message to host"
                    className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent/90"
                >
                  <Send className="size-4" />
                  Send request
                </button>
                <p className="text-center text-[11px] text-muted-foreground">
                  The host is notified immediately and can accept or decline
                  from their dashboard.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report listing form */}
      <AnimatePresence>
        {showReportForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Report this listing"
            className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center"
            onClick={() => setShowReportForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-t-3xl border border-border bg-background p-5 shadow-xl sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30">
                    <Flag className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">
                      Report this listing
                    </h2>
                    <p className="truncate text-xs text-muted-foreground">
                      {name} · {location}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!reportReason) return
                  onReport?.(id, {
                    reason: reportReason,
                    details: reportDetails.trim() || undefined,
                  })
                  setShowReportForm(false)
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    What's the issue?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {REPORT_REASONS.map(({ id: reasonId, label }) => (
                      <button
                        key={reasonId}
                        type="button"
                        onClick={() => setReportReason(reasonId)}
                        aria-pressed={reportReason === reasonId}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          reportReason === reasonId
                            ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/30"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="report-details"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Details (optional)
                  </label>
                  <textarea
                    id="report-details"
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Tell our safety team what happened."
                    rows={4}
                    aria-label="Report details"
                    className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!reportReason}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Flag className="size-4" />
                  Submit report
                </button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Reports are confidential and reviewed by our safety team.
                  You'll never be matched with this listing again.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-1 py-3 text-center">
      <Icon className="size-4 shrink-0 text-accent" />
      <span className="w-full truncate px-1 text-xs font-semibold text-foreground">
        {value}
      </span>
      <span className="text-[9px] leading-none text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="w-24 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <span className="truncate text-sm font-medium">{value}</span>
    </div>
  )
}
