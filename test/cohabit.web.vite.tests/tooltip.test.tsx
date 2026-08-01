import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"

const TOOLTIP_CASES = [
  { trigger: "Hover me", content: "Tooltip text" },
  { trigger: "Amenities", content: "Wi-Fi" },
  { trigger: "Rules", content: "No smoking" },
]

function renderTooltip(trigger: string, content: string) {
  return render(
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button">{trigger}</button>
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

describe("Tooltip data rendering", () => {
  it.each(TOOLTIP_CASES)(
    "shows '$content' when hovering '$trigger'",
    async ({ trigger, content }) => {
      const user = userEvent.setup()
      renderTooltip(trigger, content)

      expect(screen.getByText(trigger)).toBeInTheDocument()

      await user.hover(screen.getByRole("button", { name: trigger }))
      expect(await screen.findByText(content)).toBeInTheDocument()
    }
  )

  it("hides the tooltip content before it is hovered", () => {
    const { queryByText } = renderTooltip("Hover me", "Tooltip text")
    expect(queryByText("Tooltip text")).not.toBeInTheDocument()
  })
})
