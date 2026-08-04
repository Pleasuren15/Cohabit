import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Popover12({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover12" {...props} />
}

function Popover12Trigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover12-trigger" {...props} />
}

function Popover12Content({
  className,
  children,
  align = "center",
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover12-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-1.5 rounded-xl bg-foreground p-2.5 text-background shadow-lg ring-1 ring-accent/30 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        <PopoverPrimitive.Arrow className="z-50 size-3 fill-foreground" />
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function Popover12Anchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover12-anchor" {...props} />
}

function Popover12Header({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover12-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  )
}

function Popover12Title({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <div
      data-slot="popover12-title"
      className={cn("font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function Popover12Description({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover12-description"
      className={cn("text-background/60", className)}
      {...props}
    />
  )
}

function Popover12Close({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return (
    <PopoverPrimitive.Close
      data-slot="popover12-close"
      className={cn(
        "absolute top-2 right-2 flex size-5 items-center justify-center rounded-full text-background/50 transition-colors hover:bg-background/15 hover:text-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&_svg]:size-3",
        className
      )}
      {...props}
    >
      <XIcon />
    </PopoverPrimitive.Close>
  )
}

export {
  Popover12,
  Popover12Anchor,
  Popover12Close,
  Popover12Content,
  Popover12Description,
  Popover12Header,
  Popover12Title,
  Popover12Trigger,
}
