import { useId } from "react"

import { NativeSelect } from "@/components/base-ui/native-select"

export interface ListingFilterProps {
  value: string
  onChange: (value: string) => void
}

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "roommate", label: "Roommate" },
  { value: "rentals", label: "Rentals" },
]

export function ListingFilter({ value, onChange }: ListingFilterProps) {
  const id = useId()

  return (
    <div className="group relative w-full max-w-[160px] transition-all">
      <label
        htmlFor={id}
        className="absolute -top-2 left-3 z-10 bg-background px-1.5 text-[11px] font-semibold text-muted-foreground transition-colors group-focus-within:text-foreground"
      >
        Type
      </label>
      <NativeSelect
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background transition-all focus-within:ring-2 focus-within:ring-ring/20 dark:bg-background dark:[&_select]:bg-background dark:[&_select]:[color-scheme:dark]"
      >
        {OPTIONS.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="dark:bg-background dark:text-foreground"
          >
            {opt.label}
          </option>
        ))}
      </NativeSelect>
    </div>
  )
}
