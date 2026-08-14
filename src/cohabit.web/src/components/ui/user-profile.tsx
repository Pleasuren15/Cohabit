"use client"

import { useState, useCallback, useEffect, useRef, useId, useMemo, type FormEvent } from "react"
import { motion, AnimatePresence } from "motion/react"
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
  LogOut,
  Camera,
  PenLine,
  AlertTriangle,
  Check,
  Users,
  MessageCircle,
  type LucideIcon,
} from "lucide-react"
import type { FeaturedProfile } from "@/App"
import {
  amenityNameToId,
  ruleNameToId,
} from "@/services/listing-service"
import type { Inquiry, InquiryStatus } from "@/services/inquiries-service"
import { AMENITIES, AMENITY_NAMES } from "@/lib/amenities"
import { MinimalCarousel, type CarouselCard } from "./minimal-carousel"
import { EditProfile, type ProfileData } from "./edit-profile"
import { ProfileCompletionDialog } from "./profile-completion-dialog"
import { FileUpload, type FileItem, type FileStatus } from "./file-upload-2"
import { TaskWidget, type TaskData, type Subtask } from "./task-widget-disclosure"
import { PrivacyDialog } from "./privacy-dialog"
import { authService } from "@/services/auth-service"

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

export type VerificationType = "phone" | "email" | "id" | "credit"

const LISTING_STEPS = ["Type", "Basics", "Price & size", "Amenities", "Description", "Photos"]

const ALL_VERIFICATIONS: {
  key: VerificationType
  label: string
  icon: typeof Smartphone
  color: string
  bgColor: string
}[] = [
  { key: "phone", label: "Phone", icon: Smartphone, color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-500/10" },
  { key: "email", label: "Email", icon: Mail, color: "text-purple-500", bgColor: "bg-purple-50 dark:bg-purple-500/10" },
  { key: "id", label: "ID", icon: BadgeCheck, color: "text-green-500", bgColor: "bg-green-50 dark:bg-green-500/10" },
  { key: "credit", label: "Credit", icon: Shield, color: "text-amber-500", bgColor: "bg-amber-50 dark:bg-amber-500/10" },
]

const VERIFIED_CHIP_TONES: Record<VerificationType, string> = {
  phone: "bg-blue-500/15 text-blue-300",
  email: "bg-purple-500/15 text-purple-300",
  id: "bg-green-500/15 text-green-300",
  credit: "bg-amber-500/15 text-amber-300",
}

const LISTING_GRADIENTS = [
  "bg-gradient-to-br from-rose-500 to-pink-600",
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-blue-500 to-cyan-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-amber-500 to-orange-600",
  "bg-gradient-to-br from-indigo-500 to-blue-600",
  "bg-gradient-to-br from-teal-500 to-green-600",
  "bg-gradient-to-br from-fuchsia-500 to-pink-600",
  "bg-gradient-to-br from-orange-500 to-red-600",
]

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

/** API amenity names -> the labels shown in the add/edit form. */
const DB_TO_WEB_AMENITY: Record<string, string> = {
  "High Speed WiFi": "Wi-Fi",
  "Air Conditioning": "Air conditioning",
}

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
  files: File[]
  amenityIds: number[]
  ruleIds: number[]
}

