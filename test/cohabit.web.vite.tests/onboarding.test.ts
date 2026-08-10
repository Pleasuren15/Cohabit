import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  GUEST_PROVINCE_KEY,
  ONBOARDING_DISMISSED_KEY,
  isOnboardingDismissed,
  markOnboardingDismissed,
  persistGuestProvince,
  readGuestProvince,
} from "@/lib/onboarding"

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe("onboarding dismissal", () => {
  it("is not dismissed by default", () => {
    expect(isOnboardingDismissed()).toBe(false)
  })

  it("marks the onboarding as dismissed", () => {
    markOnboardingDismissed()
    expect(isOnboardingDismissed()).toBe(true)
    expect(localStorage.getItem(ONBOARDING_DISMISSED_KEY)).toBe("1")
  })
})

describe("guest province persistence", () => {
  it("does not restore a province until the user opts out", () => {
    localStorage.setItem(GUEST_PROVINCE_KEY, "gp")
    expect(readGuestProvince()).toBeNull()
  })

  it("restores the saved province once the user opted out", () => {
    markOnboardingDismissed()
    persistGuestProvince("kzn")
    expect(readGuestProvince()).toBe("kzn")
  })

  it("persists the selected province to localStorage", () => {
    persistGuestProvince("wc")
    expect(localStorage.getItem(GUEST_PROVINCE_KEY)).toBe("wc")
  })
})
