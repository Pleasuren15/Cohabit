import React, { useRef, useState, useCallback } from "react"
import {
  CloudUpload,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  Trash2,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type FileStatus = "idle" | "uploading" | "success" | "error"

export interface FileItem {
  id: string
  file: File
  progress: number
  status: FileStatus
  errorMessage?: string
}

export interface FileUploadProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onDrop"
> {
  onFilesAdded?: (files: File[]) => void
  onFileRemove?: (id: string) => void
  maxFiles?: number
  maxSizeMB?: number
  accept?: string
  files?: FileItem[]
}

export function FileUpload({
  onFilesAdded,
  onFileRemove,
  maxFiles = 5,
  maxSizeMB = 10,
  accept,
  files = [],
  className,
  ...props
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFilesAdded?.(Array.from(e.dataTransfer.files))
      }
    },
    [onFilesAdded],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesAdded?.(Array.from(e.target.files))
      }
      if (fileInputRef.current) fileInputRef.current.value = ""
    },
    [onFilesAdded],
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image/")) return <FileImage className="text-primary h-4 w-4" />
    if (fileType.includes("pdf")) return <FileText className="text-destructive h-4 w-4" />
    if (fileType.includes("video/")) return <FileVideo className="text-secondary-foreground h-4 w-4" />
    if (fileType.includes("zip") || fileType.includes("archive")) return <FileArchive className="text-muted-foreground h-4 w-4" />
    return <File className="text-foreground h-4 w-4" />
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <div
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all",
          isDragging ? "border-accent scale-[1.01]" : "border-border hover:border-accent/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple={maxFiles > 1}
          accept={accept}
          onChange={handleFileSelect}
        />

        <div className="flex items-center gap-3 p-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CloudUpload className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Upload photos</p>
            <p className="text-xs text-muted-foreground">
              Tap to browse or drag & drop (max {maxSizeMB}MB each)
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {files.length}/{maxFiles}
          </span>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2"
            >
              <div className="shrink-0">{getFileIcon(fileItem.file.type)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{fileItem.file.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatFileSize(fileItem.file.size)}
                  {fileItem.status === "success" && (
                    <span className="ml-2 text-green-500">Uploaded</span>
                  )}
                </p>
              </div>
              {fileItem.status === "success" && (
                <CheckCircle2 className="size-3.5 shrink-0 text-green-500" />
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onFileRemove?.(fileItem.id) }}
                className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
