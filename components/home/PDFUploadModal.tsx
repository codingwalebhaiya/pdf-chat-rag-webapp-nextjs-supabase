"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PDFUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PDFUploadModal({ isOpen, onClose }: PDFUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file || file.type !== "application/pdf") {
        toast.error("Please upload a PDF file")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Maximum file size is 5MB");
        return;
      }
      setIsUploading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();


        if (userError || !user) {
          throw new Error("You must be logged in");
        }

        const userId = user.id;
        const documentId = crypto.randomUUID();
        const storagePath = `${userId}/${documentId}/${file.name}`;
        const backetName = "pdfs"

        const { error: uploadError } = await supabase.storage
          .from(backetName)
          .upload(storagePath, file, {
            contentType: "application/pdf",
            upsert: false,
            cacheControl: '3600'
          });

        if (uploadError) throw uploadError;


        const res = await fetch('/api/chat/new-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId,
            fileName: file.name,
            userId,
            mimeType: file.type,
            fileSize: file.size,
            storagePath,
            backetName
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to create new chat');
        }
        toast.success("Uploaded! Processing PDF…");
        onClose();
        const { chatId } = await res.json();
        router.push(`/c/${chatId}`);


      } catch (err: any) {
        toast.error(err.message)

      } finally {
        setIsUploading(false)
      }
    },
    [supabase]
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
                {/* Uploading... {Math.round(uploadProgress)}% */}
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
