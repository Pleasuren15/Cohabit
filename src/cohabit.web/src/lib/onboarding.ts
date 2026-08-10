export const ONBOARDING_DISMISSED_KEY = "cohabit:onboarding-dismissed"
export const GUEST_PROVINCE_KEY = "cohabit:guest-province"

/** True when the user opted out of the onboarding dialog via "Never show this again". */
export function isOnboardingDismissed(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === "1"
  } catch {
    return false
  }
}

/** Persists the "Never show this again" opt-out for the onboarding dialog. */
export function markOnboardingDismissed(): void {
  try {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "1")
  } catch {
    /* ignore storage failures */
  }
}

/**
 * Persists the selected province so an opted-out guest skips the province
 * picker on their next visit.
 */
export function persistGuestProvince(province: string): void {
  try {
    localStorage.setItem(GUEST_PROVINCE_KEY, province)
  } catch {
    /* ignore storage failures */
  }
}

/** Restores the saved guest province, or null when the user hasn't opted out. */
export function readGuestProvince(): string | null {
  if (!isOnboardingDismissed()) return null
  try {
    return localStorage.getItem(GUEST_PROVINCE_KEY)
  } catch {
    return null
  }
}
