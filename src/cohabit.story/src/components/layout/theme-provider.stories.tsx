import type { ReactNode } from "react"
import type { Meta, StoryObj } from "@storybook/react"

import { ThemeProvider, useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"

function StoryComponent() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">
          Appearance
        </h3>
        <p className="text-sm text-muted-foreground">
          Current theme: {theme}
        </p>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant={theme === "light" ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("light")}
        >
          Light
        </Button>
        <Button
          variant={theme === "dark" ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("dark")}
        >
          Dark
        </Button>
        <Button
          variant={theme === "system" ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("system")}
        >
          System
        </Button>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setTheme("system")}
      >
        Reset to system
      </Button>
    </div>
  )
}

const meta = {
  title: "layout/ThemeProvider",
  component: ThemeProvider,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ThemeProvider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: null as ReactNode },
  render: () => (
    <ThemeProvider defaultTheme="light" storageKey="cohabit.story.theme">
      <StoryComponent />
    </ThemeProvider>
  ),
}
