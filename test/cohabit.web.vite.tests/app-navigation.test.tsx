import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { GUEST_PROVINCE_KEY, ONBOARDING_DISMISSED_KEY } from "@/lib/onboarding";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

// App snapshots USE_MOCK_DATA from import.meta.env at module load, so force
// mock mode before importing it.
let AppComponent: typeof import("@/App").App;

beforeAll(async () => {
  vi.stubEnv("VITE_USE_MOCK_DATA", "true");
  vi.stubEnv("VITE_API_URL", "");
  AppComponent = (await import("@/App")).App;
});

function renderApp() {
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, "1");
  localStorage.setItem(GUEST_PROVINCE_KEY, "wc");
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

describe("Home feed listing card navigation", () => {
  // The full app is slow to render under parallel suite load, so give every
  // async query extra time to avoid flaky timeouts.
  it("navigates to the listing detail page when a card's View button is clicked", async () => {
    const user = userEvent.setup();
    renderApp();

    const viewButtons = await screen.findAllByRole(
      "button",
      { name: /^view$/i },
      { timeout: 10000 },
    );
    expect(viewButtons.length).toBeGreaterThan(0);

    await user.click(viewButtons[0]);

    // The feed is replaced by the listing detail page.
    expect(
      await screen.findByRole(
        "heading",
        { name: /thabo mokoena/i, level: 1 },
        { timeout: 10000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /request to view/i }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: /^view$/i })).toHaveLength(
      0,
    );
  }, 15000);

  it("keeps the feed visible when the card body is clicked (expand, not navigate)", async () => {
    const user = userEvent.setup();
    renderApp();

    const headers = await screen.findAllByRole(
      "button",
      { expanded: false },
      { timeout: 10000 },
    );
    await user.click(headers[0]);

    // Still on the feed; the card expanded instead of navigating away.
    expect(
      screen.getAllByRole("button", { name: /^view$/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByRole("heading", { name: /thabo mokoena/i, level: 1 }),
    ).not.toBeInTheDocument();
  }, 15000);
});
