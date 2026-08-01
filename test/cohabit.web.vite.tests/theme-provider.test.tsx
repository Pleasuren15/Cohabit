import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import { ThemeProvider, useTheme } from "@/components/theme-provider"

function ThemeConsumer() {
  const { theme } = useTheme()
  return <div data-testid="theme">{theme}</div>
}

describe("ThemeProvider", () => {
  it("always provides the 'light' theme and applies it to the document", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )

    expect(getByTestId("theme")).toHaveTextContent("light")
    expect(document.documentElement.classList.contains("light")).toBe(true)
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("ignores dark/system defaultTheme props and stays light", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>
    )

    expect(document.documentElement.classList.contains("light")).toBe(true)
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("clears any stale theme key from localStorage", () => {
    localStorage.setItem("theme", "dark")
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    expect(localStorage.getItem("theme")).toBeNull()
  })

  it("throws when used outside a provider", () => {
    const renderOutside = () => render(<ThemeConsumer />)
    expect(renderOutside).toThrow(/within a ThemeProvider/)
  })
})
