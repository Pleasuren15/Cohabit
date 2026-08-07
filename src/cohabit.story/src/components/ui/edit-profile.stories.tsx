import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"

import { Button } from "./button"
import { EditProfile, type ProfileData } from "./edit-profile"

const initialData: ProfileData = {
  fullName: "Lerato Nkosi",
  email: "lerato@example.co.za",
  cellphone: "+27 82 555 0147",
  dateOfBirth: "1994-03-17",
  gender: "female",
  title:
    "Product designer who loves plants, coffee and Sunday morning markets.",
  avatarUrl: "https://picsum.photos/seed/lerato/200/200",
}

const meta = {
  title: "ui/EditProfile",
  component: EditProfile,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof EditProfile>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    initialData,
    onSave: () => {},
  },
  render: () => {
    const [open, setOpen] = useState(true)
    const [saved, setSaved] = useState<string | null>(null)
    return (
      <div className="relative">
        <div className="flex flex-col items-center gap-4">
          <Button onClick={() => setOpen(true)}>Edit profile</Button>
          {saved && (
            <p className="text-sm text-muted-foreground">
              Saved changes for {saved}
            </p>
          )}
        </div>
        <EditProfile
          isOpen={open}
          onClose={() => setOpen(false)}
          initialData={initialData}
          onSave={(data) => {
            setSaved(data.fullName)
            setOpen(false)
          }}
        />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Edit profile" }))
    const name = await canvas.findByLabelText("Full name")
    await userEvent.clear(name)
    await userEvent.type(name, "Naledi Mokoena")
    await userEvent.click(canvas.getByRole("button", { name: /save/i }))
    await expect(
      await canvas.findByText("Saved changes for Naledi Mokoena"),
    ).toBeVisible()
  },
}

export const OpenedByButton: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    initialData,
    onSave: () => {},
  },
  render: () => {
    const [open, setOpen] = useState(false)
    const [saved, setSaved] = useState<string | null>(null)
    return (
      <div className="relative">
        <div className="flex flex-col items-center gap-4">
          <Button onClick={() => setOpen(true)}>Edit profile</Button>
          {saved && (
            <p className="text-sm text-muted-foreground">
              Saved changes for {saved}
            </p>
          )}
        </div>
        <EditProfile
          isOpen={open}
          onClose={() => setOpen(false)}
          initialData={initialData}
          onSave={(data) => {
            setSaved(data.fullName)
            setOpen(false)
          }}
        />
      </div>
    )
  },
}
