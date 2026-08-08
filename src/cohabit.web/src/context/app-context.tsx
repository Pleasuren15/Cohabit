"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

export interface AppContextValue {
  province: string | null
  setProvince: (province: string) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  favorites: Set<string>
  toggleFavorite: (id: string) => void
  favoriteProfiles: FeaturedProfile[]
  promotedIds: Set<string>
  promoteListing: (id: string) => void
  extraListings: FeaturedProfile[]
  addListing: (listing: FeaturedProfile) => void
  allListings: FeaturedProfile[]
  getListingById: (id: string) => Promise<FeaturedProfile | null>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({
  children,
  initialListings = [],
}: {
  children: ReactNode
  initialListings?: FeaturedProfile[]
}) {
  const [province, setProvince] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("Home")
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (!USE_MOCK_DATA) return new Set()
    return new Set([
      "9390dd68-f9e8-4e8f-b3d2-766bd148f410",
      "5a4164c8-3068-4071-b136-adc93397e64d",
      "cc58e6e4-d1b2-4cb6-b27d-55e2f01302f8",
    ])
  })
  const [favoriteProfiles, setFavoriteProfiles] = useState<FeaturedProfile[]>([])
  const [promotedIds, setPromotedIds] = useState<Set<string>>(() => new Set())
  const [extraListings, setExtraListings] = useState<FeaturedProfile[]>([])

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

  const allListings = useMemo(
    () => [...initialListings, ...extraListings],
    [initialListings, extraListings]
  )

  const toggleFavorite = useCallback(
    async (id: string) => {
      const wasFavorited = favorites.has(id)
      setFavorites((prev) => {
        const next = new Set(prev)
        if (wasFavorited) next.delete(id)
        else next.add(id)
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
        toast.error("Couldn't update favorites", {
          description:
            err instanceof Error ? err.message : "Please try again.",
        })
      }
    },
    [favorites]
  )

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

  const addListing = useCallback((listing: FeaturedProfile) => {
    setExtraListings((prev) => [...prev, listing])
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
    favorites,
    toggleFavorite,
    favoriteProfiles,
    promotedIds,
    promoteListing,
    extraListings,
    addListing,
    allListings,
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