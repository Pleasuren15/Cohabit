import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

afterEach(() => {
  cleanup()
})

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!("ResizeObserver" in window)) {
  // @ts-expect-error - assigning a mock for the missing browser API
  window.ResizeObserver = ResizeObserverMock
}

if (!("scrollIntoView" in window)) {
  window.HTMLElement.prototype.scrollIntoView = () => {}
}

for (const method of [
  "hasPointerCapture",
  "setPointerCapture",
  "releasePointerCapture",
] as const) {
  if (!(method in window.HTMLElement.prototype)) {
    Object.defineProperty(window.HTMLElement.prototype, method, {
      configurable: true,
      value: method === "hasPointerCapture" ? () => false : () => {},
    })
  }
}

const store = new Map<string, string>()
const localStorageMock: Storage = {
  get length() {
    return store.size
  },
  clear() {
    store.clear()
  },
  getItem(key: string) {
    return store.has(key) ? store.get(key)! : null
  },
  key(index: number) {
    return Array.from(store.keys())[index] ?? null
  },
  removeItem(key: string) {
    store.delete(key)
  },
  setItem(key: string, value: string) {
    store.set(key, String(value))
  },
}

if (typeof window !== "undefined" && !("localStorage" in window)) {
  // @ts-expect-error - installing the mock storage
  window.localStorage = localStorageMock
}
if (
  typeof globalThis !== "undefined" &&
  typeof globalThis.localStorage !== "object"
) {
  ;(globalThis as Record<string, unknown>).localStorage = localStorageMock
}
