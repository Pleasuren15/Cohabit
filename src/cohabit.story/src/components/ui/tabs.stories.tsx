import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { Home, User, Settings } from "lucide-react"
import { useState } from "react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"

const meta = {
  title: "ui/Tabs",
  component: Tabs,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Tabs defaultValue="rent">
        <TabsList>
          <TabsTrigger value="rent">Rent</TabsTrigger>
          <TabsTrigger value="groceries">Groceries</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
        </TabsList>
        <TabsContent value="rent">$1,800 split three ways.</TabsContent>
        <TabsContent value="groceries">Weekly shop around $120.</TabsContent>
        <TabsContent value="utilities">Internet and hydro included.</TabsContent>
      </Tabs>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const groceries = canvas.getByRole("tab", { name: "Groceries" })
    await userEvent.click(groceries)
    await expect(groceries).toHaveAttribute("aria-selected", "true")
    await expect(
      canvas.getByText("Weekly shop around $120."),
    ).toBeVisible()
  },
}

export const WithIcons: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">
            <Home />
            Home
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User />
            Profile
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings />
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="home">Household overview.</TabsContent>
        <TabsContent value="profile">Your profile.</TabsContent>
        <TabsContent value="settings">App settings.</TabsContent>
      </Tabs>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Tabs defaultValue="chores">
        <TabsList>
          <TabsTrigger value="chores">Chores</TabsTrigger>
          <TabsTrigger value="bills" disabled>
            Bills
          </TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="chores">Dishes rota and garden duty.</TabsContent>
        <TabsContent value="notes">Shared household notes.</TabsContent>
      </Tabs>
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("inbox")
    return (
      <div className="w-full max-w-md">
        <Tabs value={value} onValueChange={setValue}>
          <TabsList>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>
          <TabsContent value="inbox">
            Messages from housemates.
          </TabsContent>
          <TabsContent value="sent">Outgoing messages.</TabsContent>
          <TabsContent value="archive">Old conversations.</TabsContent>
        </Tabs>
        <p className="mt-4 text-sm text-muted-foreground">
          Active tab: {value}
        </p>
      </div>
    )
  },
}
