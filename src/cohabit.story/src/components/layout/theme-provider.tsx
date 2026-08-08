import * as React from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "cohabit.theme",
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme
    const stored = window.localStorage.getItem(storageKey) as Theme | null
    return stored ?? defaultTheme
  })

  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    const apply = (resolved: "light" | "dark") => {
      if (disableTransitionOnChange) {
        root.style.transition = "none"
        window.setTimeout(() => {
          root.style.transition = ""
        }, 0)
      }
      root.classList.add(resolved)
    }

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)")
      apply(media.matches ? "dark" : "light")
      const onChange = (event: MediaQueryListEvent) =>
        apply(event.matches ? "dark" : "light")
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    }

    apply(theme)
  }, [theme, disableTransitionOnChange])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (next: Theme) => {
        window.localStorage.setItem(storageKey, next)
        setTheme(next)
      },
    }),
    [theme, storageKey]
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
