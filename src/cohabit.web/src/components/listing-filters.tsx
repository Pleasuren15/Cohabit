"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X, SlidersHorizontal, RotateCcw } from "lucide-react"
import {
  SEARCHABLE_AMENITIES,
  SEARCHABLE_RULES,
  type ListingFilters,
} from "@/lib/listing-utils"

interface ListingFiltersSheetProps {
  open: boolean
  onClose: () => void
  filters: ListingFilters
  onChange: (filters: ListingFilters) => void
}

const BED_OPTIONS = [
  { value: "", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
]

const BATH_OPTIONS = [
  { value: "", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
]

function ToggleChip({
  active,
  label,
  onToggle,
}: {
  active: boolean
  label: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-accent bg-accent text-white"
          : "border-border bg-background text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}

export function ListingFiltersSheet({
  open,
  onClose,
  filters,
  onChange,
}: ListingFiltersSheetProps) {
  const toggleItem = (
    key: "requireAmenities" | "requireRules",
    value: string
  ) => {
    const current = filters[key] ?? []
    onChange({
      ...filters,
      [key]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    })
  }

  const clearAll = () => onChange({})

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Filter listings"
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-t-3xl border border-border bg-background p-5 shadow-xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-accent" />
                <h2 className="text-base font-semibold">Filters</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Budget */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Monthly budget
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                      R
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder="Min"
                      value={filters.minPrice ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...filters,
                          minPrice:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                      aria-label="Minimum price"
                      className="w-full rounded-xl border border-border bg-background py-2.5 pr-3 pl-7 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                    />
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">
                      R
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder="Max"
                      value={filters.maxPrice ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...filters,
                          maxPrice:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                      aria-label="Maximum price"
                      className="w-full rounded-xl border border-border bg-background py-2.5 pr-3 pl-7 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                    />
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Bedrooms
                  </label>
                  <select
                    value={filters.minBeds ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        minBeds:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    aria-label="Minimum bedrooms"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 dark:bg-zinc-950 dark:[color-scheme:dark]"
                  >
                    {BED_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Bathrooms
                  </label>
                  <select
                    value={filters.minBaths ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        minBaths:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    aria-label="Minimum bathrooms"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 dark:bg-zinc-950 dark:[color-scheme:dark]"
                  >
                    {BATH_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Move-in */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Move in by
                </label>
                <input
                  type="date"
                  value={filters.moveInBy ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      moveInBy: e.target.value || undefined,
                    })
                  }
                  aria-label="Move in by date"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 dark:[color-scheme:dark]"
                />
                <p className="text-[11px] text-muted-foreground">
                  Only listings available from today up to this date.
                </p>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Must-have amenities
                </p>
                <div className="flex flex-wrap gap-2">
                  {SEARCHABLE_AMENITIES.map((a) => (
                    <ToggleChip
                      key={a}
                      label={a}
                      active={(filters.requireAmenities ?? []).includes(a)}
                      onToggle={() => toggleItem("requireAmenities", a)}
                    />
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Home rules
                </p>
                <div className="flex flex-wrap gap-2">
                  {SEARCHABLE_RULES.map((r) => (
                    <ToggleChip
                      key={r}
                      label={r}
                      active={(filters.requireRules ?? []).includes(r)}
                      onToggle={() => toggleItem("requireRules", r)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="size-3.5" />
                Clear all
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent/90"
              >
                Show results
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
