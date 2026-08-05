/* eslint-disable react-refresh/only-export-components */
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

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Always light — no localStorage, no 'd' key toggle, no system preference
  const [theme, setThemeState] = React.useState<Theme>("light")

  React.useEffect(() => {
    const root = document.documentElement
    root.classList.remove("dark")
    root.classList.add("light")

    // Clean up any stale localStorage key from previous sessions
    try {
      localStorage.removeItem("theme")
    } catch {
      /* noop */
    }
  }, [])

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next)
    const root = document.documentElement
    root.classList.remove("dark", "light")
    root.classList.add(next === "system" ? "light" : next)
  }, [])

  const value = { theme, setTheme }

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
