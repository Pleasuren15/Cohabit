import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { Plus } from "lucide-react"

import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip"
import { Button } from "./button"

const meta = {
  title: "ui/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Simple tooltip</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.hover(canvas.getByRole("button", { name: "Hover me" }))
    const tooltip = await within(document.body).findByRole("tooltip")
    await expect(tooltip).toHaveTextContent("Simple tooltip")
    await userEvent.unhover(canvas.getByRole("button", { name: "Hover me" }))
    await expect(tooltip).not.toBeInTheDocument()
  },
}

export const WithContent: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Add expense">
            <Plus />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <Plus className="size-3" />
          Add expense
          <kbd className="rounded-sm border border-white/20 px-1 text-[10px] font-semibold">
            E
          </kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}

export const Placements: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-8 p-8">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Top</Button>
          </TooltipTrigger>
          <TooltipContent side="top">Tooltip on top</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Right</Button>
          </TooltipTrigger>
          <TooltipContent side="right">Tooltip on the right</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Bottom</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Tooltip on the bottom
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Left</Button>
          </TooltipTrigger>
          <TooltipContent side="left">Tooltip on the left</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
}

export const DisabledTrigger: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">
            <Button variant="outline" disabled>
              Disabled button
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Why this is unavailable</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}
