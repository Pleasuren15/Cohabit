import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

export interface ProfileData {
  fullName: string
  email: string
  cellphone: string
  dateOfBirth: string
  gender: string
  title: string
  address?: string
  avatarUrl: string
}

export interface EditProfileProps {
  isOpen: boolean
  onClose: () => void
  initialData: ProfileData
  onSave: (data: ProfileData) => void
}

export function EditProfile({
  isOpen,
  onClose,
  initialData,
  onSave,
}: EditProfileProps) {
  const [formData, setFormData] = useState<ProfileData>(initialData)

  useEffect(() => {
    if (isOpen) setFormData(initialData)
  }, [isOpen, initialData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
              mass: 0.8,
            }}
            className="pointer-events-auto relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Edit your profile
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                onSave(formData)
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="ep-fullName">Full name</Label>
                <Input
                  id="ep-fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  className="font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-email">Email</Label>
                <Input
                  id="ep-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-cellphone">Cellphone</Label>
                <Input
                  id="ep-cellphone"
                  name="cellphone"
                  value={formData.cellphone}
                  onChange={handleChange}
                  className="font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-dateOfBirth">Date of birth</Label>
                <Input
                  id="ep-dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-gender">Gender</Label>
                <Select
                  value={formData.gender || undefined}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger id="ep-gender" className="w-full font-semibold">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-title">Bio</Label>
                <textarea
                  id="ep-title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  rows={3}
                  className="flex min-h-20 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-all placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-address">Address</Label>
                <Input
                  id="ep-address"
                  name="address"
                  value={formData.address ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. 12 Main Road, Cape Town"
                  className="font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-avatarUrl">Avatar URL</Label>
                <Input
                  id="ep-avatarUrl"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="font-semibold"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="text-xs text-muted-foreground">
                  Personal details
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save changes</Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
