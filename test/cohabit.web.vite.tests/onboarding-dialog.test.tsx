import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { OnboardingDialog } from "@/components/ui/onboarding-dialog"
import { ONBOARDING_DISMISSED_KEY } from "@/lib/onboarding"

beforeEach(() => {
  localStorage.clear()
})

describe("OnboardingDialog actions", () => {
  it("calls onListSpace when 'List your space' is clicked", async () => {
    const user = userEvent.setup()
    const onListSpace = vi.fn()
    render(<OnboardingDialog delay={0} onListSpace={onListSpace} />)

    const dialog = await screen.findByRole("dialog", {
      name: /choose how you want to use cohabit/i,
    })
    await user.click(
      within(dialog).getByRole("button", { name: /list your space/i })
    )
    expect(onListSpace).toHaveBeenCalledTimes(1)
  })

  it("calls onRegister when 'Register' is clicked", async () => {
    const user = userEvent.setup()
    const onRegister = vi.fn()
    render(<OnboardingDialog delay={0} onRegister={onRegister} />)

    const dialog = await screen.findByRole("dialog", {
      name: /choose how you want to use cohabit/i,
    })
    await user.click(within(dialog).getByRole("button", { name: /register/i }))
    expect(onRegister).toHaveBeenCalledTimes(1)
  })

  it("calls onLogin when 'Login' is clicked", async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()
    render(<OnboardingDialog delay={0} onLogin={onLogin} />)

    const dialog = await screen.findByRole("dialog", {
      name: /choose how you want to use cohabit/i,
    })
    await user.click(within(dialog).getByRole("button", { name: /login/i }))
    expect(onLogin).toHaveBeenCalledTimes(1)
  })

  it("calls onContinueAsGuest when 'Continue as guest' is clicked", async () => {
    const user = userEvent.setup()
    const onContinueAsGuest = vi.fn()
    render(<OnboardingDialog delay={0} onContinueAsGuest={onContinueAsGuest} />)

    const dialog = await screen.findByRole("dialog", {
      name: /choose how you want to use cohabit/i,
    })
    await user.click(
      within(dialog).getByRole("button", { name: /continue as guest/i })
    )
    expect(onContinueAsGuest).toHaveBeenCalledTimes(1)
  })
})

describe("OnboardingDialog opt-out", () => {
  it("marks onboarding as dismissed when closing with 'Never show again' enabled", async () => {
    const user = userEvent.setup()
    render(<OnboardingDialog delay={0} />)

    const dialog = await screen.findByRole("dialog", {
      name: /choose how you want to use cohabit/i,
    })
    await user.click(
      within(dialog).getByRole("switch", {
        name: /never show this dialog again/i,
      })
    )
    await user.click(within(dialog).getByRole("button", { name: /^close$/i }))

    expect(localStorage.getItem(ONBOARDING_DISMISSED_KEY)).toBe("1")
  })

  it("does not appear when onboarding was previously dismissed", () => {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "1")
    const { queryByRole } = render(<OnboardingDialog delay={0} />)
    expect(
      queryByRole("dialog", { name: /choose how you want to use cohabit/i })
    ).not.toBeInTheDocument()
  })
})
