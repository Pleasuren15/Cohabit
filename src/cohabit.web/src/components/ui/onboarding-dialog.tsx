"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { X, KeyRound, Users, Bell, BellOff, LogIn, UserRound } from "lucide-react"
import { FluidTabs, type TabItem } from "@/components/ui/fluid-tabs"
import { SwitchMode } from "@/components/ui/switch-mode"

const STORAGE_KEY = "cohabit:onboarding-dismissed"

interface OnboardingDialogProps {
  /** Delay (ms) before the dialog appears after the app mounts. */
  delay?: number
  onContinueAsGuest?: () => void
  onRegister?: () => void
  onLogin?: () => void
}

const TABS: TabItem[] = [
  { id: "rent", label: "List for renting", icon: <KeyRound size={20} /> },
  { id: "roommate", label: "Find a roommate", icon: <Users size={20} /> },
]

export function OnboardingDialog({
  delay = 2000,
  onContinueAsGuest,
  onRegister,
  onLogin,
}: OnboardingDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("rent")
  const [neverAgain, setNeverAgain] = useState(false)

  // Show the dialog after the delay, unless the user opted out previously.
  useEffect(() => {
    let dismissed = false
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === "1"
    } catch {
      /* localStorage unavailable — still show */
    }
    if (dismissed) return

    const timer = window.setTimeout(() => setOpen(true), delay)
    return () => window.clearTimeout(timer)
  }, [delay])

  const close = () => {
    setOpen(false)
    if (neverAgain) {
      try {
        localStorage.setItem(STORAGE_KEY, "1")
      } catch {
        /* ignore storage errors */
      }
    }
  }

  const handleGuest = () => {
    close()
    onContinueAsGuest?.()
  }

  const handleRegister = () => {
    close()
    onRegister?.()
  }

  const handleLogin = () => {
    close()
    onLogin?.()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Choose how you want to use Cohabit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-3xl border border-border/40 bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <span className="mb-1 inline-block rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                    Get started
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Welcome to Cohabit
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    How would you like to get started?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Fluid tabs — content switches with the active tab */}
              <FluidTabs
                tabs={TABS}
                defaultActive="rent"
                onChange={setActiveTab}
              />

              <div className="mt-5 min-h-28">
                {activeTab === "rent" ? (
                  <div className="space-y-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      List your space for renting
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Post your room or property, set your price, and connect with
                      verified housemates in your area.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
                    <p className="text-sm font-medium text-sky-600 dark:text-sky-400">
                      Find a roommate
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Browse shared homes and compatible housemates across South
                      Africa to find your perfect match.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={handleGuest}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-opacity hover:opacity-90"
                >
                  <UserRound className="size-4" aria-hidden="true" />
                  Continue as guest
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="flex items-center justify-center gap-2 rounded-full border border-blue-500/40 px-4 py-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-500/10 dark:text-blue-400"
                  >
                    <LogIn className="size-4" aria-hidden="true" />
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <LogIn className="size-4" aria-hidden="true" />
                    Login
                  </button>
                </div>
              </div>

              {/* Never show again toggle */}
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {neverAgain ? (
                    <BellOff className="size-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  ) : (
                    <Bell className="size-4" aria-hidden="true" />
                  )}
                  <span>Never show this again</span>
                </div>
                <SwitchMode
                  checked={neverAgain}
                  onChange={setNeverAgain}
                  width={56}
                  height={30}
                  onColor="#1D4ED8"
                  offColor="#FFFFFF"
                  knobOnColor="#1E3A8A"
                  knobOffColor="#F3F2F7"
                  borderOnColor="#3B82F6"
                  borderOffColor="#D8D6E0"
                  ariaLabel="Never show this dialog again"
                  onIcon={
                    <BellOff
                      color="#F4F4FB"
                      fill="#F4F4FB"
                      style={{ width: 14, height: 14 }}
                    />
                  }
                  offIcon={
                    <Bell
                      color="#686771"
                      fill="#686771"
                      style={{ width: 14, height: 14 }}
                    />
                  }
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}