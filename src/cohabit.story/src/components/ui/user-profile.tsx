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
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
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

export type VerificationType = "phone" | "email" | "id" | "credit"

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
  { key: "credit", label: "Credit", icon: Shield, color: "text-amber-500", bgColor: "bg-amber-500/10" },
]

export interface UserProfileProps {
  user: UserData
  userListings: CarouselCard[]
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
      <div className="mb-2 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1 rounded-full bg-primary/80" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Manage your account</p>
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
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium",
                  isVerified ? `${v.bgColor} ${v.color}` : "bg-muted/50 text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {v.label}
                {isVerified && <BadgeCheck className="size-3" />}
              </span>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Home className="size-4 text-accent" />
            <h3 className="text-sm font-semibold">My Listings</h3>
            <span className="text-xs text-muted-foreground">({userListings.length})</span>
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
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium">{value}</span>
    </div>
  )
}
