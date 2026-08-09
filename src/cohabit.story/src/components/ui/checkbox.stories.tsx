import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, screen, userEvent } from "storybook/test"

import { Checkbox } from "./checkbox"
import { Label } from "./label"

function CheckboxDemo() {
  const [checked, setChecked] = useState(false)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id="dont-ask-again"
          checked={checked}
          onCheckedChange={(value) => setChecked(Boolean(value))}
        />
        <Label htmlFor="dont-ask-again">Don't ask again</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="default-checked" defaultChecked />
        <Label htmlFor="default-checked">Default checked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="disabled" disabled />
        <Label htmlFor="disabled">Disabled</Label>
      </div>
      <p className="text-sm text-muted-foreground">
        Status: {checked ? "checked" : "unchecked"}
      </p>
    </div>
  )
}

const meta = {
  title: "ui/Checkbox",
  component: CheckboxDemo,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof CheckboxDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <CheckboxDemo />,
  play: async () => {
    await expect(screen.getByText("Status: unchecked")).toBeVisible()
    await userEvent.click(screen.getByLabelText("Don't ask again"))
    await expect(screen.getByText("Status: checked")).toBeVisible()
    await expect(screen.getByLabelText("Disabled")).toBeDisabled()
  },
}

export const Checked: Story = {
  render: () => <CheckboxDemo />,
  play: async () => {
    await userEvent.click(screen.getByLabelText("Don't ask again"))
    await expect(screen.getByLabelText("Don't ask again")).toBeChecked()
  },
}
