import { ArrowLeft, MapPin, Star, User } from "lucide-react"

import { TwinOrbit } from "@/components/loading-ui/twin-orbit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export interface DetailListingHost {
  name: string
  avatarUrl?: string
}

export interface DetailListing {
  id: string
  title: string
  location: string
  address?: string
  price: number
  priceUnit?: string
  imageSrc?: string
  rating?: number
  reviews?: number
  type?: string
  amenities?: string[]
  description?: string
  host?: DetailListingHost
  availableFrom?: string
}

export interface DetailPageProps {
  listing?: DetailListing | null
  loading?: boolean
  onBack?: () => void
}

export function DetailPage({
  listing,
  loading = false,
  onBack,
}: DetailPageProps) {
  if (loading) {
    return (
      <div className="flex h-72 w-full max-w-md items-center justify-center">
        <TwinOrbit className="size-8 text-accent" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex h-72 w-full max-w-md flex-col items-center justify-center gap-2 overflow-hidden rounded-xl bg-card p-6 text-center text-sm text-card-foreground ring-1 ring-foreground/10">
        <MapPin className="size-8 text-muted-foreground" />
        <p className="font-medium">No listing found</p>
        <p className="max-w-56 text-muted-foreground">
          We couldn't find a listing matching your request.
        </p>
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack} className="mt-2">
            <ArrowLeft />
            Go back
          </Button>
        )}
      </div>
    )
  }

  const price = `R ${listing.price.toLocaleString("en-ZA")}`
  const priceUnit = listing.priceUnit ?? "/month"

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10">
      {listing.imageSrc && (
        <div className="relative h-52">
          <img
            src={listing.imageSrc}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="absolute top-3 left-3 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              aria-label="Go back"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          {listing.type && (
            <Badge className="absolute top-3 right-3">{listing.type}</Badge>
          )}
          <div className="absolute bottom-3 left-3 rounded-lg bg-background/90 px-2.5 py-1 backdrop-blur-sm">
            <p className="text-sm font-bold text-foreground">
              {price}
              <span className="ml-0.5 text-xs font-medium text-muted-foreground">
                {priceUnit}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1 p-4">
        <p className="text-lg font-medium text-foreground">{listing.title}</p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{listing.location}</span>
        </p>
        {(listing.rating !== undefined || listing.reviews !== undefined) && (
          <div className="flex items-center gap-1 pt-0.5 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-accent text-accent" />
            <span className="font-semibold text-foreground">
              {listing.rating ?? "—"}
            </span>
            {listing.reviews !== undefined && (
              <span>({listing.reviews} reviews)</span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 px-4 pb-4">
        {listing.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {listing.description}
          </p>
        )}

        <Separator />

        {listing.amenities && listing.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {listing.amenities.map((amenity) => (
              <Badge key={amenity} variant="secondary">
                {amenity}
              </Badge>
            ))}
          </div>
        )}

        {listing.availableFrom && (
          <p className="text-xs font-medium text-muted-foreground">
            Available from{" "}
            <span className="text-foreground">{listing.availableFrom}</span>
          </p>
        )}

        {listing.address && (
          <p className="text-xs text-muted-foreground">{listing.address}</p>
        )}

        {listing.host && (
          <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
            {listing.host.avatarUrl ? (
              <img
                src={listing.host.avatarUrl}
                alt={listing.host.name}
                className="size-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <User className="size-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {listing.host.name}
              </p>
              <p className="text-xs text-muted-foreground">Host</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
