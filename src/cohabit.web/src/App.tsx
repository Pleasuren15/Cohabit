import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { GlassDock, type DockItem } from "@/components/ui/glass-dock"
import {
  Home,
  Heart,
  MessageSquare,
  Info,
  BadgeCheck,
  Wallet,
  User,
  X,
  Smartphone,
  Shield,
  ScrollText,
  Handshake,
  Scale,
  Mail,
  Search,
  BarChart3,
  ShieldCheck,
  Flag,
  Lock,
  AlertTriangle,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react"
import { FlipText } from "@/components/ui/flip-text"
import Select33 from "@/components/ui/select-33"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"
import MeshBackground from "@/components/MeshBackground"
import { ListingFilter } from "@/components/listing-filter"
import { PROVINCE_SHAPES } from "@/lib/province-shapes"
import { PROVINCES } from "@/lib/provinces"
import { cn } from "@/lib/utils"
import { FamilyReceiveComponent } from "@/components/ui/family-receive-component"
import { Auth3 } from "@/components/ui/auth-03"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Faq6, type FaqItem } from "@/components/ui/faq-06"
import { PinItemComponent, type PlaceItem } from "@/components/ui/pin-item"
import { ExpandableProfileCard } from "@/components/ui/expandable-profile-card"
import { DetailPage } from "@/components/ui/detail-page"
import { ErrorOne } from "@/components/ui/error-1"
import {
  MinimalCarousel,
  type CarouselCard,
} from "@/components/ui/minimal-carousel"
import {
  UserProfile,
  type NewListingData,
  type UserData,
} from "@/components/ui/user-profile"
import { OnboardingDialog } from "@/components/ui/onboarding-dialog"
import StatsCounter from "@/components/ui/stats-counter"
import { Toaster, toast } from "sonner"
import {
  FEATURED_PROFILES,
  listingService,
  toIsoAvailableFrom,
  typeToId,
  type FeaturedProfile,
  type ListingMutationInput,
  type ListingQuery,
  type VerificationType,
} from "@/services/listing-service"
import { USE_MOCK_DATA } from "@/services/config"
import { DEMO_USER_ID } from "@/services/favorites-service"
import { userService } from "@/services/user-service"
import {
  MOCK_MESSAGES,
  groupMessages,
  messagesService,
  type MessageThread,
  type SystemMessageDto,
} from "@/services/messages-service"
import { Routes, Route, useNavigate, useParams } from "react-router-dom"
import { AppProvider, useApp } from "@/context/app-context"

export { FEATURED_PROFILES }
export type { FeaturedProfile, VerificationType }

const MOCK_USER: UserData = {
  id: "user-1",
  firstName: "Thabo",
  lastName: "Mokoena",
  cellphone: "+27 82 123 4567",
  email: "thabo.m@example.com",
  dateOfBirth: "1994-05-12",
  gender: "male",
  bio: "Creative graphic designer looking for a shared space.",
  isOtpVerified: true,
  avatarUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=200&h=200",
  timestamp: "June 2025",
}

const COHABIT_PHRASES = ["Find Your Match", "Share Your Space", "Live Together"]

const LANDING_BADGES: { label: string; icon: LucideIcon }[] = [
  { label: "Verified hosts", icon: BadgeCheck },
  { label: "Split the rent", icon: Wallet },
]

const TERMS = [
  {
    heading: "1. Acceptance of terms",
    body: "By creating an account or browsing Cohabit, you agree to these terms. If you do not agree, please do not use the service.",
  },
  {
    heading: "2. Listings & bookings",
    body: "Cohabit connects people looking to share living spaces. We verify hosts where possible but are not a party to any rental agreement between members.",
  },
  {
    heading: "3. Payments",
    body: "Any rent, deposits, or fees are arranged directly between members. Cohabit does not hold funds and is not responsible for payment disputes.",
  },
  {
    heading: "4. Conduct",
    body: "Members must provide accurate information and treat one another with respect. Fraudulent listings or harassment will result in removal.",
  },
  {
    heading: "5. Liability",
    body: "Cohabit is provided “as is”. We are not liable for the actions of members or the condition of any listed property.",
  },
]

const HOUSING_FAQS: FaqItem[] = [
  {
    id: "verify",
    question: "How do I verify a potential roommate?",
    answer:
      "We recommend scheduling a video call first, meeting in a public place, and asking for references. Cohabit verifies hosts where possible, but always trust your instincts.",
  },
  {
    id: "deposit",
    question: "How do deposits and rent payments work?",
    answer:
      "Payments are arranged directly between members. Most listings require a first-month rent plus a deposit (typically 1–2 months). Always get a written receipt and agreement before transferring money.",
  },
  {
    id: "lease",
    question: "Do I need a formal lease agreement?",
    answer:
      "Yes, it's strongly recommended. Even a simple written agreement protects both parties. It should cover rent amount, payment dates, deposit terms, notice period, and house rules.",
  },
  {
    id: "inspection",
    question: "Should I inspect the property before moving in?",
    answer:
      "Absolutely. Visit the property in person or arrange a virtual tour. Check the condition of furniture, appliances, plumbing, and Wi-Fi. Take photos of any existing damage for your records.",
  },
  {
    id: "bills",
    question: "How are shared bills (utilities, Wi-Fi) handled?",
    answer:
      "Discuss upfront how bills will be split — equally or by usage. Many housemates use a shared budgeting app or spreadsheet. Include bill-splitting terms in your written agreement.",
  },
  {
    id: "notice",
    question: "What is the typical notice period?",
    answer:
      "Most informal arrangements require 1 month notice. Check your lease or agreement. If you're on a month-to-month arrangement, communicate early and put your notice in writing.",
  },
]

