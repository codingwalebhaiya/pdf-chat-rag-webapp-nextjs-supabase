"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, FileText, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface PDFUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PDFUploadModal({ isOpen, onClose }: PDFUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file || file.type !== "application/pdf") {
        alert("Please upload a PDF file")
        return
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        // Create conversation record
        const { data: conversation, error: conversationError } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            title: file.name.replace(".pdf", ""),
          })
          .select()
          .single()

        if (conversationError) throw conversationError

        // Upload PDF to Supabase Storage
        const filePath = `${user.id}/${conversation.id}/${file.name}`
        const { error: uploadError } = await supabase.storage
          .from("pdfs")
          .upload(filePath, file, {
            onUploadProgress: (progress: any) => {
              const percent = (progress.loaded / progress.total) * 100
              setUploadProgress(percent)
            },
          } as any)

        if (uploadError) throw uploadError

        // Navigate to conversation
        router.push(`/c/${conversation.id}`)
        onClose()
      } catch (error) {
        console.error("Upload error:", error)
        alert("Failed to upload PDF")
      } finally {
        setIsUploading(false)
        setIsDragging(false)
      }
    },
    [supabase, router, onClose]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileUpload(file)
    },
    [handleFileUpload]
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-xl font-semibold text-card-foreground">
          Upload PDF
        </h2>

        {/* Upload Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input")?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />

          {isUploading ? (
            <div className="text-center">
              <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-primary" />
              <p className="mb-1 font-medium text-card-foreground">
                Drop your PDF here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
