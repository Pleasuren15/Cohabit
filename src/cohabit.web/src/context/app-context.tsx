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
import { PROVINCES } from "@/lib/provinces"
import { persistGuestProvince, readGuestProvince } from "@/lib/onboarding"

export interface AppContextValue {
  province: string | null
  setProvince: (province: string) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  currentUserId: string | null
  setCurrentUserId: (id: string | null) => void
  favorites: Set<string>
  toggleFavorite: (id: string) => void
  savedAt: Record<string, number>
  clearFavorites: () => Promise<void>
  favoriteProfiles: FeaturedProfile[]
  promotedIds: Set<string>
  promoteListing: (id: string) => void
  allListings: FeaturedProfile[]
  upsertListing: (listing: FeaturedProfile) => void
  getListingById: (id: string) => Promise<FeaturedProfile | null>
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
  const [promotedIds, setPromotedIds] = useState<Set<string>>(() => new Set())

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

  const promoteListing = useCallback((id: string) => {
    setPromotedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
    toast.success("Listing promoted", {
      description:
        "Your listing is now featured at the top of search results.",
    })
  }, [])

  const getListingById = useCallback(
    (id: string) => listingService.getListingById(id, allListings),
    [allListings]
  )

  const value: AppContextValue = {
    province,
    setProvince,
    activeTab,
    setActiveTab,
    currentUserId,
    setCurrentUserId,
    favorites,
    toggleFavorite,
    savedAt,
    clearFavorites,
    favoriteProfiles,
    promotedIds,
    promoteListing,
    allListings,
    upsertListing,
    getListingById,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- shared context hook
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}