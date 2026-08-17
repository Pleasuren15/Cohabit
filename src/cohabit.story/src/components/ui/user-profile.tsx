import { useState, useCallback, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Smartphone,
  BadgeCheck,
  Shield,
  X,
  Venus,
  Mars,
  Pencil,
  Plus,
  Building2,
  Wifi,
  ParkingSquare,
  Dumbbell,
  Flame,
  Tv,
  Droplets,
  Snowflake,
  ShowerHead,
  Utensils,
  MessageCircle,
  Users,
  Check,
  LogOut,
  Camera,
  PenLine,
  AlertTriangle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { MinimalCarousel, type CarouselCard } from "./minimal-carousel"
import { EditProfile, type ProfileData } from "./edit-profile"
import { FileUpload, type FileItem, type FileStatus } from "./file-upload-2"
import { TaskWidget, type TaskData } from "./task-widget-disclosure"
import { PrivacyDialog } from "./privacy-dialog"

export interface UserData {
  id: string
  firstName: string
  lastName: string
  cellphone: string
  email: string
  dateOfBirth: string
  gender: string
  bio: string
  isOtpVerified: boolean
  address?: string
  avatarUrl?: string
  timestamp?: string
}

export type VerificationType = "phone" | "email" | "id"

export interface NewListingData {
  name: string
  location: string
  address: string
  bio: string
  type: "roommate" | "rentals"
  price: number
  deposit: number
  beds: number
  baths: number
  availableFrom: string
  amenities: string[]
}

export type InquiryStatus = "new" | "contacted" | "accepted" | "declined"

export interface Inquiry {
  id: string
  listingId: string
  listingTitle: string
  listingImageSrc?: string
  type: "roommate" | "rentals"
  inquireeUserId: string
  inquireeName: string
  /** ISO date `YYYY-MM-DD`. */
  moveInDate: string
  occupants: number
  message: string
  status: InquiryStatus
  createdAt: string
}

const INQUIRY_STATUS_META: Record<
  InquiryStatus,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  },
  contacted: {
    label: "Contacted",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  accepted: {
    label: "Accepted",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  declined: {
    label: "Declined",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-400",
  },
}

export interface Amenity {
  name: string
  icon: LucideIcon
}

export const AMENITIES: Amenity[] = [
  { name: "Wi-Fi", icon: Wifi },
  { name: "Parking", icon: ParkingSquare },
  { name: "Gym", icon: Dumbbell },
  { name: "Heating", icon: Flame },
  { name: "Smart TV", icon: Tv },
  { name: "Water backup", icon: Droplets },
  { name: "Air conditioning", icon: Snowflake },
  { name: "En-suite bathroom", icon: ShowerHead },
  { name: "Kitchen", icon: Utensils },
]

const LISTING_STEPS = ["Type", "Basics", "Price & size", "Amenities", "Description", "Photos"]

const ALL_VERIFICATIONS: {
  key: VerificationType
  label: string
  icon: LucideIcon
  color: string
  bgColor: string
}[] = [
  { key: "phone", label: "Phone", icon: Smartphone, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { key: "email", label: "Email", icon: Mail, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { key: "id", label: "ID", icon: BadgeCheck, color: "text-green-500", bgColor: "bg-green-500/10" },
]

const VERIFIED_CHIP_TONES: Record<VerificationType, string> = {
  phone: "bg-blue-500/15 text-blue-300",
  email: "bg-purple-500/15 text-purple-300",
  id: "bg-green-500/15 text-green-300",
}

export interface UserProfileProps {
  user: UserData
  userListings: CarouselCard[]
  verified: VerificationType[]
  onVerify: (type: VerificationType) => void
  onUpdateUser?: (user: UserData) => void
  onToggleFavorite: (id: string) => void
  onViewListing: (id: string) => void
  onAddListing?: (data: NewListingData) => void
  inquiries?: Inquiry[]
  onUpdateInquiryStatus?: (id: string, status: InquiryStatus) => void
}

export function UserProfile({
  user,
  userListings,
  verified,
  onVerify,
  onUpdateUser,
  onToggleFavorite,
  onViewListing,
  onAddListing,
  inquiries = [],
  onUpdateInquiryStatus,
}: UserProfileProps) {
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [showNewListing, setShowNewListing] = useState(false)
  const [listingStep, setListingStep] = useState(1)
  const [newListingType, setNewListingType] = useState<"roommate" | "rentals">("roommate")
  const [newListingName, setNewListingName] = useState("")
  const [newListingLocation, setNewListingLocation] = useState("")
  const [newListingAddress, setNewListingAddress] = useState("")
  const [newListingBio, setNewListingBio] = useState("")
  const [newListingPrice, setNewListingPrice] = useState("")
  const [newListingDeposit, setNewListingDeposit] = useState("")
  const [newListingBeds, setNewListingBeds] = useState("1")
  const [newListingBaths, setNewListingBaths] = useState("1")
  const [newListingAvailable, setNewListingAvailable] = useState("")
  const [newListingAmenities, setNewListingAmenities] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([])

  const resetNewListing = () => {
    setListingStep(1)
    setNewListingType("roommate")
    setNewListingName("")
    setNewListingLocation("")
    setNewListingAddress("")
    setNewListingBio("")
    setNewListingPrice("")
    setNewListingDeposit("")
    setNewListingBeds("1")
    setNewListingBaths("1")
    setNewListingAvailable("")
    setNewListingAmenities([])
    setUploadedFiles([])
  }

  const openNewListing = () => {
    resetNewListing()
    setShowNewListing(true)
  }

  const fullName = `${user.firstName} ${user.lastName}`

  const completionSteps = [
    {
      id: "photo",
      label: "Add a profile photo",
      hint: "Help others recognise you",
      icon: Camera,
      completed: Boolean(user.avatarUrl),
    },
    {
      id: "bio",
      label: "Add a bio",
      hint: "Tell hosts and housemates a little about yourself",
      icon: PenLine,
      completed: Boolean(user.bio?.trim()),
    },
    {
      id: "phone",
      label: "Add your phone number",
      hint: "So people can reach you",
      icon: Phone,
      completed: Boolean(user.cellphone?.trim()),
    },
    {
      id: "dob",
      label: "Add your date of birth",
      hint: "Required for identity checks",
      icon: Calendar,
      completed:
        Boolean(user.dateOfBirth) && user.dateOfBirth !== "2000-01-01",
    },
    {
      id: "email",
      label: "Confirm your email address",
      hint: "Verify your account ownership",
      icon: Mail,
      completed: verified.includes("email"),
    },
    {
      id: "address",
      label: "Add your address",
      hint: "Help people find your area",
      icon: MapPin,
      completed: Boolean(user.address?.trim()),
    },
  ]

  const completionData: TaskData = {
    subtasks: completionSteps.map(({ id, label, completed }) => ({
      id,
      title: label,
      completed,
    })),
    completedCount: completionSteps.filter((s) => s.completed).length,
    totalCount: completionSteps.length,
    progress: Math.round(
      (completionSteps.filter((s) => s.completed).length /
        completionSteps.length) *
        100
    ),
    priority: "High",
    status: "In Progress",
    title: "Complete your profile",
    assignees: [],
  }

  const missingSteps = completionSteps.filter((step) => !step.completed)

  const ownListingIds = new Set(userListings.map((l) => l.id))
  const listingInquiries = inquiries
    .filter((inq) => ownListingIds.has(inq.listingId))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  const newInquiryCount = listingInquiries.filter(
    (i) => i.status === "new"
  ).length

  const formatInquiryDate = (iso: string) => {
    const parsed = new Date(`${iso} 12:00:00`)
    if (Number.isNaN(parsed.getTime())) return iso
    return parsed.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const profileData: ProfileData = {
    fullName,
    email: user.email,
    cellphone: user.cellphone,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    title: user.bio,
    address: user.address ?? "",
    avatarUrl: user.avatarUrl || "",
  }

  const handleFilesAdded = useCallback((files: File[]) => {
    setUploadedFiles((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        progress: 100,
        status: "success" as FileStatus,
      })),
    ])
  }, [])

  const handleFileRemove = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const toggleAmenity = (name: string) => {
    setNewListingAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name],
    )
  }

  const handleNewListing = (e: FormEvent) => {
    e.preventDefault()
    if (listingStep < LISTING_STEPS.length) return
    if (!newListingName.trim() || !newListingLocation.trim()) return
    onAddListing?.({
      name: newListingName.trim(),
      location: newListingLocation.trim(),
      address: newListingAddress.trim(),
      bio: newListingBio.trim(),
      type: newListingType,
      price: parseInt(newListingPrice, 10) || 0,
      deposit: parseInt(newListingDeposit, 10) || 0,
      beds: parseInt(newListingBeds, 10) || 1,
      baths: parseInt(newListingBaths, 10) || 1,
      availableFrom: newListingAvailable.trim() || "Flexible",
      amenities: newListingAmenities,
    })
    resetNewListing()
    setShowNewListing(false)
  }

  const handleSaveProfile = (data: ProfileData) => {
    const parts = data.fullName.split(" ")
    const updated: UserData = {
      ...user,
      firstName: parts[0] || user.firstName,
      lastName: parts.slice(1).join(" ") || user.lastName,
      email: data.email,
      cellphone: data.cellphone ?? user.cellphone,
      dateOfBirth: data.dateOfBirth ?? user.dateOfBirth,
      gender: data.gender ?? user.gender,
      bio: data.title,
      address: data.address,
      avatarUrl: data.avatarUrl || user.avatarUrl,
    }
    onUpdateUser?.(updated)
    setShowEditProfile(false)
  }

  const canProceedStep =
    listingStep === 2
      ? newListingName.trim().length > 0 &&
        newListingLocation.trim().length > 0 &&
        newListingAddress.trim().length > 0
      : listingStep === 3
        ? (parseInt(newListingPrice, 10) || 0) > 0
        : true

  return (
    <div className="mx-auto w-full max-w-md space-y-5 pb-8">
      {/* Page heading */}
      <div className="mb-2 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1 rounded-full bg-primary/80" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Manage your account</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Identity hero */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-accent to-orange-500 text-white shadow-lg">
        <div className="flex items-center gap-4 p-5">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={fullName}
              className="size-14 shrink-0 rounded-full object-cover ring-2 ring-white/40"
            />
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <User className="size-7" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-[0.22em] text-white/70 uppercase">
                Your profile
              </span>
              <button
                type="button"
                onClick={() => setShowEditProfile(true)}
                className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                aria-label="Edit profile"
              >
                <Pencil className="size-3.5" />
                Edit
              </button>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              {fullName}
            </h2>
            {user.bio ? (
              <p className="text-sm text-white/80">{user.bio}</p>
            ) : null}
          </div>
        </div>

        <div className="divide-y divide-white/10 bg-white/5 px-5 pb-1">
          <DetailRow tone="dark" icon={Phone} label="Cellphone" value={user.cellphone} />
          <DetailRow tone="dark" icon={Mail} label="Email" value={user.email} />
          <DetailRow tone="dark" icon={Calendar} label="Date of Birth" value={user.dateOfBirth} />
          <DetailRow
            tone="dark"
            icon={user.gender === "male" ? Mars : Venus}
            label="Gender"
            value={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
          />
          <DetailRow
            tone="dark"
            icon={MapPin}
            label="Location"
            value={user.address?.trim()
              ? `${user.address.trim()} · South Africa`
              : "South Africa"}
          />
          <DetailRow tone="dark" icon={Clock} label="Member since" value={user.timestamp || "July 2025"} />
        </div>
      </div>

      {/* Profile completion widget */}
      <div className="flex justify-center">
        <TaskWidget data={completionData} variant="accent" />
      </div>

      {/* Missing details — attention panel */}
      <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-b from-amber-50/70 to-background p-5 shadow-sm dark:border-amber-500/25 dark:from-amber-500/10 dark:to-background">
        <div className="mb-3 flex items-center gap-2">
          {missingSteps.length > 0 ? (
            <>
              <AlertTriangle className="size-4 text-amber-500" />
              <h3 className="text-sm font-semibold">
                Still missing ({missingSteps.length})
              </h3>
            </>
          ) : (
            <>
              <BadgeCheck className="size-4 text-green-500" />
              <h3 className="text-sm font-semibold">Profile complete</h3>
            </>
          )}
        </div>

        {missingSteps.length > 0 ? (
          <div className="space-y-2">
            {missingSteps.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className="flex items-center gap-3 rounded-xl border border-dashed border-amber-300/60 bg-background/70 px-3 py-2.5 dark:border-amber-500/40"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100/80 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.hint}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(true)}
                    className="shrink-0 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            All your details are set — nothing missing.
          </p>
        )}
      </div>

      {/* Verification Section — trust panel */}
      <div className="rounded-2xl bg-foreground text-white shadow-xl">
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-amber-300" />
            <h3 className="text-sm font-semibold text-white">Verifications</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowVerifyDialog(true)}
            className="rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Verify
          </button>
        </div>

        <div className="flex flex-wrap gap-2 p-5">
          {ALL_VERIFICATIONS.map((v) => {
            const isVerified = verified.includes(v.key)
            const Icon = v.icon
            return (
              <span
                key={v.key}
                className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium ${
                  isVerified
                    ? VERIFIED_CHIP_TONES[v.key]
                    : "bg-white/5 text-white/50"
                }`}
              >
                <Icon className="size-3.5" />
                {v.label}
                {isVerified && <BadgeCheck className="size-3" />}
              </span>
            )
          })}
        </div>
      </div>

      <PrivacyDialog />

      {/* My Listings — portfolio */}
      <div className="space-y-3">
        <div className="flex items-end justify-between px-1">
          <div>
            <span className="text-[10px] font-bold tracking-[0.22em] text-accent uppercase">
              Portfolio
            </span>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight">My Listings</h3>
              <span className="text-xs text-muted-foreground">({userListings.length})</span>
            </div>
          </div>
          <button
            type="button"
            onClick={openNewListing}
            className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md"
            aria-label="New listing"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        </div>
        {userListings.length > 0 ? (
          <MinimalCarousel
            cards={userListings}
            onFavoriteToggle={(card) => onToggleFavorite(card.id)}
            onViewListing={(card) => onViewListing(card.id)}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
            You haven't created any listings yet.
          </div>
        )}
      </div>

      {/* Inquiries — landlord inbox */}
      {userListings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-end justify-between px-1">
            <div>
              <span className="text-[10px] font-bold tracking-[0.22em] text-accent uppercase">
                Landlord inbox
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold tracking-tight">Inquiries</h3>
                {newInquiryCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                    {newInquiryCount} new
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {listingInquiries.length} total
            </span>
          </div>

          {listingInquiries.length > 0 ? (
            <div className="space-y-2">
              {listingInquiries.map((inq) => {
                const initials = inq.inquireeName
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
                const meta = INQUIRY_STATUS_META[inq.status]
                const canRespond =
                  inq.status === "new" || inq.status === "contacted"
                return (
                  <div
                    key={inq.id}
                    className="rounded-2xl border border-border/40 bg-background p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {inq.inquireeName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {inq.listingTitle}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3 text-accent" />
                        Moves in {formatInquiryDate(inq.moveInDate)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3 text-accent" />
                        {inq.occupants}{" "}
                        {inq.occupants === 1 ? "occupant" : "occupants"}
                      </span>
                    </div>

                    {inq.message && (
                      <p className="mt-2 rounded-xl bg-muted/40 px-3 py-2 text-xs leading-relaxed text-foreground/80">
                        “{inq.message}”
                      </p>
                    )}

                    {canRespond && (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateInquiryStatus?.(inq.id, "contacted")
                          }
                          className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <MessageCircle className="size-3" />
                          Mark contacted
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateInquiryStatus?.(inq.id, "accepted")
                          }
                          className="flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-emerald-600"
                        >
                          <Check className="size-3" />
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateInquiryStatus?.(inq.id, "declined")
                          }
                          className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-red-600"
                        >
                          <X className="size-3" />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
              No inquiries yet. Share your listings to start receiving requests.
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showNewListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
            onClick={() => setShowNewListing(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">New Listing</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNewListing(false)}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <form onSubmit={handleNewListing} className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                    <span>
                      Step {listingStep} of {LISTING_STEPS.length}
                    </span>
                    <span>{LISTING_STEPS[listingStep - 1]}</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-300"
                      style={{
                        width: `${(listingStep / LISTING_STEPS.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {listingStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">What are you listing?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewListingType("roommate")}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-all",
                          newListingType === "roommate"
                            ? "border-accent bg-accent/10"
                            : "border-border bg-background",
                        )}
                      >
                        <User
                          className={cn(
                            "size-6",
                            newListingType === "roommate"
                              ? "text-accent"
                              : "text-muted-foreground",
                          )}
                        />
                        <span className="text-sm font-medium">Roommate</span>
                        <span className="text-[11px] text-muted-foreground">
                          Join a shared space
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewListingType("rentals")}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-all",
                          newListingType === "rentals"
                            ? "border-accent bg-accent/10"
                            : "border-border bg-background",
                        )}
                      >
                        <Building2
                          className={cn(
                            "size-6",
                            newListingType === "rentals"
                              ? "text-accent"
                              : "text-muted-foreground",
                          )}
                        />
                        <span className="text-sm font-medium">Rentals</span>
                        <span className="text-[11px] text-muted-foreground">
                          Rent out a property
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {listingStep === 2 && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="nl-title">Title</Label>
                      <Input
                        id="nl-title"
                        value={newListingName}
                        onChange={(e) => setNewListingName(e.target.value)}
                        placeholder="e.g. Cozy room in Sea Point"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="nl-location">Location</Label>
                      <Input
                        id="nl-location"
                        value={newListingLocation}
                        onChange={(e) => setNewListingLocation(e.target.value)}
                        placeholder="e.g. Sea Point, Cape Town"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="nl-address">Address</Label>
                      <Input
                        id="nl-address"
                        value={newListingAddress}
                        onChange={(e) => setNewListingAddress(e.target.value)}
                        placeholder="e.g. 12 Main Road, Sea Point"
                        required
                      />
                    </div>
                  </div>
                )}

                {listingStep === 3 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="nl-price">Price (R/month)</Label>
                        <Input
                          id="nl-price"
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={newListingPrice}
                          onChange={(e) => setNewListingPrice(e.target.value)}
                          placeholder="e.g. 6500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="nl-deposit">Deposit (R)</Label>
                        <Input
                          id="nl-deposit"
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={newListingDeposit}
                          onChange={(e) => setNewListingDeposit(e.target.value)}
                          placeholder="e.g. 6500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="nl-beds">Bedrooms</Label>
                        <Input
                          id="nl-beds"
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={newListingBeds}
                          onChange={(e) => setNewListingBeds(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="nl-baths">Bathrooms</Label>
                        <Input
                          id="nl-baths"
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={newListingBaths}
                          onChange={(e) => setNewListingBaths(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="nl-available">Available from</Label>
                      <Input
                        id="nl-available"
                        value={newListingAvailable}
                        onChange={(e) => setNewListingAvailable(e.target.value)}
                        placeholder="e.g. 1 Sep 2026 or Flexible"
                      />
                    </div>
                  </div>
                )}

                {listingStep === 4 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">What does the space offer?</p>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES.map((amenity) => {
                        const selected = newListingAmenities.includes(amenity.name)
                        return (
                          <button
                            key={amenity.name}
                            type="button"
                            onClick={() => toggleAmenity(amenity.name)}
                            className={cn(
                              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                              selected
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border bg-background text-muted-foreground",
                            )}
                          >
                            <amenity.icon className="size-3.5" />
                            {amenity.name}
                          </button>
                        )
                      })}
                    </div>
                    {newListingAmenities.length === 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        Optional — you can add more later.
                      </p>
                    )}
                  </div>
                )}

                {listingStep === 5 && (
                  <div className="space-y-1.5">
                    <Label htmlFor="nl-bio">Description</Label>
                    <textarea
                      id="nl-bio"
                      value={newListingBio}
                      onChange={(e) => setNewListingBio(e.target.value)}
                      placeholder="Describe the space or what you're looking for..."
                      rows={5}
                      className="flex min-h-24 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-all placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </div>
                )}

                {listingStep === 6 && (
                  <div className="space-y-1.5">
                    <Label>Photos</Label>
                    <FileUpload
                      files={uploadedFiles}
                      onFilesAdded={handleFilesAdded}
                      onFileRemove={handleFileRemove}
                      maxFiles={5}
                      maxSizeMB={10}
                      accept="image/*"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  {listingStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setListingStep((s) => s - 1)}
                    >
                      Back
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowNewListing(false)
                        resetNewListing()
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  {listingStep < LISTING_STEPS.length ? (
                    <Button
                      type="button"
                      className="flex-1 bg-accent text-white hover:bg-accent/90"
                      onClick={(e) => {
                        e.preventDefault()
                        setListingStep((s) => s + 1)
                      }}
                      disabled={!canProceedStep}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-1 bg-accent text-white hover:bg-accent/90"
                    >
                      Create listing
                    </Button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <EditProfile
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        initialData={profileData}
        onSave={handleSaveProfile}
      />

      <AnimatePresence>
        {showVerifyDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
            onClick={() => setShowVerifyDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">Verify Your Identity</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowVerifyDialog(false)}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {ALL_VERIFICATIONS.map((v) => {
                  const isVerified = verified.includes(v.key)
                  const Icon = v.icon
                  return (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => {
                        onVerify(v.key)
                        setShowVerifyDialog(false)
                      }}
                      disabled={isVerified}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
                        isVerified
                          ? "border-green-200 bg-green-50/50 opacity-60 dark:border-green-800 dark:bg-green-900/10"
                          : "border-border hover:border-accent/40 hover:bg-accent/5",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-lg",
                          isVerified ? v.bgColor : "bg-muted",
                        )}
                      >
                        <Icon
                          className={cn("size-5", isVerified ? v.color : "text-muted-foreground")}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{v.label} Verification</p>
                        <p className="text-xs text-muted-foreground">
                          {isVerified ? "Verified" : `Verify your ${v.label.toLowerCase()}`}
                        </p>
                      </div>
                      {isVerified && <BadgeCheck className="size-5 shrink-0 text-green-500" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
  valueNode,
  tone = "light",
}: {
  icon: LucideIcon
  label: string
  value?: string
  valueNode?: React.ReactNode
  tone?: "light" | "dark"
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Icon
        className={`size-4 shrink-0 ${
          tone === "dark" ? "text-white/60" : "text-accent"
        }`}
      />
      <span
        className={`min-w-0 truncate text-sm font-medium ${
          tone === "dark" ? "text-white" : ""
        }`}
      >
        {valueNode ?? value}
      </span>
      <span
        className={`ml-auto shrink-0 text-xs ${
          tone === "dark" ? "text-white/50" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  )
}
