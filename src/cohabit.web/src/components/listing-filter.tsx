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
        className="absolute -top-2 left-3 z-10 bg-white px-1.5 text-[11px] font-semibold text-zinc-500 transition-colors group-focus-within:text-zinc-900 dark:bg-zinc-950 dark:text-zinc-500 dark:group-focus-within:text-zinc-100"
      >
        Type
      </label>
      <NativeSelect
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-200 shadow-xs transition-all focus-within:ring-2 focus-within:ring-zinc-400/20 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-within:ring-zinc-500/20 dark:[&_select]:bg-zinc-950 dark:[&_select]:[color-scheme:dark]"
      >
        {OPTIONS.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="dark:bg-zinc-950 dark:text-zinc-100"
          >
            {opt.label}
          </option>
        ))}
      </NativeSelect>
    </div>
  )
}
