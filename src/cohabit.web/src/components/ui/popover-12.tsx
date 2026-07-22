import type { ReactNode } from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface MessagePopoverProps {
  name: string
  type: string
  status: string
  pinned?: boolean
  children: ReactNode
}

export function MessagePopover({
  name,
  type,
  status,
  pinned,
  children,
}: MessagePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[360px] rounded-xl border border-border/60 bg-popover p-5 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-base leading-tight font-semibold tracking-tight text-foreground">
              {name}
            </p>
            <Badge
              variant="outline"
              className="rounded-md border-accent/20 bg-accent/5 px-1.5 py-0.5 text-[9px] font-bold text-accent"
            >
              {type}
            </Badge>
            {pinned && (
              <span className="text-[9px] font-bold text-muted-foreground/60">
                Pinned
              </span>
            )}
          </div>
          <p className="text-[11px] leading-relaxed font-normal text-muted-foreground">
            {status}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
