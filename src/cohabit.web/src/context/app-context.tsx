"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import { USE_MOCK_DATA } from "@/services/config"
import {
  listingService,
  type FeaturedProfile,
} from "@/services/listing-service"
import { favoritesService } from "@/services/favorites-service"
import {
  inquiriesService,
  type Inquiry,
  type InquiryDetails,
  type InquiryStatus,
} from "@/services/inquiries-service"
import {
  reportsService,
  type PropertyReport,
  type ReportDetails,
  type ReportStatus,
} from "@/services/reports-service"
import { PROVINCES } from "@/lib/provinces"
import { persistGuestProvince, readGuestProvince } from "@/lib/onboarding"
import type { UserData } from "@/components/ui/user-profile"

export interface AppContextValue {
  province: string | null
  setProvince: (province: string) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  showAuth: boolean
  setShowAuth: (show: boolean) => void
  currentUser: UserData | null
  setCurrentUser: (user: UserData | null) => void
  currentUserId: string | null
  setCurrentUserId: (id: string | null) => void
  favorites: Set<string>
  toggleFavorite: (id: string) => void
  savedAt: Record<string, number>
  clearFavorites: () => Promise<void>
  favoriteProfiles: FeaturedProfile[]
  promotedIds: Set<string>
  allListings: FeaturedProfile[]
  upsertListing: (listing: FeaturedProfile) => void
  getListingById: (id: string) => Promise<FeaturedProfile | null>
  inquiries: Inquiry[]
  submitInquiry: (details: InquiryDetails) => Promise<Inquiry>
  updateInquiryStatus: (id: string, status: InquiryStatus) => Promise<void>
  reports: PropertyReport[]
  submitReport: (details: ReportDetails) => Promise<PropertyReport>
  updateReportStatus: (id: string, status: ReportStatus) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

const SAVED_AT_KEY = "cohabit:watchlist-saved-at"

function readSavedAt(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SAVED_AT_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch {
    return {}
  }
}

function writeSavedAt(map: Record<string, number>): void {
  try {
    localStorage.setItem(SAVED_AT_KEY, JSON.stringify(map))
  } catch {
    // ignore storage failures
  }
}

export function AppProvider({
  children,
  initialListings = [],
}: {
  children: ReactNode
  initialListings?: FeaturedProfile[]
}) {
  // Restore an opted-out guest's province so the picker doesn't re-ask on load.
  const [province, setProvinceState] = useState<string | null>(() => {
    const stored = readGuestProvince()
    return stored && PROVINCES[stored] ? stored : null
  })
  const [activeTab, setActiveTab] = useState("Home")
  const [showAuth, setShowAuth] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Remember the province for opted-out guests so future visits skip the picker.
  const setProvince = useCallback((value: string) => {
    setProvinceState(value)
    persistGuestProvince(value)
  }, [])
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (!USE_MOCK_DATA) return new Set()
    return new Set([
      "9390dd68-f9e8-4e8f-b3d2-766bd148f410",
      "5a4164c8-3068-4071-b136-adc93397e64d",
      "cc58e6e4-d1b2-4cb6-b27d-55e2f01302f8",
    ])
  })
  const [savedAt, setSavedAt] = useState<Record<string, number>>(() => {
    if (USE_MOCK_DATA) {
      const now = Date.now()
      const day = 86_400_000
      return {
        "9390dd68-f9e8-4e8f-b3d2-766bd148f410": now - 2 * day,
        "5a4164c8-3068-4071-b136-adc93397e64d": now - 10 * day,
        "cc58e6e4-d1b2-4cb6-b27d-55e2f01302f8": now - 10 * day,
      }
    }
    return readSavedAt()
  })
  const [favoriteProfiles, setFavoriteProfiles] = useState<FeaturedProfile[]>([])
  const [promotedIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (USE_MOCK_DATA) return
    let cancelled = false
    favoritesService
      .loadFavorites()
      .then((profiles) => {
        if (cancelled) return
        setFavoriteProfiles(profiles)
        setFavorites(new Set(profiles.map((p) => p.id)))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        console.error("Failed to load favorites", err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const [allListings, setAllListings] =
    useState<FeaturedProfile[]>(initialListings)

  // Keep created listings discoverable so a redirect to the detail page
  // (e.g. right after adding a property) resolves in both mock and API mode.
  const upsertListing = useCallback((listing: FeaturedProfile) => {
    setAllListings((prev) => [
      listing,
      ...prev.filter((p) => p.id !== listing.id),
    ])
  }, [])

  const toggleFavorite = useCallback(
    async (id: string) => {
      const wasFavorited = favorites.has(id)
      const prevSavedAt = savedAt[id]
      setFavorites((prev) => {
        const next = new Set(prev)
        if (wasFavorited) next.delete(id)
        else next.add(id)
        return next
      })
      setSavedAt((prev) => {
        const next = { ...prev }
        if (wasFavorited) delete next[id]
        else next[id] = Date.now()
        writeSavedAt(next)
        return next
      })

      if (USE_MOCK_DATA) return

      try {
        if (wasFavorited) await favoritesService.removeFavorite(id)
        else await favoritesService.addFavorite(id)
        const profiles = await favoritesService.loadFavorites()
        setFavoriteProfiles(profiles)
        setFavorites(new Set(profiles.map((p) => p.id)))
      } catch (err) {
        setFavorites((prev) => {
          const next = new Set(prev)
          if (wasFavorited) next.add(id)
          else next.delete(id)
          return next
        })
        setSavedAt((prev) => {
          const next = { ...prev }
          if (wasFavorited) next[id] = prevSavedAt ?? Date.now()
          else delete next[id]
          writeSavedAt(next)
          return next
        })
        toast.error("Couldn't update favorites", {
          description:
            err instanceof Error ? err.message : "Please try again.",
        })
      }
    },
    [favorites, savedAt]
  )

  const clearFavorites = useCallback(async () => {
    try {
      if (!USE_MOCK_DATA) {
        await Promise.all(
          Array.from(favorites).map((id) => favoritesService.removeFavorite(id))
        )
      }
      setFavorites(new Set())
      setSavedAt({})
      writeSavedAt({})
      setFavoriteProfiles([])
      toast.success("WatchList cleared", {
        description: "Your WatchList is now empty.",
      })
    } catch (err) {
      toast.error("Couldn't clear WatchList", {
        description:
          err instanceof Error ? err.message : "Please try again.",
      })
    }
  }, [favorites])

  const getListingById = useCallback(
    (id: string) => listingService.getListingById(id, allListings),
    [allListings]
  )

  const [inquiries, setInquiries] = useState<Inquiry[]>([])

  useEffect(() => {
    let cancelled = false
    inquiriesService
      .loadInquiries()
      .then((items) => {
        if (cancelled) return
        setInquiries(items)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        console.error("Failed to load inquiries", err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const submitInquiry = useCallback(async (details: InquiryDetails) => {
    const created = await inquiriesService.submitInquiry(details)
    setInquiries((prev) => [created, ...prev])
    return created
  }, [])

  const updateInquiryStatus = useCallback(
    async (id: string, status: InquiryStatus) => {
      await inquiriesService.updateStatus(id, status)
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status } : i))
      )
    },
    []
  )

  const [reports, setReports] = useState<PropertyReport[]>([])

  useEffect(() => {
    let cancelled = false
    reportsService
      .loadReports()
      .then((items) => {
        if (cancelled) return
        setReports(items)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        console.error("Failed to load reports", err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const submitReport = useCallback(async (details: ReportDetails) => {
    const created = await reportsService.submitReport(details)
    setReports((prev) => [created, ...prev])
    return created
  }, [])

  const updateReportStatus = useCallback(
    async (id: string, status: ReportStatus) => {
      await reportsService.updateStatus(id, status)
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      )
    },
    []
  )

  const value: AppContextValue = {
    province,
    setProvince,
    activeTab,
    setActiveTab,
    showAuth,
    setShowAuth,
    currentUser,
    setCurrentUser,
    currentUserId,
    setCurrentUserId,
    favorites,
    toggleFavorite,
    savedAt,
    clearFavorites,
    favoriteProfiles,
    promotedIds,
    allListings,
    upsertListing,
    getListingById,
    inquiries,
    submitInquiry,
    updateInquiryStatus,
    reports,
    submitReport,
    updateReportStatus,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- shared context hook
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}