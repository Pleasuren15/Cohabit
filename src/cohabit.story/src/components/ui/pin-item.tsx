import { MapPin, Pin } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface PinItemProps {
  title: string
  subtitle?: string
  address?: string
  price?: string
  imageSrc?: string
  pinned?: boolean
  onPinToggle?: () => void
}

export function PinItem({
  title,
  subtitle,
  address,
  price,
  imageSrc,
  pinned = false,
  onPinToggle,
}: PinItemProps) {
  return (
    <div className="flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10">
      {imageSrc && (
        <img
          src={imageSrc}
          alt={title}
          className="size-14 shrink-0 rounded-lg object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {title}
          </p>
          {price && (
            <span className="shrink-0 text-sm font-bold text-accent">
              {price}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
        {address && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{address}</span>
          </p>
        )}
      </div>
      {onPinToggle && (
        <Button
          type="button"
          variant={pinned ? "default" : "ghost"}
          size="icon-sm"
          onClick={onPinToggle}
          aria-pressed={pinned}
          aria-label={pinned ? "Unpin item" : "Pin item"}
          className="shrink-0"
        >
          <Pin className={cn(pinned && "fill-current")} />
        </Button>
      )}
    </div>
  )
}
