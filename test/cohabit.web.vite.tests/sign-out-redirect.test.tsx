import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { GUEST_PROVINCE_KEY, ONBOARDING_DISMISSED_KEY } from "@/lib/onboarding";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

// App snapshots USE_MOCK_DATA from import.meta.env at module load, so force
// mock mode before importing it. The Supabase env vars are cleared too so the
// mock signed-in user (rather than a real Supabase session) is used.
let AppComponent: typeof import("@/App").App;

const MOCK_SIGNED_IN_KEY = "cohabit:mock-signed-in";

beforeAll(async () => {
  vi.stubEnv("VITE_USE_MOCK_DATA", "true");
  vi.stubEnv("VITE_API_URL", "");
  vi.stubEnv("VITE_SUPABASE_URL", "");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
  AppComponent = (await import("@/App")).App;
});

function renderSignedInApp() {
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, "1");
  localStorage.setItem(GUEST_PROVINCE_KEY, "wc");
  localStorage.setItem(MOCK_SIGNED_IN_KEY, "true");
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <TooltipProvider>
          <AppComponent />
        </TooltipProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe("Sign out", () => {
  // The signed-in app is slow to load in mock mode (the Profile tab appears
  // only after the session restores), so give every async query extra time.
  it("redirects to the Home feed after signing out", async () => {
    const user = userEvent.setup();
    renderSignedInApp();

    // Open the Profile tab (only available while signed in).
    const profileTab = await screen.findByRole(
      "button",
      { name: /^profile$/i },
      { timeout: 10000 },
    );
    await user.click(profileTab);

    // Sign out from the account page.
    const signOutButton = await screen.findByRole(
      "button",
      { name: /sign out/i },
      { timeout: 10000 },
    );
    await user.click(signOutButton);

    // The dock reverts to "Account", proving the user is signed out.
    expect(
      await screen.findByRole(
        "button",
        { name: /^account$/i },
        { timeout: 10000 },
      ),
    ).toBeInTheDocument();

    // The Profile content is gone and the Home feed is visible again.
    expect(
      screen.queryByRole("button", { name: /sign out/i }),
    ).not.toBeInTheDocument();
    const viewButtons = await screen.findAllByRole(
      "button",
      { name: /^view$/i },
      { timeout: 10000 },
    );
    expect(viewButtons.length).toBeGreaterThan(0);
  }, 20000);
});
