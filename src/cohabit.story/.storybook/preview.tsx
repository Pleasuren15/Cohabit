import type { Preview, Decorator } from "@storybook/react"
import { withThemeByClassName } from "@storybook/addon-themes"
import "../src/index.css"

const withLayoutDecorator: Decorator = (Story) => {
  return (
    <div className="flex min-h-screen w-full items-start justify-center bg-background p-6 text-foreground">
      <Story />
    </div>
  )
}

const preview: Preview = {
  decorators: [
    withLayoutDecorator,
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
      parentSelector: "html",
    }),
  ],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "error",
    },
    backgrounds: {
      disable: true,
    },
  },
  tags: ["autodocs"],
}

export default preview
