import { describe, expect, it } from "vitest"
import { cn } from "./utils"

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("btn", "btn-primary", "active")).toBe("btn btn-primary active")
  })

  it("deduplicates and merges tailwind classes", () => {
    expect(cn("text-sm", "text-lg", "font-bold")).toBe("text-lg font-bold")
  })
})
