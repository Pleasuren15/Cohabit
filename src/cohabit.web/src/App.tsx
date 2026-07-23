import { useState, useEffect, type ReactNode } from "react"
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
  type LucideIcon,
} from "lucide-react"
import { FlipText } from "@/components/ui/flip-text"
import Select33 from "@/components/ui/select-33"
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
} from "@/components/base-ui/tabs"
import { Faq6, type FaqItem } from "@/components/ui/faq-06"
import { PinItemComponent, type PlaceItem } from "@/components/ui/pin-item"

const COHABIT_PHRASES = [
  "Find Your Match",
  "Share Your Space",
  "Live Together",
]

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

const MESSAGE_THREADS: PlaceItem[] = [
  {
    id: 1,
    name: "Welcome to Cohabit",
    type: "Today",
    status: "Your account has been created successfully. Start exploring shared living spaces near you!",
    pinned: false,
  },
  {
    id: 2,
    name: "New Property Alert",
    type: "Today",
    status: "A new shared home in Sea Point has been listed that matches your preferences.",
    pinned: false,
  },
  {
    id: 3,
    name: "Listing Liked",
    type: "Yesterday",
    status: "Sarah liked your property \"Cozy flat in Observatory\". View their profile to connect.",
    pinned: true,
  },
  {
    id: 4,
    name: "Price Drop",
    type: "Yesterday",
    status: "Great news! \"Spacious room in Gardens\" has dropped in price by R1,500/month.",
    pinned: false,
  },
  {
    id: 5,
    name: "Profile Views",
    type: "Jul 20",
    status: "Your listing was viewed 24 times this week. Keep your profile updated to attract more interest.",
    pinned: false,
  },
  {
    id: 6,
    name: "Verification Approved",
    type: "Jul 18",
    status: "Your phone number has been verified. Complete ID verification to unlock more features.",
    pinned: false,
  },
  {
    id: 7,
    name: "New Matches",
    type: "Jul 16",
    status: "We found 3 potential roommates based on your preferences. Check them out!",
    pinned: true,
  },
  {
    id: 8,
    name: "Weekly Digest",
    type: "Jul 14",
    status: "5 new listings this week in your area. Don't miss out on your perfect shared home.",
    pinned: false,
  },
]

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

/** Shared full-bleed backdrop: MeshBackground + legibility scrim + decorative province shapes. */
function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full min-h-svh overflow-hidden">
      {/* Mesh-gradient background */}
      <MeshBackground />

      {/* Scrim to keep text legible over the gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/20" />

      {/* Decorative province shapes */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none">
        {Object.values(PROVINCE_SHAPES).slice(0, 4).map((src, i) => (
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

      <div className="relative z-10 flex min-h-svh flex-col">
        {children}
      </div>
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
        © 2026 Cohabit
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
          <div className="w-full max-w-sm rounded-3xl border border-border/40 bg-background/40 p-6 shadow-sm backdrop-blur-xl sm:p-8">
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
          </div>
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
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent">
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
            <p className="mx-auto max-w-xs text-balance text-sm leading-relaxed text-muted-foreground">
              Browse shared homes and compatible housemates across South
              Africa.
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

/** Main app shell with dock navbar */
function MainApp({ province: initialProvince }: { province: string }) {
  const [province, setProvince] = useState(initialProvince)
  const [activeTab, setActiveTab] = useState("Home")
  const [listingFilter, setListingFilter] = useState("all")
  const [showAuth, setShowAuth] = useState(false)
  const [showProvincePicker, setShowProvincePicker] = useState(false)

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
    },
    {
      title: "Messages",
      icon: MessageSquare,
      onClick: () => setActiveTab("Messages"),
    },
    {
      title: "Info",
      icon: Info,
      onClick: () => setActiveTab("Info"),
    },
    {
      title: "Account",
      icon: User,
      onClick: () => setShowAuth(true),
      className: "bg-red-500 [&_svg]:!text-white [&_span]:!text-white self-stretch -mr-4 -mt-3 -mb-3",
    },
  ]

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
              <Auth3 />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AppShell>
        <main className="flex-1 p-6 pb-28">
          <div className="mx-auto max-w-md">
            {activeTab === "Home" && (
              <>
                {/* Top bar: filter + province */}
                <div className="flex items-center justify-between">
                  <ListingFilter value={listingFilter} onChange={setListingFilter} />
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

                <div className="mt-16 flex flex-col items-center text-center">
                  <img
                    src={PROVINCE_SHAPES[province]}
                    alt={PROVINCES[province]}
                    className="mb-5 h-28 w-28 object-contain drop-shadow-sm"
                  />
                  <h2 className="text-2xl font-bold">
                    Browse {PROVINCES[province]}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Shared living spaces in{" "}
                    <span className="font-medium text-accent">
                      {PROVINCES[province]}
                    </span>{" "}
                    are on the way.
                  </p>
                </div>
              </>
            )}

            {activeTab === "WatchList" && (
              <>
                <h1 className="mb-2 text-2xl font-bold">WatchList</h1>
                <p className="text-muted-foreground">
                  Your saved listings and favorites.
                </p>
              </>
            )}

            {activeTab === "Messages" && (
              <div className="flex flex-col items-center">
                <div className="mb-6 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        INBOX
                      </span>
                      <div className="mt-1 flex items-center gap-3">
                        <div className="h-8 w-1 rounded-full bg-primary" />
                        <h1 className="text-2xl font-semibold">Messages</h1>
                      </div>
                    </div>
                    <MessageSquare className="size-6 text-muted-foreground" />
                  </div>
                </div>
                <PinItemComponent
                  items={MESSAGE_THREADS}
                  pinnedLabel="Pinned"
                  allLabel="All Messages"
                />
              </div>
            )}

            {activeTab === "Info" && (
              <div className="flex flex-col items-center">
                {/* Terms & Conditions — Messages-style header */}
                <div className="mb-6 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        LEGAL
                      </span>
                      <div className="mt-1 flex items-center gap-3">
                        <div className="h-8 w-1 rounded-full bg-primary" />
                        <h1 className="text-2xl font-semibold">Terms &amp; Conditions</h1>
                      </div>
                    </div>
                    <ScrollText className="size-6 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Last updated 21 July 2026
                  </p>
                </div>

                <div className="w-full space-y-3">
                  {TERMS.map((section, i) => {
                    const icons = [ScrollText, Home, Wallet, Handshake, Scale]
                    const IconComponent = icons[i] ?? ScrollText
                    return (
                      <div
                        key={section.heading}
                        className="rounded-2xl border border-border bg-muted/20 p-5"
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
                  <div className="rounded-2xl border border-border bg-muted/20 p-5">
                    <p className="text-xs text-muted-foreground">
                      Questions? Contact us at{" "}
                      <span className="font-medium text-accent">
                        hello@cohabit.co.za
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="mt-12 w-full">
                  <Faq6
                    badge="FAQ"
                    title="Frequently Asked Questions"
                    faqs={HOUSING_FAQS}
                  />
                </div>

                {/* Verification Badges — Messages-style header */}
                <div className="mt-16 mb-6 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        TRUST & SAFETY
                      </span>
                      <div className="mt-1 flex items-center gap-3">
                        <div className="h-8 w-1 rounded-full bg-primary" />
                        <h2 className="text-2xl font-semibold">Verification Badges</h2>
                      </div>
                    </div>
                    <Shield className="size-6 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Build trust in the community.
                  </p>
                </div>

                <div className="w-full">
                  <Tabs defaultValue="phone" className="gap-4">
                    <TabsList className="rounded-2xl bg-transparent">
                      <TabsTrigger value="phone" className="data-[state=active]:bg-blue-500 data-[state=active]:!text-white flex-1 rounded-full px-4 py-1 text-[11px] uppercase transition-all">
                        <Smartphone className="mr-1 size-3.5" />
                        Phone
                      </TabsTrigger>
                      <TabsTrigger value="email" className="data-[state=active]:bg-purple-500 data-[state=active]:!text-white flex-1 rounded-full px-4 py-1 text-[11px] uppercase transition-all">
                        <Mail className="mr-1 size-3.5" />
                        Email
                      </TabsTrigger>
                      <TabsTrigger value="id" className="data-[state=active]:bg-green-500 data-[state=active]:!text-white flex-1 rounded-full px-4 py-1 text-[11px] uppercase transition-all">
                        <BadgeCheck className="mr-1 size-3.5" />
                        ID
                      </TabsTrigger>
                      <TabsTrigger value="credit" className="data-[state=active]:bg-amber-500 data-[state=active]:!text-white flex-1 rounded-full px-4 py-1 text-[11px] uppercase transition-all">
                        <Shield className="mr-1 size-3.5" />
                        Credit
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="phone" className="bg-blue-50/50 mt-0 rounded-3xl border-2 border-dashed border-blue-200 p-6">
                      <h5 className="mb-4 text-2xl font-black tracking-tight text-blue-800">Phone</h5>
                      <p className="text-blue-700/80 border-blue-500 border-l-2 pl-4 text-sm leading-6">
                        Confirm your mobile via OTP to{' '}
                        <span className="text-blue-900 font-semibold">verify your identity</span>.
                        Fastest way to build trust.
                      </p>
                    </TabsContent>

                    <TabsContent value="email" className="bg-purple-50/50 mt-0 rounded-3xl border-2 border-dashed border-purple-200 p-6">
                      <h5 className="mb-4 text-2xl font-black tracking-tight text-purple-800">Email</h5>
                      <p className="text-purple-700/80 border-purple-500 border-l-2 pl-4 text-sm leading-6">
                        Verify your email address to{' '}
                        <span className="text-purple-900 font-semibold">receive important updates</span>{' '}
                        and confirm your account ownership.
                      </p>
                    </TabsContent>

                    <TabsContent value="id" className="bg-green-50/50 mt-0 rounded-3xl border-2 border-dashed border-green-200 p-6">
                      <h5 className="mb-4 text-2xl font-black tracking-tight text-green-800">ID</h5>
                      <p className="text-green-700/80 border-green-500 border-l-2 pl-4 text-sm leading-6">
                        Upload your SA ID or passport for{' '}
                        <span className="text-green-900 font-semibold">official verification</span>.
                        Encrypted and never shared publicly.
                      </p>
                    </TabsContent>

                    <TabsContent value="credit" className="bg-amber-50/50 mt-0 rounded-3xl border-2 border-dashed border-amber-200 p-6">
                      <h5 className="mb-4 text-2xl font-black tracking-tight text-amber-800">Credit</h5>
                      <p className="text-amber-700/80 border-amber-500 border-l-2 pl-4 text-sm leading-6">
                        Complete a{' '}
                        <span className="text-amber-900 font-semibold">financial responsibility check</span>{' '}
                        to unlock priority listings.
                      </p>
                    </TabsContent>
                  </Tabs>

                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    More badges = more trust.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </AppShell>

      {/* Fixed bottom dock — mobile-first */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center">
        <div className="w-full max-w-md">
          <GlassDock
            items={dockItems}
            activeTitle={activeTab}
            showLabels
            className="w-full"
            dockClassName="rounded-none bg-background/95 border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
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
                      <span className="text-[10px] font-medium leading-tight text-center">
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
  const [enteredProvince, setEnteredProvince] = useState<string | null>(null)

  if (!enteredProvince) {
    return <LandingPage onEnter={setEnteredProvince} />
  }

  return <MainApp province={enteredProvince} />
}

export default App
