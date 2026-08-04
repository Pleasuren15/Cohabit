import type { Meta, StoryObj } from "@storybook/react"
import { Apple, Globe } from "lucide-react"

import { Auth3, type Auth3SocialProvider } from "./auth-03"

const socialProviders: Auth3SocialProvider[] = [
  { id: "apple", label: "Apple", icon: <Apple className="size-4" /> },
  { id: "google", label: "Google", icon: <Globe className="size-4" /> },
]

const meta = {
  title: "ui/Auth3",
  component: Auth3,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Auth3>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSocialProviders: Story = {
  args: {
    socialProviders,
    onSignIn: (email, password) => {
      console.log("Sign in", email, password)
    },
    onSignUp: (name, email, password) => {
      console.log("Sign up", name, email, password)
    },
    onForgotPassword: () => console.log("Forgot password"),
  },
}

export const DefaultTabSignUp: Story = {
  args: {
    socialProviders,
    defaultTab: "signup",
    dividerText: "or continue with",
  },
}
