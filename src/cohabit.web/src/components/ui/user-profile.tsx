"use client"

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
  Home,
  Venus,
  Mars,
  Pencil,
  Plus,
} from "lucide-react"
import type { FeaturedProfile } from "@/App"
import { MinimalCarousel, type CarouselCard } from "./minimal-carousel"
import { EditProfile, type ProfileData } from "./edit-profile"
import { FileUpload, type FileItem, type FileStatus } from "./file-upload-2"

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
  avatarUrl?: string
  timestamp?: string
}

type VerificationType = "phone" | "email" | "id" | "credit"

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

interface NewListingData {
  name: string
  location: string
  bio: string
  type: "roommate" | "rentals"
}

interface UserProfileProps {
  user: UserData
  userListings: FeaturedProfile[]
  verified: VerificationType[]
  onVerify: (type: VerificationType) => void
  onUpdateUser?: (user: UserData) => void
  onToggleFavorite: (id: string) => void
  onViewListing: (id: string) => void
  onAddListing?: (data: NewListingData) => void
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
}: UserProfileProps) {
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [showNewListing, setShowNewListing] = useState(false)
  const [newListingType, setNewListingType] = useState<"roommate" | "rentals">("roommate")
  const [newListingName, setNewListingName] = useState("")
  const [newListingLocation, setNewListingLocation] = useState("")
  const [newListingBio, setNewListingBio] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([])

  const fullName = `${user.firstName} ${user.lastName}`

  const profileData: ProfileData = {
    fullName,
    email: user.email,
    cellphone: user.cellphone,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    title: user.bio,
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

  const handleNewListing = (e: FormEvent) => {
    e.preventDefault()
    if (!newListingName.trim() || !newListingLocation.trim()) return
    onAddListing?.({
      name: newListingName.trim(),
      location: newListingLocation.trim(),
      bio: newListingBio.trim(),
      type: newListingType,
    })
    setNewListingName("")
    setNewListingLocation("")
    setNewListingBio("")
    setNewListingType("roommate")
    setUploadedFiles([])
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
      avatarUrl: data.avatarUrl || user.avatarUrl,
    }
    onUpdateUser?.(updated)
    setShowEditProfile(false)
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

  const listingCards: CarouselCard[] = userListings.map((p, i) => ({
    id: p.id,
    title: p.name,
    value: p.location,
    color: LISTING_GRADIENTS[i % LISTING_GRADIENTS.length],
    imageSrc: p.imageSrc,
  }))

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
          <button
            type="button"
            onClick={() => setShowEditProfile(true)}
            className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-white"
            aria-label="Edit profile"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
        </div>
      </div>

      {/* User Details Card */}
      <div className="overflow-hidden rounded-2xl border border-border/40 bg-background shadow-sm">
        <div className="flex items-center gap-4 bg-gradient-to-r from-accent/5 to-transparent p-5">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={fullName}
              className="size-14 shrink-0 rounded-full object-cover ring-2 ring-accent/20"
            />
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <User className="size-7" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">{fullName}</h2>
            <p className="text-sm text-muted-foreground">{user.bio}</p>
          </div>
        </div>

        <div className="divide-y divide-border/40 px-5 pb-1">
          <DetailRow icon={Phone} label="Cellphone" value={user.cellphone} />
          <DetailRow icon={Mail} label="Email" value={user.email} />
          <DetailRow icon={Calendar} label="Date of Birth" value={user.dateOfBirth} />
          <DetailRow
            icon={user.gender === "male" ? Mars : Venus}
            label="Gender"
            value={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
          />
          <DetailRow icon={MapPin} label="Location" value="South Africa" />
          <DetailRow icon={Clock} label="Member since" value={user.timestamp || "July 2025"} />
        </div>
      </div>

      {/* Verification Section */}
      <div className="rounded-2xl border border-border/40 bg-background p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-accent" />
            <h3 className="text-sm font-semibold">Verifications</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowVerifyDialog(true)}
            className="rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Verify
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_VERIFICATIONS.map((v) => {
            const isVerified = verified.includes(v.key)
            const Icon = v.icon
            return (
              <span
                key={v.key}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                  isVerified
                    ? `${v.bgColor} ${v.color}`
                    : "bg-muted/50 text-muted-foreground"
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

      {/* My Listings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Home className="size-4 text-accent" />
            <h3 className="text-sm font-semibold">My Listings</h3>
            <span className="text-xs text-muted-foreground">({userListings.length})</span>
          </div>
          <button
            type="button"
            onClick={() => setShowNewListing(true)}
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
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
            You haven't created any listings yet.
          </div>
        )}
      </div>

      {/* New Listing Dialog */}
      <AnimatePresence>
        {showNewListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                <h2 className="text-base font-semibold">New Listing</h2>
                <button
                  type="button"
                  onClick={() => setShowNewListing(false)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleNewListing} className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewListingType("roommate")}
                    className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                      newListingType === "roommate"
                        ? "bg-accent text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Roommate
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewListingType("rentals")}
                    className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                      newListingType === "rentals"
                        ? "bg-accent text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Rentals
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  <input
                    title="Title"
                    value={newListingName}
                    onChange={(e) => setNewListingName(e.target.value)}
                    placeholder="e.g. Cozy room in Sea Point"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Location</label>
                  <input
                    title="Location"
                    value={newListingLocation}
                    onChange={(e) => setNewListingLocation(e.target.value)}
                    placeholder="e.g. Sea Point, Cape Town"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <textarea
                    title="Description"
                    value={newListingBio}
                    onChange={(e) => setNewListingBio(e.target.value)}
                    placeholder="Describe the space or what you're looking for..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>

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

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowNewListing(false); setUploadedFiles([]) }}
                    className="flex-1 rounded-xl bg-muted py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Create
                  </button>
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

      {/* Verify Dialog — centered */}
      <AnimatePresence>
        {showVerifyDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-sm font-medium truncate">{value}</span>
    </div>
  )
}
