"use client";

import { useState } from "react";
import { Loader2, ExternalLink, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  signedUrl: string | null;
  fileName?: string;
  isLoading?: boolean;
  className?: string;
}

export function PDFViewer({
  signedUrl,
  fileName,
  isLoading,
  className,
}: PDFViewerProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Viewer Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {fileName || "Document"}
          </span>
        </div>

        {signedUrl && (
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-md transition-colors"
              title="Open in new window"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open in Tab</span>
            </a>
          </div>
        )}
      </div>

      {/* PDF Display Container */}
      <div className="relative flex-1 w-full h-full bg-slate-950/40">
        {/* Loading state */}
        {(isLoading || (!iframeLoaded && signedUrl && !iframeError)) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-xs">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground animate-pulse">
              Loading document from secure storage...
            </p>
          </div>
        )}

        {/* Error state */}
        {iframeError ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
            <div className="p-3 rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              Unable to load PDF preview
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              The secure link may have expired or your browser blocked the preview.
            </p>
            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open PDF in new tab
              </a>
            )}
          </div>
        ) : signedUrl ? (
          <iframe
            src={`${signedUrl}#toolbar=1&navpanes=0`}
            title={fileName || "PDF Document Viewer"}
            className="w-full h-full border-0"
            onLoad={() => setIframeLoaded(true)}
            onError={() => setIframeError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-2 text-muted-foreground">
            <FileText className="h-10 w-10 stroke-1" />
            <p className="text-xs">Document preview unavailable</p>
          </div>
        )}
      </div>
    </div>
  );
}
