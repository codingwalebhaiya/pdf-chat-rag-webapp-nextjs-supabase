"use client";

import { FileText, Columns2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "both" | "pdf" | "chat";

interface ViewSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewSwitcher({
  viewMode,
  onViewModeChange,
  className,
}: ViewSwitcherProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl bg-muted/60 p-1 backdrop-blur-sm border border-border/40 shadow-xs",
        className
      )}
      role="group"
      aria-label="Workspace View Mode"
    >
      {/* PDF Only */}
      <button
        type="button"
        onClick={() => onViewModeChange("pdf")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all duration-200",
          viewMode === "pdf"
            ? "bg-background text-foreground shadow-xs shadow-black/10 font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
        )}
        title="View PDF Only"
      >
        <FileText className="h-3.5 w-3.5" />
        <span>PDF</span>
        <span className="hidden sm:inline">Only</span>
      </button>

      {/* Both (Split View) - Visible only on large desktop screens (>= lg) */}
      <button
        type="button"
        onClick={() => onViewModeChange("both")}
        className={cn(
          "hidden lg:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
          viewMode === "both"
            ? "bg-background text-foreground shadow-xs shadow-black/10 font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
        )}
        title="View Split Screen (Both PDF and Chat)"
      >
        <Columns2 className="h-3.5 w-3.5" />
        <span>Both</span>
      </button>

      {/* Chat Only */}
      <button
        type="button"
        onClick={() => onViewModeChange("chat")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all duration-200",
          viewMode === "chat"
            ? "bg-background text-foreground shadow-xs shadow-black/10 font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
        )}
        title="View Chat Only"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span>Chat</span>
        <span className="hidden sm:inline">Only</span>
      </button>
    </div>
  );
}
