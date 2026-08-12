import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  Wifi,
  ParkingSquare,
  Dumbbell,
  Flame,
  Tv,
  Droplets,
  Snowflake,
  ShowerHead,
  Utensils,
  Home,
} from "lucide-react"

import { ViewOnMap } from "./view-on-map"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"

type VerificationType = "phone" | "email" | "id" | "credit"

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

export interface DetailListing {
  id: string
  title: string
  location: string
  address?: string
  price: number
  priceUnit?: string
  imageSrc?: string
  rating?: number
  reviews?: number
  type?: string
  amenities?: string[]
  description?: string
  host?: DetailListingHost
  availableFrom?: string
  deposit?: number
  beds?: number
  baths?: number
  responseTime?: string
  rules?: string[]
  verified?: VerificationType[]
  relatedListings?: RelatedListing[]
}

export interface DetailListingHost {
  name: string
  avatarUrl?: string
}

export interface DetailPageProps {
  listing?: DetailListing | null
  loading?: boolean
  isFavorited?: boolean
  onToggleFavorite?: (id: string) => void
  onRequestView?: (id: string, details: ViewingRequest) => void
  onReport?: (id: string, details: { reason: string; details?: string }) => void
  onBack?: () => void
  onViewRelated?: (id: string) => void
}

const INTERIOR_PHOTOS = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000&h=700",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1000&h=700",
  "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&q=80&w=1000&h=700",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000&h=700",
]

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  "Wi-Fi": Wifi,
  Parking: ParkingSquare,
  Gym: Dumbbell,
  Heating: Flame,
  "Smart TV": Tv,
  "Water backup": Droplets,
  "Air conditioning": Snowflake,
  "En-suite bathroom": ShowerHead,
  Kitchen: Utensils,
}

const REPORT_REASONS: { id: string; label: string }[] = [
  { id: "scam", label: "It's a scam" },
  { id: "misleading", label: "Misleading information" },
  { id: "inappropriate", label: "Inappropriate content" },
  { id: "fraud", label: "Deposit or payment fraud" },
  { id: "unsafe", label: "Unsafe or suspicious listing" },
  { id: "other", label: "Something else" },
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
  phone: "bg-blue-500/20 text-blue-100",
  email: "bg-purple-500/20 text-purple-100",
  id: "bg-green-500/20 text-green-100",
  credit: "bg-amber-500/20 text-amber-100",
}

const formatPrice = (value: number) => `R ${value.toLocaleString("en-ZA")}`

function defaultMoveInDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
}

