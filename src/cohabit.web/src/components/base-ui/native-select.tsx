import { type SelectHTMLAttributes, forwardRef } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string
}

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div data-slot="native-select" className={cn("relative", className)}>
        <select
          ref={ref}
          data-slot="native-select-trigger"
          className="w-full appearance-none bg-transparent px-3 py-2.5 pr-8 text-sm text-foreground outline-none"
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-zinc-400" />
      </div>
    )
  }
)
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }
