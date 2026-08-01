import { useState, useEffect, useMemo, type ReactNode } from "react"
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
import { ExpandableProfileCard } from "@/components/ui/expandable-profile-card"
import { DetailPage } from "@/components/ui/detail-page"
import {
  MinimalCarousel,
  type CarouselCard,
} from "@/components/ui/minimal-carousel"
import { UserProfile, type UserData } from "@/components/ui/user-profile"

type VerificationType = "phone" | "email" | "id" | "credit"

export interface FeaturedProfile {
  id: string
  imageSrc: string
  name: string
  location: string
  mapAddress: string
  bio: string
  photoCount: number
  verified: VerificationType[]
  province: string
  type: "roommate" | "rentals"
  userId: string
  price: number
  deposit: number
  beds: number
  baths: number
  availableFrom: string
  responseTime: string
  rules: string[]
  amenities?: string[]
}

const FEATURED_PROFILES: FeaturedProfile[] = [
  {
    id: "thabo-mokoena",
    imageSrc:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Thabo Mokoena",
    location: "Sea Point, Cape Town",
    mapAddress: "Sea Point, Cape Town, South Africa",
    bio: "Creative graphic designer looking for a shared space with like-minded people. I love hosting braais on weekends and exploring hiking trails.",
    price: 7500,
    deposit: 7500,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["No smoking indoors", "Pets welcome", "Guests welcome"],
    photoCount: 6,
    verified: ["phone", "email", "id"],
    province: "wc",
    type: "roommate",
    userId: "user-1",
  },
  {
    id: "priya-naidoo",
    imageSrc:
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Priya Naidoo",
    location: "Umhlanga, Durban",
    mapAddress: "Umhlanga, Durban, South Africa",
    bio: "Remote software developer seeking a quiet, clean flatmate. I enjoy cooking, yoga, and beach walks. Non-smoker, pet-friendly.",
    price: 6800,
    deposit: 6800,
    beds: 1,
    baths: 1,
    availableFrom: "15 Aug 2026",
    responseTime: "Within a few hours",
    rules: ["Non-smoking home", "No pets", "Quiet after 10pm"],
    photoCount: 8,
    verified: ["phone", "email", "id", "credit"],
    province: "kzn",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "james-van-der-merwe",
    imageSrc:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "James van der Merwe",
    location: "Observatory, Cape Town",
    mapAddress: "Observatory, Cape Town, South Africa",
    bio: "Medical student at UCT. I keep irregular hours but I'm tidy and respectful. Love board games and morning runs.",
    price: 6200,
    deposit: 6200,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["No smoking", "Tidy shared spaces", "Flexible guests"],
    photoCount: 4,
    verified: ["phone", "id"],
    province: "wc",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "lindiwe-dlamini",
    imageSrc:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Lindiwe Dlamini",
    location: "Fourways, Johannesburg",
    mapAddress: "Fourways, Johannesburg, South Africa",
    bio: "Marketing manager at a tech startup. I work from home 3 days a week and enjoy wine tasting, live music, and meeting new people.",
    price: 5900,
    deposit: 5900,
    beds: 1,
    baths: 1,
    availableFrom: "1 Aug 2026",
    responseTime: "Same day",
    rules: ["Non-smoking home", "Pets welcome", "Visitors welcome"],
    photoCount: 10,
    verified: ["phone", "email", "id", "credit"],
    province: "gp",
    type: "roommate",
    userId: "user-1",
  },
  {
    id: "sipho-zulu",
    imageSrc:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Sipho Zulu",
    location: "Maboneng, Johannesburg",
    mapAddress: "Maboneng, Johannesburg, South Africa",
    bio: "Freelance photographer and content creator. I'm out most days shooting but enjoy cozy nights in. Looking for an artsy flatmate.",
    price: 5500,
    deposit: 5500,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["No smoking indoors", "Artistic chaos OK", "Guests welcome"],
    photoCount: 7,
    verified: ["phone", "email"],
    province: "gp",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "emma-coetzee",
    imageSrc:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Emma Coetzee",
    location: "Stellenbosch, Winelands",
    mapAddress: "Stellenbosch, South Africa",
    bio: "Postgraduate student in viticulture. Quiet and dedicated, but I unwind with hiking and dog parks on weekends. Non-smoker.",
    price: 4800,
    deposit: 4800,
    beds: 1,
    baths: 1,
    availableFrom: "1 Feb 2026",
    responseTime: "Within a few hours",
    rules: ["Non-smoking", "No pets", "Quiet evenings"],
    photoCount: 5,
    verified: ["phone", "id", "credit"],
    province: "wc",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "nomsa-mthembu",
    imageSrc:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Nomsa Mthembu",
    location: "Morningside, Durban",
    mapAddress: "Morningside, Durban, South Africa",
    bio: "Registered nurse working night shifts at Addington Hospital. I need a calm, clean space during the day to rest. Respectful and drama-free.",
    price: 5200,
    deposit: 5200,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["Non-smoking home", "No pets", "Calm & quiet"],
    photoCount: 3,
    verified: ["phone", "email", "id"],
    province: "kzn",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "kyle-petersen",
    imageSrc:
      "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Kyle Petersen",
    location: "Gardens, Cape Town",
    mapAddress: "Gardens, Cape Town, South Africa",
    bio: "Chef at a restaurant in town. I bring home leftovers and love sharing meals. Tidy in shared spaces, out most evenings. Looking for a relaxed flatmate.",
    price: 12000,
    deposit: 12000,
    beds: 2,
    baths: 2,
    availableFrom: "Immediately",
    responseTime: "Within the hour",
    rules: ["No smoking", "Pets by arrangement", "Shared kitchen"],
    photoCount: 6,
    verified: ["phone", "id", "credit"],
    province: "wc",
    type: "rentals",
    userId: "user-1",
  },
  {
    id: "zanele-khumalo",
    imageSrc:
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Zanele Khumalo",
    location: "Waterkloof, Pretoria",
    mapAddress: "Waterkloof, Pretoria, South Africa",
    bio: "Civil engineer working on infrastructure projects. I'm outdoorsy and enjoy trail running, but also love quiet evenings with a good book. Pet-friendly.",
    price: 14000,
    deposit: 14000,
    beds: 3,
    baths: 2,
    availableFrom: "1 Sep 2026",
    responseTime: "Same day",
    rules: ["No smoking indoors", "Pets welcome", "Parking available"],
    photoCount: 9,
    verified: ["phone", "email", "id"],
    province: "gp",
    type: "rentals",
    userId: "user-2",
  },
  {
    id: "mandla-grootboom",
    imageSrc:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Mandla Grootboom",
    location: "Summerstrand, Gqeberha",
    mapAddress: "Summerstrand, Gqeberha, South Africa",
    bio: "Lecturer at NMU looking for a quiet flatmate. I enjoy reading, surfing on weekends, and live music. Non-smoker, no pets.",
    price: 4600,
    deposit: 4600,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within a few hours",
    rules: ["Non-smoker only", "No pets", "Quiet after 11pm"],
    photoCount: 5,
    verified: ["phone", "email", "id"],
    province: "ec",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "natasha-kemp",
    imageSrc:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Natasha Kemp",
    location: "Eastern Beach, East London",
    mapAddress: "East London, South Africa",
    bio: "Accountant at a firm in town. I'm neat, organised, and enjoy a peaceful home environment. Love beach walks and Sunday roasts.",
    price: 9500,
    deposit: 9500,
    beds: 2,
    baths: 1,
    availableFrom: "1 Oct 2026",
    responseTime: "Within the hour",
    rules: ["Non-smoking home", "No pets", "Peaceful home"],
    photoCount: 7,
    verified: ["phone", "id", "credit"],
    province: "ec",
    type: "rentals",
    userId: "user-2",
  },
  {
    id: "katlego-mokoena",
    imageSrc:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Katlego Mokoena",
    location: "Bloemfontein Central",
    mapAddress: "Bloemfontein, South Africa",
    bio: "Journalist covering local news. I work flexible hours and enjoy hiking, photography, and trying new restaurants. Looking for a laid-back flatmate.",
    price: 4200,
    deposit: 4200,
    beds: 1,
    baths: 1,
    availableFrom: "Immediately",
    responseTime: "Same day",
    rules: ["No smoking indoors", "Pets welcome", "Flexible hours"],
    photoCount: 4,
    verified: ["phone", "email"],
    province: "fs",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "anelize-visser",
    imageSrc:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Anelize Visser",
    location: "Universitas, Bloemfontein",
    mapAddress: "Bloemfontein, South Africa",
    bio: "Masters student at UFS. I need a quiet study environment but enjoy board games and coffee chats. Tidy, respectful, and drama-free.",
    price: 3800,
    deposit: 3800,
    beds: 1,
    baths: 1,
    availableFrom: "1 Feb 2026",
    responseTime: "Within a few hours",
    rules: ["Quiet study environment", "No smoking", "No pets"],
    photoCount: 3,
    verified: ["phone", "id"],
    province: "fs",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "tendai-masuku",
    imageSrc:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Tendai Masuku",
    location: "Polokwane Central",
    mapAddress: "Polokwane, South Africa",
    bio: "Pharmacist at a local hospital. I work shifts but keep a tidy home. Love gardening, cooking, and weekend braais. Pet-friendly.",
    price: 4500,
    deposit: 4500,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["No smoking", "Pets welcome", "Weekend braais"],
    photoCount: 6,
    verified: ["phone", "email", "id"],
    province: "lp",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "megan-dlamini",
    imageSrc:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Megan Dlamini",
    location: "Mbombela City Center",
    mapAddress: "Mbombela, South Africa",
    bio: "Tourism guide specialising in Kruger Park safaris. Outgoing, adventurous, and love sharing travel stories. Looking for an easygoing flatmate.",
    price: 4700,
    deposit: 4700,
    beds: 1,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["Non-smoking home", "No pets", "Guests welcome"],
    photoCount: 8,
    verified: ["phone", "email", "id", "credit"],
    province: "mp",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "johan-dupreez",
    imageSrc:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Johan du Preez",
    location: "Kimberley City",
    mapAddress: "Kimberley, South Africa",
    bio: "Mining engineer with a calm demeanour. I spend most weekends at the diamond fields but need a clean home base. Non-smoker, no pets.",
    price: 4100,
    deposit: 4100,
    beds: 1,
    baths: 1,
    availableFrom: "1 Nov 2026",
    responseTime: "Same day",
    rules: ["Non-smoker only", "No pets", "Clean home base"],
    photoCount: 4,
    verified: ["phone", "id"],
    province: "nc",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "olwethu-ntuli",
    imageSrc:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Olwethu Ntuli",
    location: "Mahikeng City",
    mapAddress: "Mahikeng, South Africa",
    bio: "Social worker passionate about community development. I enjoy quiet evenings, cooking traditional meals, and tending to my plants.",
    price: 3900,
    deposit: 3900,
    beds: 1,
    baths: 1,
    availableFrom: "Immediately",
    responseTime: "Within a few hours",
    rules: ["No smoking", "Plants welcome", "Quiet evenings"],
    photoCount: 5,
    verified: ["phone", "email", "id"],
    province: "nw",
    type: "roommate",
    userId: "user-2",
  },
  {
    id: "nadia-van-wyk",
    imageSrc:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000&h=700",
    name: "Nadia van Wyk",
    location: "Klerksdorp Central",
    mapAddress: "Klerksdorp, South Africa",
    bio: "High school teacher looking for a quiet, respectful flatmate. I'm tidy, love baking, and enjoy weekend hikes. Non-smoker.",
    price: 8500,
    deposit: 8500,
    beds: 2,
    baths: 1,
    availableFrom: "1 Sep 2026",
    responseTime: "Within the hour",
    rules: ["Non-smoking home", "No pets", "Respectful flatmate"],
    photoCount: 6,
    verified: ["phone", "email", "id", "credit"],
    province: "nw",
    type: "rentals",
    userId: "user-2",
  },
]

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

