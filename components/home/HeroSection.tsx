"use client"

import { useState } from "react"
import {
  FileText,
  Upload,
  Sparkles,
  Paperclip,
  ArrowUp,
  FileUp,
  Zap,
  ShieldCheck,
  Search,
} from "lucide-react"
import { PDFUploadModal } from "@/components/home/PDFUploadModal"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function HeroSection() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [query, setQuery] = useState("")

  const handlePromptSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (query.trim()) {
      toast.info("Please upload your PDF first to chat with it!")
    }
    setIsUploadOpen(true)
  }

  const samplePrompts = [
    "💡 Summarize key takeaways & insights",
    "📊 Extract numbers, data & financial tables",
    "📑 Find critical obligations & clauses",
  ]

  return (
    <div className="flex w-full flex-col items-center justify-center py-10 sm:py-14">
      <div className="w-full max-w-3xl text-center">
        {/* Brand Pill Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary shadow-xs backdrop-blur-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Gen Document Intelligence</span>
        </div>

        {/* Heading */}
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Chat with your PDF documents using AI
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Upload any document to summarize, analyze, and ask questions with
          instant, page-level citations.
        </p>

        {/* Interactive Dummy Chat & PDF Upload Container */}
        <div className="relative mx-auto mt-8 w-full rounded-2xl border border-border/80 bg-card/80 p-3 sm:p-5 shadow-xl backdrop-blur-md transition-all hover:border-border">
          {/* Upper Side: PDF Upload Dropzone */}
          <div
            onClick={() => setIsUploadOpen(true)}
            className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center transition-all duration-200 hover:border-primary/60 hover:bg-primary/5 sm:py-10"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
              <FileUp className="h-6 w-6" />
            </div>

            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              Click to upload or drag & drop your PDF
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports only PDF document up to 5MB • Secure & Private
            </p>

            {/* Sample Suggested Prompts Badges */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsUploadOpen(true)
                  }}
                  className="rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-accent hover:text-foreground cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Lower Side: Modern Chat Input Area with Button */}
          <form
            onSubmit={handlePromptSubmit}
            className="mt-3 flex items-center gap-2 rounded-xl border border-border/70 bg-background/90 p-1.5 shadow-xs transition-all focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-primary/20"
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
              title="Upload PDF document"
              aria-label="Upload PDF document"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Prompt Input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your document or upload above..."
              className="flex-1 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden"
            />

            {/* Send Button */}
            <button
              type="submit"
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 cursor-pointer",
                query.trim()
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              aria-label="Send query"
              title="Send query"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Feature Cards */}
        <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Instant Answers",
              desc: "Ask any question and receive accurate responses with citations in seconds.",
            },
            {
              icon: Search,
              title: "Deep RAG Retrieval",
              desc: "Vector search finds the exact paragraph and page matching your inquiry.",
            },
            {
              icon: ShieldCheck,
              title: "Private & Secure",
              desc: "Documents are encrypted in transit and isolated to your user account.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/60 bg-card/60 p-4 transition-all hover:border-border hover:bg-card/90"
            >
              <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
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

