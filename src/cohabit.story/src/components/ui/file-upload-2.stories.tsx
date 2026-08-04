import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"

import { FileUpload, type FileItem, type FileStatus } from "./file-upload-2"

const meta = {
  title: "ui/FileUpload2",
  component: FileUpload,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

const makeItem = (
  name: string,
  type: string,
  size: number,
  status: FileStatus,
  id?: string,
): FileItem => ({
  id: id ?? name,
  file: new File([new Uint8Array(size)], name, { type }),
  progress: status === "success" ? 100 : status === "uploading" ? 55 : 0,
  status,
  errorMessage: status === "error" ? "File too large" : undefined,
})

export const Default: Story = {
  render: () => {
    const [files, setFiles] = useState<FileItem[]>([])
    return (
      <div className="w-[360px]">
        <FileUpload
          files={files}
          onFilesAdded={(added) =>
            setFiles((prev) => [
              ...prev,
              ...added.map((file) => ({
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                file,
                progress: 100,
                status: "success" as FileStatus,
              })),
            ])
          }
          onFileRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
          maxFiles={5}
          maxSizeMB={10}
          accept="image/*"
        />
      </div>
    )
  },
}

export const WithFiles: Story = {
  render: () => {
    const [files, setFiles] = useState<FileItem[]>([
      makeItem("bedroom.jpg", "image/jpeg", 245760, "success", "f1"),
      makeItem("bathroom.jpg", "image/jpeg", 512000, "uploading", "f2"),
      makeItem("floor-plan.pdf", "application/pdf", 1048576, "success", "f3"),
      makeItem("tour.mp4", "video/mp4", 5242880, "idle", "f4"),
      makeItem("photos.zip", "application/zip", 8388608, "idle", "f5"),
    ])
    return (
      <div className="w-[360px]">
        <FileUpload
          files={files}
          onFilesAdded={(added) =>
            setFiles((prev) => [
              ...prev,
              ...added.map((file) => ({
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                file,
                progress: 100,
                status: "success" as FileStatus,
              })),
            ])
          }
          onFileRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
          maxFiles={5}
          maxSizeMB={10}
          accept="image/*"
        />
      </div>
    )
  },
}

export const WithError: Story = {
  render: () => {
    const [files, setFiles] = useState<FileItem[]>([
      makeItem("document.pdf", "application/pdf", 31457280, "error", "e1"),
      makeItem("room.jpg", "image/jpeg", 734003, "success", "e2"),
    ])
    return (
      <div className="w-[360px]">
        <FileUpload
          files={files}
          onFilesAdded={(added) =>
            setFiles((prev) => [
              ...prev,
              ...added.map((file) => ({
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                file,
                progress: 100,
                status: "success" as FileStatus,
              })),
            ])
          }
          onFileRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
          maxFiles={5}
          maxSizeMB={10}
          accept="image/*"
        />
      </div>
    )
  },
}
