"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ViewSwitcher, ViewMode } from "@/components/chat/ViewSwitcher";
import { PDFViewer } from "@/components/chat/PDFViewer";
import { ChatInterface, IMessage } from "@/components/chat/ChatInterface";
import { toast } from "sonner";

interface ChatPdfPageProps {
  params: Promise<{ chatId: string }>;
}

export default function ChatPdfPage({ params }: ChatPdfPageProps) {
  const { chatId } = use(params);

  const [chat, setChat] = useState<any>(null);
  const [document, setDocument] = useState<any>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [fileStatus, setFileStatus] = useState<string>("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("both");

  // Automatically enforce PDF or Chat on smaller screens (Mobile & Tablet)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode((prev) => (prev === "both" ? "chat" : prev));
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch initial chat details, document info, message history, and signed read URL
  const fetchChatData = useCallback(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
      const res = await fetch(`${baseUrl}/api/chats/${chatId}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load chat workspace");
      }

      const data = await res.json();
      if (data.success) {
        setChat(data.chat);
        setDocument(data.document);
        setSignedUrl(data.signedUrl);
        setMessages(data.messages || []);
        setFileStatus(data.document?.fileStatus || "pending");
      }
    } catch (err: any) {
      console.error("Error fetching chat data:", err);
      toast.error(err.message || "Failed to load chat data");
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  // Status polling: check document ingestion progress until complete or failed
  useEffect(() => {
    if (!chatId || fileStatus === "complete" || fileStatus === "failed") {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
        const res = await fetch(`${baseUrl}/api/chats/${chatId}/status`);

        if (!res.ok) return;

        const data = await res.json();
        if (data.success && data.status) {
          if (data.status !== fileStatus) {
            setFileStatus(data.status);

            if (data.status === "complete") {
              toast.success("PDF processing complete! You can now ask questions.");
              clearInterval(intervalId);
            } else if (data.status === "failed") {
              toast.error("Document ingestion pipeline failed.");
              clearInterval(intervalId);
            }
          }
        }
      } catch (pollErr) {
        console.warn("Status poll error:", pollErr);
      }
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Opening secure workspace...
        </p>
      </div>
    );
  }

  if (!chat && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-center p-6">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-semibold">Chat Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          This chat session could not be found or you may not have permission to view it.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Top Workspace Bar */}
      <header className="flex items-center justify-between gap-2 px-4 sm:px-6 py-2.5 border-b border-border/50 bg-card/40 backdrop-blur-md shrink-0">
        {/* Left: Document Info & Back Link */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <h1 className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[150px] sm:max-w-xs md:max-w-md">
              {document?.fileName || chat?.title || "Document Chat"}
            </h1>
          </div>

          {/* Ingestion Status Badge */}
          <div className="hidden sm:flex shrink-0">
            {fileStatus === "complete" ? (
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 gap-1.5 py-0.5 px-2"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>Ready</span>
              </Badge>
            ) : fileStatus === "failed" ? (
              <Badge variant="destructive" className="gap-1.5 py-0.5 px-2">
                <AlertCircle className="h-3 w-3" />
                <span>Failed</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 gap-1.5 py-0.5 px-2 animate-pulse"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Processing</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Right: Responsive Top View Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <ViewSwitcher
            viewMode={viewMode}
            onViewModeChange={(mode) => setViewMode(mode)}
          />
        </div>
      </header>

      {/* Main Workspace Dual/Single Pane Area */}
      <main className="flex-1 flex overflow-hidden p-2 sm:p-4 gap-3">
        {/* PDF Viewer Pane */}
        {(viewMode === "both" || viewMode === "pdf") && (
          <div
            className={
              viewMode === "both"
                ? "hidden lg:flex flex-1 h-full min-w-0 transition-all duration-300"
                : "flex flex-1 h-full min-w-0 transition-all duration-300"
            }
          >
            <PDFViewer
              signedUrl={signedUrl}
              fileName={document?.fileName}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Chat Interface Pane */}
        {(viewMode === "both" || viewMode === "chat") && (
          <div
            className={
              viewMode === "both"
                ? "flex flex-1 h-full min-w-0 transition-all duration-300"
                : "flex flex-1 h-full min-w-0 transition-all duration-300"
            }
          >
            <ChatInterface
              chatId={chatId}
              initialMessages={messages}
              fileStatus={fileStatus}
              fileName={document?.fileName}
            />
          </div>
        )}
      </main>
    </div>
  );
}