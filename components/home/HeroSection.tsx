"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Upload, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PDFUploadModal } from "@/components/home/PDFUploadModal"

export default function HeroSection() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-3xl text-center">
        {/* Logo/Brand */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-foreground">
            PDF Chat
          </h1>
        </div>

        {/* Tagline */}
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          Chat with your PDF documents using AI
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Upload any PDF and start asking questions. Get instant answers,
          summaries, and insights from your documents.
        </p>

        {/* Main CTA */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            onClick={() => setIsUploadOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="h-5 w-5" />
            Upload PDF
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "AI Powered",
              desc: "Get instant answers",
            },
            {
              icon: FileText,
              title: "PDF Support",
              desc: "Any PDF document",
            },
            { icon: Upload, title: "Easy Upload", desc: "Drag and drop" },
          ].map((feature, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card p-4 text-center"
            >
              <feature.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <h3 className="font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <PDFUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  )
}