/** Relative label used for the message date column ("Today", "Yesterday", "Jul 20"). */
function formatMessageDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86400000)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

/** Day divider label used inside a thread ("Today", "Yesterday", "Wed, Aug 5"). */
function messageDay(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86400000)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
}

/** Inline SVG of the South African flag (emoji flags don't render on Windows). */
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

const WATCHLIST_GRADIENTS = [
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

/** Shared full-bleed backdrop: MeshBackground + legibility scrim + decorative province shapes. */
function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-svh w-full">
      {/* Mesh-gradient background */}
      <MeshBackground />

      {/* Scrim to keep text legible over the gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/20" />

      {/* Decorative province shapes */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none">
        {Object.values(PROVINCE_SHAPES)
          .slice(0, 4)
          .map((src, i) => (
            <motion.img
              key={i}
              src={src}
              alt=""
              aria-hidden="true"
              className="absolute h-48 w-48 object-contain opacity-[0.03] sm:h-64 sm:w-64"
              style={{
                left: i < 2 ? "-8%" : "auto",
                right: i >= 2 ? "-8%" : "auto",
                top: i % 2 === 0 ? "5%" : "auto",
                bottom: i % 2 === 1 ? "10%" : "auto",
              }}
            />
          ))}
      </div>

      <div className="relative z-10 flex min-h-svh flex-col">{children}</div>
    </div>
  )
}

/** Landing page shell: AppShell backdrop + branding header/footer */
function LandingShell({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <header className="flex items-center justify-between px-6 pt-5 sm:pt-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-accent lowercase">
            cohabit
          </span>
          <span className="hidden text-xs text-muted-foreground/50 sm:inline">
            —
          </span>
          <span className="hidden text-xs text-muted-foreground/60 sm:inline">
            shared living, made simple
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background/40 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <SouthAfricaFlag className="h-3 w-auto rounded-[1px] ring-1 ring-black/10" />
          South Africa
        </span>
      </header>

      {children}

      <footer className="px-6 pb-6 text-center text-xs text-muted-foreground/50">
        © 2026 <span className="text-accent">Cohabit</span>
      </footer>
    </AppShell>
  )
}

/** Full-screen landing before the user enters the app */
function LandingPage({ onEnter }: { onEnter: (province: string) => void }) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % COHABIT_PHRASES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  /** Step 2: province selected, confirm before entering */
  if (selectedProvince) {
    return (
      <LandingShell>
        <main className="flex flex-1 flex-col items-center justify-center px-6">
          <FamilyReceiveComponent
            defaultOpen
            title={PROVINCES[selectedProvince]}
            description={`Start browsing shared living spaces in ${PROVINCES[selectedProvince]}?`}
            confirmLabel="Let's Go"
            cancelLabel="Change"
            icon={
              <img
                src={PROVINCE_SHAPES[selectedProvince]}
                alt={PROVINCES[selectedProvince]}
                className="h-10 w-10 object-contain"
              />
            }
            onConfirm={() => onEnter(selectedProvince)}
            onCancel={() => setSelectedProvince(null)}
          />
        </main>
      </LandingShell>
    )
  }

  /** Step 1: select a province */
  return (
    <LandingShell>
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8">
          {/* Hero */}
          <div className="space-y-3">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] text-accent uppercase">
              Find your space
            </span>
            <FlipText
              key={phraseIndex}
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              duration={1.8}
              loop={false}
            >
              {COHABIT_PHRASES[phraseIndex]}
            </FlipText>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-balance text-muted-foreground">
              Browse shared homes and compatible housemates across South Africa.
            </p>
          </div>

          {/* Province picker card */}
          <div className="w-full rounded-3xl border border-border/40 bg-background/40 p-6 shadow-sm backdrop-blur-xl sm:p-8">
            <div className="mb-5 space-y-1 text-center">
              <h2 className="text-sm font-semibold text-foreground">
                Get Started
              </h2>
              <p className="text-xs text-muted-foreground">
                Choose your province to browse listings
              </p>
            </div>
            <Select33 onProvinceChange={setSelectedProvince} />
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3">
            {LANDING_BADGES.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/30 bg-background/20 px-3 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur-sm"
              >
                <Icon className="size-3.5 text-accent" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </main>
    </LandingShell>
  )
}

