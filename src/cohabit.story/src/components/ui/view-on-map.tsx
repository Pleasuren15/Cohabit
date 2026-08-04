import { MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"

export interface ViewOnMapProps {
  label?: string
  address?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export function ViewOnMap({
  label = "View on Map",
  address,
  className,
  disabled = false,
  onClick,
}: ViewOnMapProps) {
  const handleClick = () => {
    if (address) {
      window.open(
        `https://maps.google.com/?q=${encodeURIComponent(address)}`,
        "_blank",
        "noopener,noreferrer",
      )
    }
    onClick?.()
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      disabled={disabled}
      onClick={handleClick}
    >
      <MapPin className="text-accent" />
      {label}
    </Button>
  )
}
