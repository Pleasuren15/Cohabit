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

describe("Contract generator on the Account page", () => {
  it("shows the generator card on the Profile tab and opens the wizard", async () => {
    const user = userEvent.setup();
    renderSignedInApp();

    // Wait for the mock signed-in user to load, then open the Profile tab.
    const profileTab = await screen.findByRole("button", {
      name: /^profile$/i,
    });
    await user.click(profileTab);

    expect(
      await screen.findByRole("heading", {
        name: /create a rental contract/i,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /generate a contract/i }),
    );

    // The wizard dialog opens with both contract types to choose from.
    expect(
      await screen.findByRole("button", { name: /roommate agreement/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /residential lease/i }),
    ).toBeInTheDocument();
  });

  it("does not show the generator on the Home feed", async () => {
    renderSignedInApp();

    expect(
      screen.queryByRole("heading", { name: /create a rental contract/i }),
    ).not.toBeInTheDocument();
  });
});
