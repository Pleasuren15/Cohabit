"use client"

import { useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home } from "lucide-react"
import {
  MdEmail,
  MdLock,
  MdPerson,
  MdVisibility,
  MdVisibilityOff,
  MdArrowForward,
} from "react-icons/md"
import { TwinOrbit } from "@/components/loading-ui/twin-orbit"

export interface Auth3SocialProvider {
  id: string
  label: string
  icon: React.ReactNode
  onClick?: () => void
}

export interface Auth3Props {
  socialProviders?: Auth3SocialProvider[]
  dividerText?: string
  signInLabel?: string
  signUpLabel?: string
  forgotPasswordText?: string
  onForgotPassword?: () => void
  onSignIn?: (email: string, password: string) => void
  onSignUp?: (name: string, email: string, password: string) => void
  termsHref?: string
  privacyHref?: string
}

const DEFAULT_SOCIAL_PROVIDERS: Auth3SocialProvider[] = []

function PasswordInput({
  id,
  placeholder,
  value,
  onChange,
}: {
  id: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <MdLock className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
      <Input
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-muted focus-visible:ring-accent/30 h-10 border-border pl-10 pr-10 shadow-none"
        required
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <MdVisibilityOff className="h-4 w-4" />
        ) : (
          <MdVisibility className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}

export function Auth3({
  socialProviders = DEFAULT_SOCIAL_PROVIDERS,
  dividerText = "or",
  signInLabel = "Sign in",
  signUpLabel = "Create account",
  forgotPasswordText = "Forgot password?",
  onForgotPassword,
  onSignIn,
  onSignUp,
  termsHref = "#",
  privacyHref = "#",
}: Auth3Props) {
  const [siEmail, setSiEmail] = useState("")
  const [siPassword, setSiPassword] = useState("")

  const [suName, setSuName] = useState("")
  const [suEmail, setSuEmail] = useState("")
  const [suPassword, setSuPassword] = useState("")
  const [tab, setTab] = useState("signin")

  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)

  const handleSignIn = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSigningIn(true)
    try {
      await Promise.all([
        onSignIn?.(siEmail, siPassword),
        new Promise<void>((r) => setTimeout(r, 1200)),
      ])
    } finally {
      setIsSigningIn(false)
    }
  }, [siEmail, siPassword, onSignIn])

  const handleSignUp = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSigningUp(true)
    try {
      await Promise.all([
        onSignUp?.(suName, suEmail, suPassword),
        new Promise<void>((r) => setTimeout(r, 1200)),
      ])
    } finally {
      setIsSigningUp(false)
    }
  }, [suName, suEmail, suPassword, onSignUp])

  return (
    <div className="flex w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-accent/10">
            <Home className="size-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Cohabit</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared living, made simple
          </p>
        </div>

        {/* Auth card */}
        <div className="border-border bg-card rounded-2xl border shadow-lg">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="bg-muted mx-4 mt-4 grid h-10 w-auto grid-cols-2 gap-1 rounded-lg p-0.5">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-background rounded-md text-xs font-medium data-[state=active]:shadow-sm"
              >
                Sign in
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-background rounded-md text-xs font-medium data-[state=active]:shadow-sm"
              >
                Create account
              </TabsTrigger>
            </TabsList>

            <div className="relative overflow-hidden px-4 pb-4 pt-2">
              <AnimatePresence mode="wait">
                {tab === "signin" && (
                  <motion.div
                    key="signin"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <form onSubmit={handleSignIn} className="space-y-4">
                      {socialProviders.length > 0 && (
                        <>
                          <div className="grid grid-cols-2 gap-2.5">
                            {socialProviders.map((provider) => (
                              <Button
                                key={provider.id}
                                variant="outline"
                                type="button"
                                className="h-10 gap-2 text-xs font-medium"
                                onClick={provider.onClick}
                              >
                                {provider.icon}
                                {provider.label}
                              </Button>
                            ))}
                          </div>
                          <div className="flex items-center gap-3">
                            <Separator className="flex-1" />
                            <span className="text-muted-foreground shrink-0 text-[11px]">
                              {dividerText}
                            </span>
                            <Separator className="flex-1" />
                          </div>
                        </>
                      )}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="auth3-si-email"
                          className="text-xs font-medium"
                        >
                          Email address
                        </Label>
                        <div className="relative">
                          <MdEmail className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                          <Input
                            id="auth3-si-email"
                            type="email"
                            placeholder="you@company.com"
                            value={siEmail}
                            onChange={(e) => setSiEmail(e.target.value)}
                            autoComplete="email"
                            className="bg-muted focus-visible:ring-accent/30 h-10 border-border pl-10 shadow-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="auth3-si-password"
                            className="text-xs font-medium"
                          >
                            Password
                          </Label>
                          <button
                            type="button"
                            onClick={onForgotPassword}
                            className="text-accent rounded-none text-xs underline-offset-4 transition-all hover:underline"
                          >
                            {forgotPasswordText}
                          </button>
                        </div>
                        <PasswordInput
                          id="auth3-si-password"
                          placeholder="••••••••••"
                          value={siPassword}
                          onChange={setSiPassword}
                          autoComplete="current-password"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSigningIn}
                        className="h-10 w-full gap-2 font-semibold disabled:opacity-60 disabled:pointer-events-none"
                      >
                        {isSigningIn ? (
                          <span className="flex items-center justify-center">
                            <TwinOrbit className="size-1.5 text-blue-400" />
                          </span>
                        ) : (
                          <MdArrowForward className="h-4 w-4" />
                        )}
                        {signInLabel}
                      </Button>
                    </form>
                  </motion.div>
                )}

                {tab === "signup" && (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    {socialProviders.length > 0 && (
                      <>
                        <div className="grid grid-cols-2 gap-2.5">
                          {socialProviders.map((provider) => (
                            <Button
                              key={provider.id}
                              variant="outline"
                              type="button"
                              className="h-10 gap-2 text-xs font-medium"
                              onClick={provider.onClick}
                            >
                              {provider.icon}
                              {provider.label}
                            </Button>
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <Separator className="flex-1" />
                          <span className="text-muted-foreground shrink-0 text-[11px]">
                            {dividerText}
                          </span>
                          <Separator className="flex-1" />
                        </div>
                      </>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="auth3-su-name"
                          className="text-xs font-medium"
                        >
                          Full name
                        </Label>
                        <div className="relative">
                          <MdPerson className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                          <Input
                            id="auth3-su-name"
                            type="text"
                            placeholder="Jane Smith"
                            value={suName}
                            onChange={(e) => setSuName(e.target.value)}
                            autoComplete="name"
                            className="bg-muted focus-visible:ring-accent/30 h-10 border-border pl-10 shadow-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="auth3-su-email"
                          className="text-xs font-medium"
                        >
                          Work email
                        </Label>
                        <div className="relative">
                          <MdEmail className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                          <Input
                            id="auth3-su-email"
                            type="email"
                            placeholder="jane@company.com"
                            value={suEmail}
                            onChange={(e) => setSuEmail(e.target.value)}
                            className="bg-muted focus-visible:ring-accent/30 h-10 border-border pl-10 shadow-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="auth3-su-password"
                          className="text-xs font-medium"
                        >
                          Password
                        </Label>
                        <PasswordInput
                          id="auth3-su-password"
                          placeholder="At least 8 characters"
                          value={suPassword}
                          onChange={setSuPassword}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSigningUp}
                        className="mt-2 h-10 w-full gap-2 font-semibold disabled:opacity-60 disabled:pointer-events-none"
                      >
                        {isSigningUp ? (
                          <span className="flex items-center justify-center">
                            <TwinOrbit className="size-1.5 text-blue-400" />
                          </span>
                        ) : (
                          <MdArrowForward className="h-4 w-4" />
                        )}
                        {signUpLabel}
                      </Button>

                      <p className="text-muted-foreground text-center text-xs leading-relaxed">
                        By creating an account you agree to our{" "}
                        <a
                          href={termsHref}
                          className="text-accent underline-offset-4 hover:underline"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href={privacyHref}
                          className="text-accent underline-offset-4 hover:underline"
                        >
                          Privacy Policy
                        </a>
                        .
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
