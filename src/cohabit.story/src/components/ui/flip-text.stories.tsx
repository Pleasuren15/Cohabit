import type { Meta, StoryObj } from "@storybook/react"

import { FlipText } from "./flip-text"

const meta = {
  title: "ui/FlipText",
  component: FlipText,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof FlipText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "Cohabit shared living",
  },
}

export const Together: Story = {
  args: {
    children: "Cohabit shared living",
    together: true,
  },
}

export const NoLoop: Story = {
  args: {
    children: "Cohabit shared living",
    loop: false,
  },
}

export const CustomSeparator: Story = {
  args: {
    children: "Cohabit · Shared · Living",
    separator: " · ",
  },
}