function derivePhone(id: string): string {
  const digits = id
    .split("")
    .map((c) => c.charCodeAt(0) % 10)
    .join("")
  return `+27 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
}

function deriveEmail(name: string): string {
  return `${name.toLowerCase().replace(/\s+/g, ".")}@cohabit.co.za`
}

export function DetailPage({
  listing,
  loading = false,
  isFavorited = false,
  onToggleFavorite,
  onRequestView,
  onReport,
  onBack,
  onViewRelated,
}: DetailPageProps) {
  const [fullScreenIndex, setFullScreenIndex] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [inquiryMoveInDate, setInquiryMoveInDate] = useState(() => defaultMoveInDate())
  const [inquiryOccupants, setInquiryOccupants] = useState("1")
  const [inquiryMessage, setInquiryMessage] = useState("")
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState<string | null>(null)
  const [reportDetails, setReportDetails] = useState("")
  const [amenitiesScroll, setAmenitiesScroll] = useState({
    canLeft: false,
    canRight: false,
  })
  const amenitiesRef = useRef<HTMLDivElement>(null)
  const copiedTimer = useRef<number | null>(null)

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
    const photos = [listing?.imageSrc ?? ""]
    const startIdx =
      listing?.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) ?? 0
    for (let i = 1; i < Math.min(photos.length, 6); i++) {
      photos.push(INTERIOR_PHOTOS[(startIdx + i) % INTERIOR_PHOTOS.length])
    }
    return photos
  }, [listing])

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

  const handleShare = useCallback(async () => {
    if (!listing) return
    const shareUrl = `${window.location.origin}/profile/${listing.title
      .toLowerCase()
      .replace(/\s+/g, "-")}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${listing.title} — ${listing.location}`,
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
  }, [listing])

  if (loading) {
    return (
      <div className="flex h-72 w-full max-w-md items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="size-8 rounded-full border-2 border-accent border-t-transparent"
        />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex h-72 w-full max-w-md flex-col items-center justify-center gap-2 overflow-hidden rounded-xl bg-card p-6 text-center text-sm text-card-foreground ring-1 ring-foreground/10">
        <MapPin className="size-8 text-muted-foreground" />
        <p className="font-medium">No listing found</p>
        <p className="max-w-56 text-muted-foreground">
          We couldn't find a listing matching your request.
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Go back
          </button>
        )}
      </div>
    )
  }

  const verified = listing.verified ?? []
  const beds = listing.beds ?? 1
  const baths = listing.baths ?? 1
  const availableFrom = listing.availableFrom ?? "Flexible"
  const deposit = listing.deposit ?? listing.price
  const responseTime = listing.responseTime ?? "within a day"
  const rules = listing.rules ?? []
  const amenities = listing.amenities ?? []
  const hasPhone = verified.includes("phone")
  const hasEmail = verified.includes("email")
  const phoneNumber = derivePhone(listing.id)
  const emailAddress = deriveEmail(listing.title)
  const listingAmenityIcons: { name: string; icon: typeof Wifi }[] = amenities
    .map((name) => (AMENITY_ICONS[name] ? { name, icon: AMENITY_ICONS[name] } : null))
    .filter((x): x is { name: string; icon: typeof Wifi } => x !== null)

  return (
    <>
      {/* Full-screen image viewer modal */}
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
            <button
              type="button"
              onClick={() => setFullScreenIndex(null)}
              className="absolute top-4 right-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Close full screen"
            >
              <X className="size-6" />
            </button>
            <span className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
              {fullScreenIndex + 1} / {galleryPhotos.length}
            </span>
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
          {/* Hero image */}
          <div className="relative h-64 sm:h-80">
            {listing.imageSrc ? (
              <img
                src={listing.imageSrc}
                alt={listing.title}
                className="h-full w-full cursor-pointer object-cover"
                onClick={() => setFullScreenIndex(0)}
              />
            ) : (
              <div className="flex h-full w-full items-end bg-gradient-to-br from-accent to-orange-500 pb-28" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="absolute top-4 left-4 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                aria-label="Go back"
              >
                <ArrowLeft className="size-5" />
              </button>
            )}

            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleFavorite?.(listing.id)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  className={`size-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
                />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                aria-label="Share listing"
              >
                {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
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

            <span className="absolute bottom-16 left-5 z-10 rounded-lg bg-accent px-2.5 py-1 text-sm font-bold text-white shadow-lg">
              {formatPrice(listing.price)}
              <span className="text-[10px] font-medium text-white/80">
                {" "}
                {listing.priceUnit ?? "/month"}
              </span>
            </span>

            <div className="pointer-events-none absolute right-0 bottom-0 left-0 px-5 pb-4">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                {listing.title}
              </h1>
              <p className="flex items-center gap-1 text-sm text-white/80">
                <MapPin className="size-3.5 shrink-0" />
                {listing.location}
              </p>
            </div>
          </div>

          {/* Content sections */}
          <div className="space-y-6 px-5 py-6">
            {/* Key facts bar — scoreboard tiles */}
            <div className="grid grid-cols-4 gap-1.5 overflow-hidden rounded-2xl bg-gradient-to-b from-accent/5 to-background p-2 shadow-sm">
              <Fact icon={BedDouble} label="Bedrooms" value={`${beds}`} />
              <Fact icon={Bath} label="Bathrooms" value={`${baths}`} />
              <Fact icon={Calendar} label="Available" value={availableFrom} />
              <Fact icon={Wallet} label="Deposit" value={formatPrice(deposit)} />
            </div>

            {/* Amenities — single-line scrollable row */}
            <div>
              <SectionHeading eyebrow="The space">Amenities</SectionHeading>
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
                <TooltipProvider delayDuration={200}>
                  <div
                    ref={amenitiesRef}
                    className="flex gap-2 overflow-x-auto scroll-smooth py-1 pr-1 [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {listingAmenityIcons.map((amenity) => (
                      <Tooltip key={amenity.name}>
                        <TooltipTrigger asChild>
                          <span className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/50 bg-muted/30 text-muted-foreground">
                            <amenity.icon className="size-5" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-neutral-200 text-neutral-950 dark:bg-neutral-50">
                          <p>{amenity.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
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

            {/* Listed by — host identity band */}
            <div>
              <SectionHeading eyebrow="Your host">Listed by</SectionHeading>
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-accent to-orange-500 text-white shadow-lg">
                <div className="flex items-center gap-4 p-5">
                  <div className="size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white/40">
                    {listing.imageSrc ? (
                      <img
                        src={listing.imageSrc}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/20">
                        <Smartphone className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold tracking-tight text-white">
                      {listing.host?.name ?? "Cohabit host"}
                    </h3>
                    {listing.description && (
                      <p className="text-sm text-white/80">{listing.description}</p>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-white/10 bg-white/5 px-5 pb-1">
                  <DetailRow tone="dark" icon={MapPin} label="Location" value={listing.location} />
                  <DetailRow
                    tone="dark"
                    icon={Phone}
                    label="Cellphone"
                    value={hasPhone ? phoneNumber : "Not shared"}
                  />
                  <DetailRow
                    tone="dark"
                    icon={Mail}
                    label="Email"
                    value={hasEmail ? emailAddress : "Not shared"}
                  />
                </div>

                {verified.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-5 py-3">
                    {verified.map((v) => {
                      const config = VERIFICATION_CONFIG[v]
                      const Icon = config.icon
                      return (
                        <span
                          key={v}
                          className={`inline-flex items-center gap-0.5 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium ${VERIFICATION_COLORS[v]}`}
                        >
                          <Icon className="size-2.5" />
                          {config.label}
                        </span>
                      )
                    })}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-5 py-3">
                  <span className="mr-1 inline-flex w-full items-center gap-1.5 text-xs text-white/70">
                    <Zap className="size-3.5 text-amber-200" />
                    Responds {responseTime.toLowerCase()}
                  </span>
                  {hasPhone && (
                    <a
                      href={`tel:${phoneNumber.replace(/\s/g, "")}`}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-blue-400"
                    >
                      <Phone className="size-3" />
                      Call
                    </a>
                  )}
                  {hasEmail && (
                    <a
                      href={`mailto:${emailAddress}`}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-purple-500 px-3 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-purple-400"
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
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[10px] font-medium text-accent transition-colors hover:bg-white/90"
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
                <SectionHeading eyebrow="Shared living">Home rules</SectionHeading>
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

            {/* Location / map */}
            {listing.address && (
              <div>
                <SectionHeading eyebrow="Where it is">Location</SectionHeading>
                <ViewOnMap address={listing.address} />
              </div>
            )}

            {/* More related listings */}
            {listing.relatedListings && listing.relatedListings.length > 0 && (
              <div>
                <SectionHeading eyebrow="Keep exploring">More listings</SectionHeading>
                <div className="flex flex-col gap-2">
                  {listing.relatedListings.slice(0, 4).map((related) => (
                    <button
                      key={related.id}
                      type="button"
                      onClick={() => onViewRelated?.(related.id)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border/50 bg-background p-3 text-left shadow-sm transition-colors hover:border-accent/40 hover:bg-accent/5"
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
              </div>
            )}

            {/* Report listing */}
            <div className="rounded-2xl border-2 border-dashed border-amber-300/70 bg-gradient-to-b from-amber-50/50 to-background p-4 text-center dark:border-amber-500/30 dark:from-amber-500/10">
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
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800/60 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <Flag className="size-3.5" />
                Report this listing
              </button>
            </div>

            <div className="h-8" />
          </div>
        </div>

        {/* Sticky bottom action bar */}
        <div className="sticky bottom-0 z-30 border-t border-border bg-background/95 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-foreground">
                {formatPrice(listing.price)}
                <span className="text-xs font-medium text-muted-foreground">
                  {" "}
                  {listing.priceUnit ?? "/month"}
                </span>
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{listing.location}</span>
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

      {/* Structured inquiry form */}
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
                    {listing.imageSrc ? (
                      <img
                        src={listing.imageSrc}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-accent/10 text-accent">
                        <Home className="size-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">
                      Request to view
                    </h2>
                    <p className="truncate text-xs text-muted-foreground">
                      {listing.title} · {listing.location}
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
                  onRequestView?.(listing.id, {
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
                    <select
                      id="inquiry-occupants"
                      value={inquiryOccupants}
                      onChange={(e) => setInquiryOccupants(e.target.value)}
                      aria-label="Number of occupants"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "person" : "people"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="inquiry-message"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Message to {listing.title.split(" ")[0]}
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
                      {listing.title} · {listing.location}
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
                  onReport?.(listing.id, {
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
                    {REPORT_REASONS.map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setReportReason(id)}
                        aria-pressed={reportReason === id}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          reportReason === id
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
    <div className="col-span-2 flex items-center gap-2.5 rounded-xl border border-accent/15 bg-background/80 px-3 py-2.5 shadow-sm">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <p className="truncate text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
  tone = "light",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  tone?: "light" | "dark"
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Icon
        className={`size-4 shrink-0 ${
          tone === "dark" ? "text-white/60" : "text-muted-foreground"
        }`}
      />
      <span
        className={`w-24 shrink-0 text-xs ${
          tone === "dark" ? "text-white/50" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      <span
        className={`truncate text-sm font-medium ${
          tone === "dark" ? "text-white" : ""
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function SectionHeading({
  eyebrow,
  children,
}: {
  eyebrow: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-2">
      <span className="text-[10px] font-bold tracking-[0.22em] text-accent uppercase">
        {eyebrow}
      </span>
      <h2 className="mt-0.5 text-sm font-semibold text-foreground">{children}</h2>
    </div>
  )
}