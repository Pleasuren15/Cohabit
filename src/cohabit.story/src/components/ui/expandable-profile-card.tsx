import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface Profile {
  name: string
  role?: string
  location?: string
  bio?: string
  avatarUrl?: string
  tags?: string[]
}

export interface ExpandableProfileCardProps {
  profile: Profile
  defaultExpanded?: boolean
}

export function ExpandableProfileCard({
  profile,
  defaultExpanded = false,
}: ExpandableProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const { name, role, location, bio, avatarUrl, tags } = profile

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10">
      <div className="flex items-start gap-3 p-4">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={name}
            className="size-12 shrink-0 rounded-full object-cover ring-2 ring-accent/20"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{name}</p>
          {role && (
            <p className="truncate text-sm text-muted-foreground">{role}</p>
          )}
          {location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse profile" : "Expand profile"}
          className="shrink-0"
        >
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="inline-flex"
          >
            <ChevronDown />
          </motion.span>
        </Button>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && bio && (
          <motion.div
            key="profile-bio"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50 p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {bio}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
