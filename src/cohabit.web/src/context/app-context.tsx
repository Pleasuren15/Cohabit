"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import {
  listingService,
  type FeaturedProfile,
} from "@/services/listing-service"

export interface AppContextValue {
  province: string | null
  setProvince: (province: string) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  favorites: Set<string>
  toggleFavorite: (id: string) => void
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
  initialListings,
}: {
  children: ReactNode
  initialListings: FeaturedProfile[]
}) {
  const [province, setProvince] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("Home")
  const [favorites, setFavorites] = useState<Set<string>>(
    () =>
      new Set([
        "9390dd68-f9e8-4e8f-b3d2-766bd148f410",
        "5a4164c8-3068-4071-b136-adc93397e64d",
        "cc58e6e4-d1b2-4cb6-b27d-55e2f01302f8",
      ])
  )
  const [promotedIds, setPromotedIds] = useState<Set<string>>(() => new Set())
  const [extraListings, setExtraListings] = useState<FeaturedProfile[]>([])

  const allListings = useMemo(
    () => [...initialListings, ...extraListings],
    [initialListings, extraListings]
  )

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

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