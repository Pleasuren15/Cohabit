import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const TAB_SETS = [
  {
    name: "two plain tabs",
    defaultValue: "tab1",
    triggers: [
      { value: "tab1", label: "Tab 1", content: "Content 1" },
      { value: "tab2", label: "Tab 2", content: "Content 2" },
    ],
  },
  {
    name: "verification style tabs",
    defaultValue: "email",
    triggers: [
      { value: "phone", label: "Phone", content: "Phone info" },
      { value: "email", label: "Email", content: "Email info" },
      { value: "id", label: "ID", content: "ID info" },
    ],
  },
]

describe("Tabs data rendering", () => {
  it.each(TAB_SETS)(
    "renders every trigger and the default content for $name",
    ({ defaultValue, triggers }) => {
      render(
        <Tabs defaultValue={defaultValue}>
          <TabsList>
            {triggers.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {triggers.map((t) => (
            <TabsContent key={t.value} value={t.value}>
              {t.content}
            </TabsContent>
          ))}
        </Tabs>
      )

      for (const trigger of triggers) {
        expect(
          screen.getByRole("tab", { name: trigger.label })
        ).toBeInTheDocument()
      }

      const defaultTrigger = triggers.find(
        (t) => t.value === defaultValue
      )!
      expect(screen.getByText(defaultTrigger.content)).toBeInTheDocument()
    }
  )

  it.each(TAB_SETS)(
    "switches content when a tab is selected for $name",
    async ({ defaultValue, triggers }) => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue={defaultValue}>
          <TabsList>
            {triggers.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {triggers.map((t) => (
            <TabsContent key={t.value} value={t.value}>
              {t.content}
            </TabsContent>
          ))}
        </Tabs>
      )

      for (const trigger of triggers.filter(
        (t) => t.value !== defaultValue
      )) {
        await user.click(screen.getByRole("tab", { name: trigger.label }))
        expect(screen.getByText(trigger.content)).toBeInTheDocument()
      }
    }
  )
})
