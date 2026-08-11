import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContractGenerator } from "@/components/ui/contract-generator";

function renderGenerator(open = true) {
  const onOpenChange = () => {};
  return render(<ContractGenerator open={open} onOpenChange={onOpenChange} />);
}

describe("ContractGenerator", () => {
  it("shows both contract types on the first step", () => {
    renderGenerator();
    expect(
      screen.getByRole("button", { name: /roommate agreement/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /residential lease/i }),
    ).toBeInTheDocument();
  });

  it("moves to the details step when a contract type is chosen", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(
      screen.getByRole("button", { name: /roommate agreement/i }),
    );

    expect(screen.getByText(/property & dates/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /preview/i }),
    ).toBeInTheDocument();
  });

  it("previews the document and includes the entered address", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(
      screen.getByRole("button", { name: /roommate agreement/i }),
    );

    await user.type(
      screen.getByPlaceholderText(/12 long street, cape town/i),
      "5 Orchid Road, Johannesburg",
    );

    await user.click(screen.getByRole("button", { name: /preview/i }));

    expect(
      screen.getByRole("button", { name: /download pdf/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/5 orchid road, johannesburg/i),
    ).toBeInTheDocument();
  });

  it("allows navigating back and switching contract type", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(
      screen.getByRole("button", { name: /roommate agreement/i }),
    );
    expect(screen.getByText(/property & dates/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back/i }));
    await user.click(
      screen.getByRole("button", { name: /residential lease/i }),
    );

    expect(screen.getByText(/parties/i)).toBeInTheDocument();
  });
});
