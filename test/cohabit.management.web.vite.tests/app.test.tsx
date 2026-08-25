import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import App from "@/App"

describe("App", () => {
  it("renders the management portal heading", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText("Cohabit Management")).toBeInTheDocument()
  })

  it("renders the sidebar navigation", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const nav = screen.getByRole("navigation")
    expect(nav).toHaveTextContent("Dashboard")
  })

  it("renders the dashboard heading on the default route", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument()
  })

  it("highlights the active nav link", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i })
    expect(dashboardLink).toHaveClass("bg-accent")
  })
})
