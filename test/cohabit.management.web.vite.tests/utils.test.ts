import { describe, expect, it } from "vitest"
import { cn } from "@/lib/utils"

describe("cn utility", () => {
  it.each([
    { args: ["a", "b", "c"], expected: "a b c" },
    { args: ["", "a"], expected: "a" },
    { args: [null, "a", undefined, "b"], expected: "a b" },
    { args: [false, "a", 0, "b"], expected: "a b" },
    { args: [], expected: "" },
  ])("joins $args into '$expected'", ({ args, expected }) => {
    expect(cn(...args)).toBe(expected)
  })

  it.each([
    { args: ["px-2", "px-3"], expected: "px-3" },
    { args: ["text-sm", "text-lg", "font-bold"], expected: "text-lg font-bold" },
    { args: ["bg-red-500", "hover:bg-red-600"], expected: "bg-red-500 hover:bg-red-600" },
  ])("resolves conflicting Tailwind classes in $args", ({ args, expected }) => {
    expect(cn(...args)).toBe(expected)
  })
})
