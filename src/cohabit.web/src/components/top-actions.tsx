import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { User, X } from "lucide-react"
import { PROVINCE_SHAPES } from "@/lib/province-shapes"
import { PROVINCES } from "@/lib/provinces"
import { cn } from "@/lib/utils"

interface TopActionsProps {
  province: string
  setProvince: (key: string) => void
  onOpenAuth: () => void
}

export function TopActions({
  province,
  setProvince,
  onOpenAuth,
}: TopActionsProps) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <>
      {/* Floating group — province badge + account button */}
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
        {/* Province badge */}
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="flex h-10 items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-3 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-opacity hover:opacity-80"
          aria-label="Change province"
        >
          <img
            src={PROVINCE_SHAPES[province]}
            alt={`${province.toUpperCase()} province`}
            className="h-5 w-5 object-contain drop-shadow-sm"
          />
          <span className="whitespace-nowrap leading-none">
            {province.toUpperCase()}
          </span>
        </button>

        {/* Account button */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Account"
        >
          <User className="size-5" />
        </button>
      </div>

      {/* Province picker overlay */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setShowPicker(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md rounded-t-2xl border border-border bg-background p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Select Province</h2>
                <button
                  type="button"
                  onClick={() => setShowPicker(false)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Province grid */}
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(PROVINCES).map(([key, name]) => {
                  const isActive = key === province
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setProvince(key)
                        setShowPicker(false)
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all",
                        isActive
                          ? "border-accent bg-accent/5 text-accent"
                          : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
                      )}
                    >
                      <img
                        src={PROVINCE_SHAPES[key]}
                        alt=""
                        aria-hidden="true"
                        className="h-8 w-8 object-contain drop-shadow-sm"
                      />
                      <span className="text-[10px] font-medium leading-tight text-center">
                        {name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