interface UserProfileProps {
  user: UserData
  userListings: FeaturedProfile[]
  verified: VerificationType[]
  onVerify: (type: VerificationType) => void
  onUpdateUser?: (user: UserData) => void
  onToggleFavorite: (id: string) => void
  onViewListing: (id: string) => void
  onAddListing?: (data: NewListingData) => Promise<void>
  onUpdateListing?: (id: string, data: NewListingData) => Promise<void>
  getListingDetail?: (id: string) => Promise<FeaturedProfile | null>
  onSignOut?: () => Promise<void>
  inquiries?: Inquiry[]
  onUpdateInquiryStatus?: (id: string, status: InquiryStatus) => void
  openNewListingSignal?: number
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
  onUpdateListing,
  getListingDetail,
  onSignOut,
  inquiries = [],
  onUpdateInquiryStatus,
  openNewListingSignal = 0,
}: UserProfileProps) {
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [activeMissingStep, setActiveMissingStep] = useState<string | null>(null)
  // Opens immediately when the parent triggered a "List your space" request
  // (signal increments) and this component mounts on the Profile tab.
  const [showNewListing, setShowNewListing] = useState(
    () => openNewListingSignal > 0
  )
  const [listingStep, setListingStep] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const originalAmenitiesRef = useRef<number[]>([])
  const originalRulesRef = useRef<number[]>([])
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
  const listingFormId = useId()

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
    setEditingId(null)
    originalAmenitiesRef.current = []
    originalRulesRef.current = []
  }

  const openNewListing = () => {
    resetNewListing()
    setShowNewListing(true)
  }

  const openEditListing = async (profile: FeaturedProfile) => {
    const detail = (await getListingDetail?.(profile.id)) ?? profile
    originalAmenitiesRef.current = (detail.amenities ?? [])
      .map((name) => amenityNameToId(name))
      .filter((n): n is number => n !== undefined)
    originalRulesRef.current = (detail.rules ?? [])
      .map((name) => ruleNameToId(name))
      .filter((n): n is number => n !== undefined)
    setEditingId(profile.id)
    setNewListingType(profile.type)
    setNewListingName(profile.title ?? profile.name)
    setNewListingLocation(profile.location)
    setNewListingAddress(detail.addressLine1 ?? "")
    setNewListingPrice(String(profile.price))
    setNewListingDeposit(String(profile.deposit))
    setNewListingBeds(String(profile.beds))
    setNewListingBaths(String(profile.baths))
    setNewListingAvailable(profile.availableFrom)
    setNewListingAmenities(
      (detail.amenities ?? [])
        .map((name) => DB_TO_WEB_AMENITY[name] ?? name)
        .filter((name) => AMENITY_NAMES.includes(name))
    )
    setNewListingBio(profile.bio)
    setUploadedFiles([])
    setListingStep(1)
    setShowNewListing(true)
  }

  const fullName = `${user.firstName} ${user.lastName}`

  // Profile-completeness: every missing detail is a step towards a fully set-up
  // account. Progress reflects how far the profile is from being complete.
  const completionSteps = useMemo(
    () =>
      [
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
      ] satisfies { id: string; label: string; hint: string; icon: LucideIcon; completed: boolean }[],
    [user, verified]
  )

  const completionData = useMemo<TaskData>(() => {
    const subtasks: Subtask[] = completionSteps.map(({ id, label, completed }) => ({
      id,
      title: label,
      completed,
    }))
    const completedCount = subtasks.filter((s) => s.completed).length
    const totalCount = subtasks.length
    const progress = Math.round((completedCount / totalCount) * 100)
    return {
      title: "Complete your profile",
      progress,
      completedCount,
      totalCount,
      priority: progress === 100 ? "Done" : progress >= 60 ? "Medium" : "High",
      status: progress === 100 ? "Complete" : "In Progress",
      subtasks,
      assignees: [],
    }
  }, [completionSteps])

  const missingSteps = completionSteps.filter((step) => !step.completed)

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
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    )
  }

  const handleNewListing = async (e: FormEvent) => {
    e.preventDefault()
    if (listingStep < LISTING_STEPS.length) return
    if (!newListingName.trim() || !newListingLocation.trim()) return

    const selectedAmenityIds = newListingAmenities
      .map((name) => amenityNameToId(name))
      .filter((n): n is number => n !== undefined)

    const data: NewListingData = {
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
      files: uploadedFiles.map((f) => f.file),
      amenityIds: editingId
        ? [...new Set([...originalAmenitiesRef.current, ...selectedAmenityIds])]
        : selectedAmenityIds,
      ruleIds: originalRulesRef.current,
    }

    try {
      if (editingId) {
        await onUpdateListing?.(editingId, data)
      } else {
        await onAddListing?.(data)
      }
      resetNewListing()
      setShowNewListing(false)
    } catch {
      // Keep the dialog open; the caller has already surfaced the error.
    }
  }

  const handleSaveProfile = async (data: ProfileData) => {
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
    try {
      // The address lives in the Supabase auth profile (the API user has no
      // free-text address column yet), so persist it there too. This triggers an
      // auth state change that refreshes the in-memory profile via toUserData.
      await authService.updateProfileMetadata({ address: data.address ?? "" })
      await onUpdateUser?.(updated)
      setShowEditProfile(false)
    } catch {
      // Keep the dialog open; the caller has already surfaced the error.
    }
  }

  /** Saves a single missing profile detail from its dedicated completion form. */
  const handleSaveMissingStep = async (
    stepId: string,
    updated: UserData
  ) => {
    try {
      if (stepId === "address") {
        await authService.updateProfileMetadata({
          address: updated.address ?? "",
        })
      }
      await onUpdateUser?.(updated)
      setActiveMissingStep(null)
    } catch {
      // Keep the dialog open; the caller has already surfaced the error.
    }
  }

  const canProceedStep =
    listingStep === 2
      ? newListingName.trim().length > 0 &&
        newListingLocation.trim().length > 0 &&
        newListingAddress.trim().length > 0
      : listingStep === 3
        ? (parseInt(newListingPrice, 10) || 0) > 0
        : true

  // Close dialogs on Escape when open.
  useEffect(() => {
    if (!showNewListing && !showVerifyDialog) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowNewListing(false)
        setShowVerifyDialog(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [showNewListing, showVerifyDialog])

  const listingCards: CarouselCard[] = userListings.map((p, i) => ({
    id: p.id,
    title: p.title ?? p.name,
    value: p.location,
    color: LISTING_GRADIENTS[i % LISTING_GRADIENTS.length],
    imageSrc: p.imageSrc,
  }))

  // Inquiries for listings the current user owns — grouped per listing.
  const ownListingIds = useMemo(
    () => new Set(userListings.map((l) => l.id)),
    [userListings]
  )
  const listingInquiries = useMemo(
    () =>
      inquiries
        .filter((inq) => ownListingIds.has(inq.listingId))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [inquiries, ownListingIds]
  )
  const newInquiryCount = listingInquiries.filter((i) => i.status === "new").length

  const formatInquiryDate = (iso: string) => {
    const parsed = new Date(`${iso} 12:00:00`)
    if (Number.isNaN(parsed.getTime())) return iso
    return parsed.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-5 pb-8">
      {/* Page heading */}
      <div className="mb-2 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1 rounded-full bg-primary/80" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Manage your account
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void onSignOut?.()}
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
            valueNode={
              <span className="inline-flex items-center gap-1.5">
                <SouthAfricaFlag className="h-3 w-auto rounded-[1px] ring-1 ring-white/25" />
                {user.address?.trim()
                  ? `${user.address.trim()} · South Africa`
                  : "South Africa"}
              </span>
            }
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
                    onClick={() => setActiveMissingStep(step.id)}
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
            cards={listingCards}
            onFavoriteToggle={(card) => onToggleFavorite(card.id)}
            onViewListing={(card) => onViewListing(card.id)}
            onEditListing={(card) => {
              const profile = userListings.find((p) => p.id === card.id)
              if (profile && onUpdateListing) void openEditListing(profile)
            }}
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
                const canRespond = inq.status === "new" || inq.status === "contacted"
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
                        {inq.occupants} {inq.occupants === 1 ? "occupant" : "occupants"}
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
                          onClick={() => onUpdateInquiryStatus?.(inq.id, "contacted")}
                          className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <MessageCircle className="size-3" />
                          Mark contacted
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateInquiryStatus?.(inq.id, "accepted")}
                          className="flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-emerald-600"
                        >
                          <Check className="size-3" />
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateInquiryStatus?.(inq.id, "declined")}
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

      {/* New Listing Dialog */}
      <AnimatePresence>
        {showNewListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="New listing"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
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
                <h2 className="text-base font-semibold">
                  {editingId ? "Edit Listing" : "New Listing"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowNewListing(false)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleNewListing} className="space-y-4">
                {/* Step indicator */}
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

                {/* Step 1 — type */}
                {listingStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      What are you listing?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewListingType("roommate")}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-all ${
                          newListingType === "roommate"
                            ? "border-accent bg-accent/10"
                            : "border-border bg-background"
                        }`}
                      >
                        <User
                          className={`size-6 ${
                            newListingType === "roommate"
                              ? "text-accent"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span className="text-sm font-medium">Roommate</span>
                        <span className="text-[11px] text-muted-foreground">
                          Join a shared space
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewListingType("rentals")}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-all ${
                          newListingType === "rentals"
                            ? "border-accent bg-accent/10"
                            : "border-border bg-background"
                        }`}
                      >
                        <Building2
                          className={`size-6 ${
                            newListingType === "rentals"
                              ? "text-accent"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span className="text-sm font-medium">Rentals</span>
                        <span className="text-[11px] text-muted-foreground">
                          Rent out a property
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 — basics */}
                {listingStep === 2 && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label htmlFor={`${listingFormId}-title`} className="text-xs font-medium text-muted-foreground">Title</label>
                      <input
                        id={`${listingFormId}-title`}
                        value={newListingName}
                        onChange={(e) => setNewListingName(e.target.value)}
                        placeholder="e.g. Cozy room in Sea Point"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor={`${listingFormId}-location`} className="text-xs font-medium text-muted-foreground">Location</label>
                      <input
                        id={`${listingFormId}-location`}
                        value={newListingLocation}
                        onChange={(e) => setNewListingLocation(e.target.value)}
                        placeholder="e.g. Sea Point, Cape Town"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor={`${listingFormId}-address`} className="text-xs font-medium text-muted-foreground">
                        Address
                      </label>
                      <input
                        id={`${listingFormId}-address`}
                        value={newListingAddress}
                        onChange={(e) => setNewListingAddress(e.target.value)}
                        placeholder="e.g. 12 Main Road, Sea Point"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Step 3 — price & size */}
                {listingStep === 3 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label htmlFor={`${listingFormId}-price`} className="text-xs font-medium text-muted-foreground">
                          Price (R/month)
                        </label>
                        <input
                          id={`${listingFormId}-price`}
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={newListingPrice}
                          onChange={(e) => setNewListingPrice(e.target.value)}
                          placeholder="e.g. 6500"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor={`${listingFormId}-deposit`} className="text-xs font-medium text-muted-foreground">
                          Deposit (R)
                        </label>
                        <input
                          id={`${listingFormId}-deposit`}
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={newListingDeposit}
                          onChange={(e) => setNewListingDeposit(e.target.value)}
                          placeholder="e.g. 6500"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label htmlFor={`${listingFormId}-beds`} className="text-xs font-medium text-muted-foreground">Bedrooms</label>
                        <input
                          id={`${listingFormId}-beds`}
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={newListingBeds}
                          onChange={(e) => setNewListingBeds(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor={`${listingFormId}-baths`} className="text-xs font-medium text-muted-foreground">Bathrooms</label>
                        <input
                          id={`${listingFormId}-baths`}
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={newListingBaths}
                          onChange={(e) => setNewListingBaths(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor={`${listingFormId}-available`} className="text-xs font-medium text-muted-foreground">
                        Available from
                      </label>
                      <input
                        id={`${listingFormId}-available`}
                        value={newListingAvailable}
                        onChange={(e) => setNewListingAvailable(e.target.value)}
                        placeholder="e.g. 1 Sep 2026 or Flexible"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4 — amenities */}
                {listingStep === 4 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      What does the space offer?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES.map((amenity) => {
                        const selected = newListingAmenities.includes(amenity.name)
                        return (
                          <button
                            key={amenity.name}
                            type="button"
                            onClick={() => toggleAmenity(amenity.name)}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                              selected
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border bg-background text-muted-foreground"
                            }`}
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

                {/* Step 5 — description */}
                {listingStep === 5 && (
                  <div className="space-y-1.5">
                    <label htmlFor={`${listingFormId}-description`} className="text-xs font-medium text-muted-foreground">Description</label>
                    <textarea
                      id={`${listingFormId}-description`}
                      value={newListingBio}
                      onChange={(e) => setNewListingBio(e.target.value)}
                      placeholder="Describe the space or what you're looking for..."
                      rows={5}
                      className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                    />
                  </div>
                )}

                {/* Step 6 — photos */}
                {listingStep === 6 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Photos</label>
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

                {/* Footer navigation */}
                <div className="flex gap-3 pt-1">
                  {listingStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setListingStep((s) => s - 1)}
                      className="rounded-xl bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                    >
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewListing(false)
                        resetNewListing()
                      }}
                      className="rounded-xl bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                    >
                      Cancel
                    </button>
                  )}
                  {listingStep < LISTING_STEPS.length ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setListingStep((s) => s + 1)
                      }}
                      disabled={!canProceedStep}
                      className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      {editingId ? "Save changes" : "Create listing"}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Dialog */}
      <EditProfile
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        initialData={profileData}
        onSave={handleSaveProfile}
      />

      {/* Dedicated "Still missing" completion forms — one per missing detail */}
      {(() => {
        const step = completionSteps.find((s) => s.id === activeMissingStep)
        if (!step) return null
        return (
          <ProfileCompletionDialog
            key={step.id}
            step={step}
            open={activeMissingStep !== null}
            onClose={() => setActiveMissingStep(null)}
            user={user}
            verified={verified}
            onVerify={onVerify}
            onSave={handleSaveMissingStep}
          />
        )
      })()}

      {/* Verify Dialog — centered */}
      <AnimatePresence>
        {showVerifyDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Verify your identity"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
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
                <button
                  type="button"
                  onClick={() => setShowVerifyDialog(false)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
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
                      className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                        isVerified
                          ? "border-green-200 bg-green-50/50 opacity-60 dark:border-green-800 dark:bg-green-900/10"
                          : "border-border hover:border-accent/40 hover:bg-accent/5"
                      }`}
                    >
                      <div
                        className={`flex size-10 items-center justify-center rounded-lg ${
                          isVerified ? v.bgColor : "bg-muted"
                        }`}
                      >
                        <Icon
                          className={`size-5 ${isVerified ? v.color : "text-muted-foreground"}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{v.label} Verification</p>
                        <p className="text-xs text-muted-foreground">
                          {isVerified ? "Verified" : `Verify your ${v.label.toLowerCase()}`}
                        </p>
                      </div>
                      {isVerified && (
                        <BadgeCheck className="size-5 shrink-0 text-green-500" />
                      )}
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

function SouthAfricaFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 900 600"
      className={className}
      role="img"
      aria-label="Flag of South Africa"
    >
      {/* red top / blue bottom */}
      <rect width="900" height="300" fill="#DE3831" />
      <rect y="300" width="900" height="300" fill="#002395" />
      {/* white fimbriation, then green Y (pall) on top */}
      <g fill="none" strokeLinejoin="miter">
        <path
          d="M0,0 L300,300 L900,300 M0,600 L300,300"
          stroke="#fff"
          strokeWidth="180"
        />
        <path
          d="M0,0 L300,300 L900,300 M0,600 L300,300"
          stroke="#007A4D"
          strokeWidth="120"
        />
      </g>
      {/* gold-bordered black triangle at the hoist */}
      <path d="M0,80 L265,300 L0,520 Z" fill="#FFB612" />
      <path d="M0,120 L230,300 L0,480 Z" fill="#000000" />
    </svg>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
  valueNode,
  tone = "light",
}: {
  icon: React.ComponentType<{ className?: string }>
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