const MESSAGE_THREADS: PlaceItem[] = [
  {
    id: 1,
    name: "Welcome to Cohabit",
    type: "Today",
    status:
      "Your account has been created successfully. Start exploring shared living spaces near you!",
    pinned: false,
  },
  {
    id: 2,
    name: "New Property Alert",
    type: "Today",
    status:
      "A new shared home in Sea Point has been listed that matches your preferences.",
    pinned: false,
  },
  {
    id: 3,
    name: "Listing Liked",
    type: "Yesterday",
    status:
      'Sarah liked your property "Cozy flat in Observatory". View their profile to connect.',
    pinned: true,
  },
  {
    id: 4,
    name: "Price Drop",
    type: "Yesterday",
    status:
      'Great news! "Spacious room in Gardens" has dropped in price by R1,500/month.',
    pinned: false,
  },
  {
    id: 5,
    name: "Profile Views",
    type: "Jul 20",
    status:
      "Your listing was viewed 24 times this week. Keep your profile updated to attract more interest.",
    pinned: false,
  },
  {
    id: 6,
    name: "Verification Approved",
    type: "Jul 18",
    status:
      "Your phone number has been verified. Complete ID verification to unlock more features.",
    pinned: false,
  },
  {
    id: 7,
    name: "New Matches",
    type: "Jul 16",
    status:
      "We found 3 potential roommates based on your preferences. Check them out!",
    pinned: true,
  },
  {
    id: 8,
    name: "Weekly Digest",
    type: "Jul 14",
    status:
      "5 new listings this week in your area. Don't miss out on your perfect shared home.",
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
  title: string
  subtitle?: string
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
function MainApp({ province: initialProvince }: { province: string }) {
  const [province, setProvince] = useState(initialProvince)
  const [activeTab, setActiveTab] = useState("Home")
  const [listingFilter, setListingFilter] = useState("all")
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [userVerified, setUserVerified] = useState<VerificationType[]>(["phone", "email"])
  const [showAuth, setShowAuth] = useState(false)
  const [showProvincePicker, setShowProvincePicker] = useState(false)
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [selectedListing, setSelectedListing] =
    useState<FeaturedProfile | null>(null)
  const [extraListings, setExtraListings] = useState<FeaturedProfile[]>([])

  const filteredProfiles = useMemo(
    () =>
      FEATURED_PROFILES.filter((p) => {
        if (p.province !== province) return false
        if (listingFilter === "roommate" && p.type !== "roommate") return false
        if (listingFilter === "rentals" && p.type !== "rentals") return false
        return true
      }),
    [province, listingFilter]
  )

  const handleViewListing = (id: string) => {
    const profile =
      filteredProfiles.find((p) => p.id === id) ||
      extraListings.find((p) => p.id === id)
    if (profile) setSelectedListing(profile)
  }
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(["thabo-mokoena", "priya-naidoo", "lindiwe-dlamini"])
  )

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
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

  const watchlistCards: CarouselCard[] = useMemo(
    () =>
      FEATURED_PROFILES.filter((p) => favorites.has(p.id)).map((p, i) => ({
        id: p.id,
        title: p.name,
        value: p.location,
        color: WATCHLIST_GRADIENTS[i % WATCHLIST_GRADIENTS.length],
        imageSrc: p.imageSrc,
      })),
    [favorites]
  )

  useEffect(() => {
    const timer = setTimeout(() => setProfilesLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

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
                onSignIn={() => {
                  setCurrentUser(MOCK_USER)
                  setShowAuth(false)
                  setActiveTab("Profile")
                }}
                onSignUp={() => {
                  setCurrentUser(MOCK_USER)
                  setShowAuth(false)
                  setActiveTab("Profile")
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <form>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2.5">
                  <Search className="size-3.5 text-muted-foreground" />
                </div>
                <input
                  type="search"
                  id="search"
                  className="block w-full rounded-lg border border-border bg-background p-2 ps-8 text-xs text-foreground shadow-sm placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
                  placeholder="Search apartments, areas..."
                  required
                />
                <button
                  type="button"
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
          className={`flex-1 overflow-y-auto px-6 pb-28 ${activeTab === "Home" ? "pt-32" : "pt-6"}`}
        >
          <div className="mx-auto max-w-md">
            {activeTab === "Home" && (
              <>
                {/* Featured profiles */}
                <div className="w-full space-y-3 text-left">
                  {(profilesLoading
                    ? Array.from({ length: filteredProfiles.length })
                    : filteredProfiles
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
                        isFavorited={favorites.has(
                          (item as FeaturedProfile).id
                        )}
                        onToggleFavorite={toggleFavorite}
                        onView={handleViewListing}
                      />
                    )
                  )}
                </div>
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
                <PageHeader icon={MessageSquare} title="Messages" />
                <PinItemComponent
                  items={MESSAGE_THREADS}
                  pinnedLabel="Pinned"
                  allLabel="All Messages"
                />
              </div>
            )}

            {activeTab === "Info" && (
              <div className="flex flex-col items-center">
                <PageHeader
                  icon={ScrollText}
                  title="Terms &amp; Conditions"
                  subtitle="Last updated 21 July 2026"
                />

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

                <div className="mt-16 w-full">
                  <PageHeader
                    icon={Shield}
                    title="Verification Badges"
                    subtitle="Build trust in the community."
                  />
                </div>

                <div className="w-full">
                  <Tabs defaultValue="phone" className="gap-4">
                    <TabsList className="rounded-2xl bg-transparent">
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
                      className="mt-0 rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-6"
                    >
                      <h5 className="mb-4 text-2xl font-black tracking-tight text-blue-800">
                        Phone
                      </h5>
                      <p className="border-l-2 border-blue-500 pl-4 text-sm leading-6 text-blue-700/80">
                        Confirm your mobile via OTP to{" "}
                        <span className="font-semibold text-blue-900">
                          verify your identity
                        </span>
                        . Fastest way to build trust.
                      </p>
                    </TabsContent>

                    <TabsContent
                      value="email"
                      className="mt-0 rounded-3xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-6"
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
                      className="mt-0 rounded-3xl border-2 border-dashed border-green-200 bg-green-50/50 p-6"
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
                      className="mt-0 rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-6"
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
            )}

            {activeTab === "Profile" && currentUser && (
              <UserProfile
                user={currentUser}
                userListings={[
                  ...FEATURED_PROFILES.filter(
                    (p) => p.userId === currentUser.id
                  ),
                  ...extraListings,
                ]}
                verified={userVerified}
                onVerify={(type) => {
                  if (!userVerified.includes(type)) {
                    setUserVerified((prev) => [...prev, type])
                  }
                }}
                onUpdateUser={setCurrentUser}
                onToggleFavorite={toggleFavorite}
                onViewListing={handleViewListing}

                onAddListing={(data) => {
                  const id = `user-listing-${Date.now()}`
                  const newProfile: FeaturedProfile = {
                    id,
                    imageSrc:
                      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000&h=700",
                    name: data.name,
                    location: data.location,
                    mapAddress: data.address || data.location,
                    bio: data.bio,
                    photoCount: 0,
                    verified: [],
                    province,
                    type: data.type,
                    userId: currentUser.id,
                    price: data.price,
                    deposit: data.deposit,
                    beds: data.beds,
                    baths: data.baths,
                    availableFrom: data.availableFrom,
                    responseTime: "Within the hour",
                    rules: [],
                    amenities: data.amenities,
                  }
                  setExtraListings((prev) => [...prev, newProfile])
                }}
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

      {/* Listing detail page overlay */}
      <AnimatePresence mode="wait">
        {selectedListing && (
          <DetailPage
            key={selectedListing.id}
            {...selectedListing}
            isFavorited={favorites.has(selectedListing.id)}
            onToggleFavorite={toggleFavorite}
            onRequestView={() => {
              setSelectedListing(null)
              setActiveTab("Messages")
            }}
            onBack={() => setSelectedListing(null)}
            relatedListings={filteredProfiles.filter(
              (p) => p.id !== selectedListing.id
            )}
            onViewRelated={handleViewListing}
          />
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