/** Clean, professional page header — consistent across all tabs */
function PageHeader({
  icon: Icon,
  title,
  subtitle,
  iconClassName,
}: {
  icon: LucideIcon
  title: ReactNode
  subtitle?: ReactNode
  iconClassName?: string
}) {
  return (
    <div className="mb-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-primary/80" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <Icon
          className={cn("size-5 shrink-0 text-muted-foreground", iconClassName)}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

/** Main app shell with dock navbar */
function MainApp({
  province,
  setShowAuth,
  currentUser,
  setCurrentUser,
}: {
  province: string
  setShowAuth: (show: boolean) => void
  currentUser: UserData | null
  setCurrentUser: (user: UserData | null) => void
}) {
  const navigate = useNavigate()
  const {
    setProvince,
    activeTab,
    setActiveTab,
    favorites,
    toggleFavorite,
    favoriteProfiles,
    promotedIds,
    allListings,
  } = useApp()
  const [listingFilter, setListingFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [userVerified, setUserVerified] = useState<VerificationType[]>(["phone", "email"])
  const [showProvincePicker, setShowProvincePicker] = useState(false)
  const [messages, setMessages] = useState<SystemMessageDto[]>([])
  const [userListings, setUserListings] = useState<FeaturedProfile[]>([])

  const handleUpdateUser = useCallback(
    async (updated: UserData) => {
      try {
        const saved = await userService.updateUser(updated)
        setCurrentUser(saved)
        toast.success("Profile updated", {
          description: "Your profile has been saved.",
        })
      } catch (err) {
        toast.error("Couldn't update profile", {
          description:
            err instanceof Error ? err.message : "Please try again.",
        })
        throw err
      }
    },
    [setCurrentUser]
  )

  // Load the signed-in user's own listings whenever the identity changes.
  useEffect(() => {
    if (!currentUser) return
    let cancelled = false
    listingService
      .getUserListings(currentUser.id, allListings)
      .then((items) => {
        if (cancelled) return
        setUserListings(items)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        console.error("Failed to load your listings", err)
      })
    return () => {
      cancelled = true
    }
  }, [currentUser, allListings])

  const buildListingInput = useCallback(
    async (data: NewListingData): Promise<ListingMutationInput> => {
      const provinceId =
        (await listingService.resolveProvinceId(province)) ?? 1
      return {
        title: data.name,
        description: data.bio,
        typeId: typeToId(data.type),
        price: data.price,
        deposit: data.deposit,
        beds: data.beds,
        baths: data.baths,
        availableFrom: toIsoAvailableFrom(data.availableFrom),
        responseTime: "Within the hour",
        addressLine1: data.address,
        addressLine2: "",
        suburb: data.location,
        postalCode: "",
        provinceId,
        amenityIds: data.amenityIds,
        ruleIds: data.ruleIds,
      }
    },
    [province]
  )

  const handleAddListing = useCallback(
    async (data: NewListingData) => {
      if (!currentUser) return
      try {
        const input = await buildListingInput(data)
        const created = await listingService.createListing(
          currentUser.id,
          input,
          data.files
        )
        setUserListings((prev) => [
          created,
          ...prev.filter((p) => p.id !== created.id),
        ])
        toast.success("Listing created", {
          description: `${created.title ?? created.name} is now live.`,
        })
      } catch (err) {
        toast.error("Couldn't create listing", {
          description: err instanceof Error ? err.message : "Please try again.",
        })
        throw err
      }
    },
    [currentUser, buildListingInput]
  )

  const handleUpdateListing = useCallback(
    async (listingId: string, data: NewListingData) => {
      if (!currentUser) return
      try {
        const input = await buildListingInput(data)
        const updated = await listingService.updateListing(
          currentUser.id,
          listingId,
          input
        )
        setUserListings((prev) => [
          updated,
          ...prev.filter((p) => p.id !== updated.id),
        ])
        toast.success("Listing updated", {
          description: "Your changes have been saved.",
        })
      } catch (err) {
        toast.error("Couldn't update listing", {
          description: err instanceof Error ? err.message : "Please try again.",
        })
        throw err
      }
    },
    [currentUser, buildListingInput]
  )

  useEffect(() => {
    let cancelled = false
    messagesService
      .loadMessages()
      .then((items) => {
        if (cancelled) return
        setMessages(items.length > 0 ? items : MOCK_MESSAGES)
      })
      .catch(() => {
        if (cancelled) return
        setMessages(MOCK_MESSAGES)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const messageGroups = useMemo(() => groupMessages(messages), [messages])

  const messageThreads: PlaceItem[] = useMemo(
    () =>
      messageGroups.map((thread, index) => ({
        id: index,
        name: thread.name,
        type: formatMessageDate(thread.latestTimestamp),
        status: thread.messages[thread.messages.length - 1].content,
        pinned: false,
        unread: thread.unreadCount > 0,
      })),
    [messageGroups]
  )

  const messageTotal = messageGroups.length
  const messageUnread = messageGroups.reduce(
    (sum, t) => sum + t.unreadCount,
    0
  )

  const openMessageThread = useCallback(
    (id: number) => {
      const thread = messageGroups[id]
      if (thread) navigate(`/messages/${thread.conversationId}`)
    },
    [messageGroups, navigate]
  )

  const isFeatured = useCallback(
    (p: FeaturedProfile) => p.featured === true || promotedIds.has(p.id),
    [promotedIds]
  )

  // Pagination: grow the page size on "Load more".
  const PAGE_SIZE = 5
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [result, setResult] = useState<{
    listings: FeaturedProfile[]
    totalCount: number
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    listingService
      .getListings(
        {
          province,
          type: listingFilter as ListingQuery["type"],
          q: searchQuery,
          page: 1,
          pageSize,
          promotedIds,
        },
        allListings
      )
      .then((res) => {
        if (cancelled) return
        setResult({ listings: res.items, totalCount: res.totalCount })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        console.error("Failed to load listings", err)
        setResult({ listings: [], totalCount: 0 })
      })
    return () => {
      cancelled = true
    }
  }, [province, listingFilter, searchQuery, pageSize, promotedIds, allListings])

  const listings = result?.listings ?? []
  const totalCount = result?.totalCount ?? 0
  const profilesLoading = result === null

  const handleViewListing = (id: string) => {
    navigate(`/listing/${id}`)
  }

  const watchlistCards: CarouselCard[] = useMemo(
    () =>
      (USE_MOCK_DATA ? allListings : favoriteProfiles)
        .filter((p) => favorites.has(p.id))
        .map((p, i) => ({
          id: p.id,
          title: p.name,
          value: p.location,
          color: WATCHLIST_GRADIENTS[i % WATCHLIST_GRADIENTS.length],
          imageSrc: p.imageSrc,
        })),
    [allListings, favorites, favoriteProfiles]
  )

  const dockItems: DockItem[] = [
    {
      title: "Home",
      icon: Home,
      onClick: () => setActiveTab("Home"),
    },
    {
      title: "WatchList",
      icon: Heart,
      onClick: () => setActiveTab("WatchList"),
      badge: favorites.size > 5 ? "5+" : favorites.size,
    },
    {
      title: "Messages",
      icon: MessageSquare,
      onClick: () => setActiveTab("Messages"),
      badge: messageTotal,
    },
    {
      title: "Info",
      icon: Info,
      onClick: () => setActiveTab("Info"),
    },
    {
      title: currentUser ? "Profile" : "Account",
      icon: User,
      onClick: () => {
        if (currentUser) {
          setActiveTab("Profile")
        } else {
          setShowAuth(true)
        }
      },
    },
  ]

  return (
    <>
      {/* Fixed top bar: filter + search — home page only */}
      {activeTab === "Home" && (
        <div className="fixed top-0 right-0 left-0 z-30 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="mx-auto max-w-md space-y-3 px-6 pt-6 pb-3">
            {/* Filter + province at very top */}
            <div className="flex items-center justify-between">
              <ListingFilter
                value={listingFilter}
                onChange={setListingFilter}
              />
              <button
                type="button"
                onClick={() => setShowProvincePicker(true)}
                className="flex flex-col items-center gap-0.5 rounded-full bg-background/40 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-opacity hover:opacity-80"
                aria-label="Change province"
              >
                <img
                  src={PROVINCE_SHAPES[province]}
                  alt=""
                  className="h-5 w-5 object-contain drop-shadow-sm"
                />
                <span className="leading-tight">{PROVINCES[province]}</span>
              </button>
            </div>

            {/* Search bar below filter */}
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2.5">
                  <Search className="size-3.5 text-muted-foreground" />
                </div>
                <input
                  type="search"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-background p-2 ps-8 text-xs text-foreground shadow-sm placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
                  placeholder="Search apartments, areas..."
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute top-1/2 end-16 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
                <button
                  type="submit"
                  className="absolute end-1 bottom-1 rounded-md border border-transparent bg-accent px-2.5 py-1 text-[10px] leading-4 font-medium text-white shadow-sm transition-colors hover:bg-accent/90 focus:ring-2 focus:ring-accent/30 focus:outline-none"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AppShell>
        <main
          className={`flex-1 overflow-y-auto px-6 pb-28 ${activeTab === "Home" ? "pt-40" : "pt-6"}`}
        >
          <div className="mx-auto max-w-md">
            {activeTab === "Home" && (
              <>
                {/* No results state */}
                {!profilesLoading && listings.length === 0 && (
                  <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-muted/50">
                      <Search className="size-6 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      No matching listings
                    </h3>
                    <p className="mx-auto max-w-[240px] text-sm leading-relaxed text-muted-foreground">
                      Try a different search term, filter, or province.
                    </p>
                  </div>
                )}

                {/* Featured profiles */}
                <div className="w-full space-y-3 text-left">
                  {(profilesLoading
                    ? Array.from({ length: pageSize })
                    : listings
                  ).map((item, i) =>
                    profilesLoading ? (
                      <div
                        key={i}
                        className="w-full overflow-hidden rounded-xl border border-border/40 bg-background shadow-sm"
                      >
                        <div className="h-32 animate-pulse bg-muted sm:h-40" />
                        <div className="space-y-2.5 px-4 pt-3 pb-4">
                          <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
                          <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
                          <div className="flex gap-2">
                            <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
                            <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ExpandableProfileCard
                        key={(item as FeaturedProfile).id}
                        id={(item as FeaturedProfile).id}
                        imageSrc={(item as FeaturedProfile).imageSrc}
                        name={(item as FeaturedProfile).name}
                        location={(item as FeaturedProfile).location}
                        bio={(item as FeaturedProfile).bio}
                        mapAddress={(item as FeaturedProfile).mapAddress}
                        photoCount={(item as FeaturedProfile).photoCount}
                        verified={(item as FeaturedProfile).verified}
                        price={(item as FeaturedProfile).price}
                        featured={isFeatured(item as FeaturedProfile)}
                        isFavorited={favorites.has(
                          (item as FeaturedProfile).id
                        )}
                        onToggleFavorite={toggleFavorite}
                        onView={handleViewListing}
                      />
                    )
                  )}
                </div>

                {/* Load more */}
                {!profilesLoading && listings.length < totalCount && (
                  <button
                    type="button"
                    onClick={() => setPageSize((p) => p + PAGE_SIZE)}
                    className="mx-auto mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-muted"
                  >
                    Load more ({totalCount - listings.length} remaining)
                  </button>
                )}
              </>
            )}

            {activeTab === "WatchList" && (
              <PageHeader
                icon={Heart}
                title="WatchList"
                iconClassName={
                  watchlistCards.length > 0 ? "fill-red-500 text-red-500" : ""
                }
              />
            )}

            {activeTab === "Messages" && (
              <div className="flex flex-col items-center">
                <PageHeader
                  icon={MessageSquare}
                  title="Messages"
                  subtitle={`${messageTotal} threads · ${messageUnread} unread`}
                />
                <PinItemComponent
                  items={messageThreads}
                  onOpen={openMessageThread}
                  pinnedLabel="Pinned"
                  allLabel="All Messages"
                />
              </div>
            )}

            {activeTab === "Info" && (
              <div className="flex flex-col items-center gap-5">
                {/* Band 1 — Trust & Safety + Verification */}
                <section className="w-full bg-muted/20 px-5 py-5 sm:px-6">
                  <div className="flex flex-col items-center">
                    <div className="w-full">
                      <PageHeader
                        icon={ShieldCheck}
                        title="Trust & Safety Hub"
                        subtitle={<>How we keep <span className="text-accent">Cohabit</span> a safe place to find your housemate.</>}
                      />
                    </div>

                    <div className="grid w-full gap-3 sm:grid-cols-2">
                      {[
                        {
                          icon: BadgeCheck,
                          title: "Verified identities",
                          body: "Phone, email, ID and credit checks confirm who you are dealing with. Every profile carries visible verification badges.",
                        },
                        {
                          icon: Flag,
                          title: "Report & block",
                          body: "Spot something off? Report a listing or profile and block any member. Our team reviews every report within 24 hours.",
                        },
                        {
                          icon: Lock,
                          title: "Private by default",
                          body: "Your personal details stay hidden until you choose to share them. Never share bank details or IDs on this platform.",
                        },
                        {
                          icon: AlertTriangle,
                          title: "Stay safe",
                          body: "Meet in public, view the property first, and never pay deposits before signing a lease. Trust your instincts.",
                        },
                      ].map((item) => {
                        const IconComponent = item.icon
                        return (
                          <div
                            key={item.title}
                            className="bg-background/70 p-5"
                          >
                            <div className="mb-2 flex items-center gap-3">
                              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                                <IconComponent className="size-4" />
                              </span>
                              <h2 className="font-semibold text-foreground">
                                {item.title}
                              </h2>
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {item.body}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col items-center">
                    <div className="w-full">
                      <PageHeader
                        icon={Shield}
                        title="Verification Badges"
                        subtitle="Build trust in the community."
                      />
                    </div>

                    <div className="w-full">
                      <Tabs defaultValue="phone" className="gap-4">
                        <TabsList className="bg-transparent">
                          <TabsTrigger
                            value="phone"
                            className="flex-1 rounded-full px-4 py-1 text-[11px] uppercase transition-all data-[state=active]:bg-blue-500 data-[state=active]:!text-white"
                          >
                            <Smartphone className="mr-1 size-3.5" />
                            Phone
                          </TabsTrigger>
                          <TabsTrigger
                            value="email"
                            className="flex-1 rounded-full px-4 py-1 text-[11px] uppercase transition-all data-[state=active]:bg-purple-500 data-[state=active]:!text-white"
                          >
                            <Mail className="mr-1 size-3.5" />
                            Email
                          </TabsTrigger>
                          <TabsTrigger
                            value="id"
                            className="flex-1 rounded-full px-4 py-1 text-[11px] uppercase transition-all data-[state=active]:bg-green-500 data-[state=active]:!text-white"
                          >
                            <BadgeCheck className="mr-1 size-3.5" />
                            ID
                          </TabsTrigger>
                          <TabsTrigger
                            value="credit"
                            className="flex-1 rounded-full px-4 py-1 text-[11px] uppercase transition-all data-[state=active]:bg-amber-500 data-[state=active]:!text-white"
                          >
                            <Shield className="mr-1 size-3.5" />
                            Credit
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent
                          value="phone"
                          className="mt-0 border-2 border-dashed border-blue-200 bg-blue-50/50 p-6"
                        >
                          <h5 className="mb-4 text-2xl font-black tracking-tight text-blue-800">
                            Phone
                          </h5>
                          <p className="border-l-2 border-blue-500 pl-4 text-sm leading-6 text-blue-700/80">
                            Confirm your phone via OTP to{" "}
                            <span className="font-semibold text-blue-900">
                              verify your identity
                            </span>
                            . Fastest way to build trust.
                          </p>
                        </TabsContent>

                        <TabsContent
                          value="email"
                          className="mt-0 border-2 border-dashed border-purple-200 bg-purple-50/50 p-6"
                        >
                          <h5 className="mb-4 text-2xl font-black tracking-tight text-purple-800">
                            Email
                          </h5>
                          <p className="border-l-2 border-purple-500 pl-4 text-sm leading-6 text-purple-700/80">
                            Verify your email address to{" "}
                            <span className="font-semibold text-purple-900">
                              receive important updates
                            </span>{" "}
                            and confirm your account ownership.
                          </p>
                        </TabsContent>

                        <TabsContent
                          value="id"
                          className="mt-0 border-2 border-dashed border-green-200 bg-green-50/50 p-6"
                        >
                          <h5 className="mb-4 text-2xl font-black tracking-tight text-green-800">
                            ID
                          </h5>
                          <p className="border-l-2 border-green-500 pl-4 text-sm leading-6 text-green-700/80">
                            Upload your SA ID or passport for{" "}
                            <span className="font-semibold text-green-900">
                              official verification
                            </span>
                            . Encrypted and never shared publicly.
                          </p>
                        </TabsContent>

                        <TabsContent
                          value="credit"
                          className="mt-0 border-2 border-dashed border-amber-200 bg-amber-50/50 p-6"
                        >
                          <h5 className="mb-4 text-2xl font-black tracking-tight text-amber-800">
                            Credit
                          </h5>
                          <p className="border-l-2 border-amber-500 pl-4 text-sm leading-6 text-amber-700/80">
                            Complete a{" "}
                            <span className="font-semibold text-amber-900">
                              financial responsibility check
                            </span>{" "}
                            to unlock priority listings.
                          </p>
                        </TabsContent>
                      </Tabs>

                      <p className="mt-4 text-center text-xs text-muted-foreground">
                        More badges = more trust.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Band 2 — Stats */}
                <section className="w-full bg-accent/5 px-5 py-5 sm:px-6">
                  <div className="w-full">
                    <PageHeader
                      icon={BarChart3}
                      title={<><span className="text-accent">Cohabit</span> by the numbers</>}
                      subtitle="A growing community of trusted housemates."
                    />
                  </div>

                  <div className="grid w-full grid-cols-3 gap-3">
                    {[
                      { value: 1200, suffix: "+", label: "Verified members" },
                      { value: 9, suffix: "", label: "Provinces covered" },
                      { value: 4, suffix: "", label: "Verification levels" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex flex-col items-center justify-center bg-background/70 p-5 text-center"
                      >
                        <StatsCounter
                          value={stat.value}
                          suffix={stat.suffix}
                          className="text-3xl font-black tracking-tight text-foreground"
                        />
                        <span className="mt-1 text-xs text-muted-foreground">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Band 3 — FAQ */}
                <section className="w-full px-1">
                  <Faq6
                    badge="FAQ"
                    title="Frequently Asked Questions"
                    faqs={HOUSING_FAQS}
                  />
                </section>

                {/* Band 4 — Terms & Conditions */}
                <section className="w-full bg-muted/20 px-5 py-5 sm:px-6">
                  <div className="w-full">
                    <PageHeader
                      icon={ScrollText}
                      title="Terms & Conditions"
                      subtitle="Last updated 21 July 2026"
                    />
                  </div>

                  <div className="w-full space-y-3">
                    {TERMS.map((section, i) => {
                      const icons = [ScrollText, Home, Wallet, Handshake, Scale]
                      const IconComponent = icons[i] ?? ScrollText
                      return (
                        <div
                          key={section.heading}
                          className="bg-background/70 p-5"
                        >
                          <div className="mb-2 flex items-center gap-3">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <IconComponent className="size-4" />
                            </span>
                            <h2 className="font-semibold text-foreground">
                              {section.heading.replace(/^\d+\.\s*/, "")}
                            </h2>
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {section.body}
                          </p>
                        </div>
                      )
                    })}
                    <div className="bg-background/70 p-5">
                      <p className="text-xs text-muted-foreground">
                        Questions? Contact us at{" "}
                        <span className="font-medium text-accent">
                          hello@cohabit.co.za
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "Profile" && currentUser && (
              <UserProfile
                user={currentUser}
                userListings={userListings}
                verified={userVerified}
                onVerify={(type) => {
                  if (!userVerified.includes(type)) {
                    setUserVerified((prev) => [...prev, type])
                  }
                }}
                onUpdateUser={handleUpdateUser}
                onToggleFavorite={toggleFavorite}
                onViewListing={handleViewListing}
                onAddListing={handleAddListing}
                onUpdateListing={handleUpdateListing}
                getListingDetail={(id) =>
                  listingService.getListingById(id, allListings)
                }
              />
            )}
          </div>

          {/* WatchList carousel — full width, outside max-w-md */}
          {activeTab === "WatchList" && watchlistCards.length > 0 && (
            <MinimalCarousel
              cards={watchlistCards}
              onFavoriteToggle={(card) => {
                toggleFavorite(card.id)
              }}
              onViewListing={(card) => handleViewListing(card.id)}
            />
          )}

          {/* WatchList empty state */}
          {activeTab === "WatchList" && watchlistCards.length === 0 && (
            <div className="mx-auto w-full max-w-md">
              <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted/50">
                  <Heart className="size-7 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">
                    Your WatchList is empty
                  </h3>
                  <p className="mx-auto max-w-[240px] text-sm leading-relaxed text-muted-foreground">
                    Browse profiles on the{" "}
                    <span className="font-medium text-accent">Home</span> tab
                    and tap the{" "}
                    <Heart className="inline size-3.5 align-text-top text-muted-foreground" />{" "}
                    icon to save your favorites here.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </AppShell>

      {/* Fixed bottom dock — mobile-first */}
      <div className="fixed right-0 bottom-0 left-0 z-30 flex justify-center">
        <div className="w-full max-w-md">
          <GlassDock
            items={dockItems}
            activeTitle={activeTab}
            showLabels
            className="w-full"
            dockClassName="rounded-none bg-background/95 border-t border-border gap-2 px-3 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
          />
        </div>
      </div>

      {/* Province picker overlay */}
      <AnimatePresence>
        {showProvincePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setShowProvincePicker(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md rounded-t-2xl border border-border bg-background p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">Select Province</h2>
                <button
                  type="button"
                  onClick={() => setShowProvincePicker(false)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Province grid */}
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(PROVINCES).map(([key, name]) => {
                  const isActive = key === province
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setProvince(key)
                        setShowProvincePicker(false)
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-all",
                        isActive
                          ? "border-accent bg-accent/5 text-accent"
                          : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
                      )}
                    >
                      <img
                        src={PROVINCE_SHAPES[key]}
                        alt=""
                        aria-hidden="true"
                        className="h-7 w-7 object-contain drop-shadow-sm"
                      />
                      <span className="text-center text-[10px] leading-tight font-medium">
                        {name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function App() {
  return (
    <AppProvider
      initialListings={USE_MOCK_DATA ? FEATURED_PROFILES : []}
    >
      <AppFrame />
    </AppProvider>
  )
}

/** App-wide shell: auth overlay, onboarding dialog and toasts on every route. */
function AppFrame() {
  const { setActiveTab } = useApp()
  const [showAuth, setShowAuth] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)

  const handleAuthenticated = () => {
    setCurrentUser(
      USE_MOCK_DATA ? MOCK_USER : { ...MOCK_USER, id: DEMO_USER_ID }
    )
    setShowAuth(false)
    setActiveTab("Profile")
  }

  return (
    <>
      {/* Full-screen auth overlay with animation */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-md"
            >
              <button
                type="button"
                onClick={() => setShowAuth(false)}
                className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
              <Auth3
                onSignIn={handleAuthenticated}
                onSignUp={handleAuthenticated}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route
          path="/messages/:conversationId"
          element={<MessageDetailPage />}
        />
        <Route
          path="*"
          element={
            <AppRoot
              setShowAuth={setShowAuth}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
            />
          }
        />
      </Routes>

      {/* Onboarding choice dialog — appears 3s after the app loads,
          unless the user previously opted to never see it again. */}
      <OnboardingDialog
        delay={3000}
        onRegister={() => setShowAuth(true)}
        onLogin={() => setShowAuth(true)}
      />

      <Toaster position="top-center" richColors />
    </>
  )
}

function AppRoot({
  setShowAuth,
  currentUser,
  setCurrentUser,
}: {
  setShowAuth: (show: boolean) => void
  currentUser: UserData | null
  setCurrentUser: (user: UserData | null) => void
}) {
  const { province, setProvince } = useApp()

  if (!province) {
    return <LandingPage onEnter={setProvince} />
  }

  return (
    <MainApp
      province={province}
      setShowAuth={setShowAuth}
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
    />
  )
}

function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    allListings,
    favorites,
    toggleFavorite,
    promotedIds,
    promoteListing,
    setActiveTab,
    getListingById,
  } = useApp()
  const [result, setResult] = useState<{
    id: string
    listing: FeaturedProfile | null
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    getListingById(id ?? "")
      .then((l) => {
        if (cancelled) return
        setResult({ id: id ?? "", listing: l })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        console.error("Failed to load listing", err)
        setResult({ id: id ?? "", listing: null })
      })
    return () => {
      cancelled = true
    }
  }, [id, getListingById])

  const current = result && result.id === id ? result : null
  const listing = current?.listing ?? null
  const notFound = current !== null && listing === null

  if (notFound) {
    return (
      <ErrorOne
        code="404"
        title="Listing not found"
        description="This listing may have been removed or the link is invalid."
        action={{
          label: "Back to Home",
          onClick: () => navigate("/"),
        }}
      />
    )
  }

  if (!listing) {
    return (
      <AppShell>
        <main className="flex-1 overflow-y-auto px-6 pt-6 pb-28">
          <div className="mx-auto max-w-md space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        </main>
      </AppShell>
    )
  }

  const related = allListings.filter((p) => p.id !== listing.id)

  return (
    <DetailPage
      key={listing.id}
      {...listing}
      featured={listing.featured === true || promotedIds.has(listing.id)}
      isFavorited={favorites.has(listing.id)}
      onToggleFavorite={() => toggleFavorite(listing.id)}
      onPromote={() => promoteListing(listing.id)}
      onRequestView={() => {
        setActiveTab("Messages")
        navigate("/")
      }}
      onBack={() => navigate(-1)}
      relatedListings={related}
      onViewRelated={(rid) => navigate(`/listing/${rid}`)}
    />
  )
}

/** Detail view for one message thread (all related messages grouped). */
function MessageDetailPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const [state, setState] = useState<{
    id: string
    thread: MessageThread | null
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = (items: SystemMessageDto[]) => {
      if (cancelled) return
      const list = items.length > 0 ? items : MOCK_MESSAGES
      const thread =
        groupMessages(list).find((g) => g.conversationId === conversationId) ??
        null
      setState({ id: conversationId ?? "", thread })

      if (thread) {
        for (const message of thread.messages) {
          if (!message.isRead) messagesService.markRead(message.id).catch(() => {})
        }
      }
    }

    messagesService.loadMessages().then(load).catch(() => load(MOCK_MESSAGES))
    return () => {
      cancelled = true
    }
  }, [conversationId])

  const current = state && state.id === conversationId ? state : null
  const thread = current?.thread ?? null
  const notFound = current !== null && thread === null

  if (notFound) {
    return (
      <ErrorOne
        code="404"
        title="Thread not found"
        description="This conversation may have been removed or the link is invalid."
        action={{
          label: "Back to Messages",
          onClick: () => navigate("/"),
        }}
      />
    )
  }

  if (!thread) {
    return (
      <AppShell>
        <main className="flex-1 overflow-y-auto px-6 pt-6 pb-28">
          <div className="mx-auto max-w-2xl space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        </main>
      </AppShell>
    )
  }

  const days = Array.from(
    thread.messages.reduce((map, m) => {
      const day = messageDay(m.timestamp)
      const list = map.get(day) ?? []
      list.push(m)
      map.set(day, list)
      return map
    }, new Map<string, SystemMessageDto[]>())
  ).map(([day, messages]) => ({ day, messages }))

  return (
    <AppShell>
      <main className="flex-1 overflow-y-auto px-4 pt-5 pb-28 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <header className="mb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="h-7 w-1 rounded-full bg-primary/80" />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {thread.name}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {thread.messages.length} messages
                  {thread.listingId
                    ? " · about one of your saved listings"
                    : <>{" "}· <span className="text-accent">Cohabit</span> updates</>}
                </p>
              </div>
            </div>
            {thread.listingId && (
              <button
                type="button"
                onClick={() => navigate(`/listing/${thread.listingId}`)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-muted"
              >
                View listing
                <ArrowLeft className="size-3.5 rotate-180" aria-hidden="true" />
              </button>
            )}
          </header>

          <div className="flex flex-col gap-6">
            {days.map(({ day, messages: dayMessages }) => (
              <MessageGroup key={day}>
                <div className="self-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {day}
                </div>
                {dayMessages.map((m) => (
                  <Message key={m.id} align="start">
                    <MessageAvatar className="bg-primary/10 text-primary">
                      <span className="flex size-8 items-center justify-center text-xs font-semibold">
                        C
                      </span>
                    </MessageAvatar>
                    <MessageContent>
                      <MessageHeader>
                        <span className="font-semibold text-accent">
                          Cohabit
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{formatMessageTime(m.timestamp)}</span>
                      </MessageHeader>
                      <div className="w-fit max-w-full rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                        <p className="text-sm font-semibold">{m.title}</p>
                        <p className="mt-1 text-sm text-foreground/90">
                          {m.content}
                        </p>
                      </div>
                    </MessageContent>
                  </Message>
                ))}
              </MessageGroup>
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  )
}

export default App
