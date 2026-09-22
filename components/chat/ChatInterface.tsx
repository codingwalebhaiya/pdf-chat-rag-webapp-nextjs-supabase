"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sparkles, BookOpen, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ICitation {
  pageNumber: number;
  fileName: string;
}

export interface IMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: ICitation[] | null;
  createdAt?: string | Date;
}

interface ChatInterfaceProps {
  chatId: string;
  initialMessages?: IMessage[];
  fileStatus: "pending" | "processing" | "complete" | "failed" | string;
  fileName?: string;
  className?: string;
}

export function ChatInterface({
  chatId,
  initialMessages = [],
  fileStatus,
  fileName,
  className,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<IMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial messages when loaded
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Auto-focus input when fileStatus becomes complete
  useEffect(() => {
    if (fileStatus === "complete") {
      inputRef.current?.focus();
    }
  }, [fileStatus]);

  const isComplete = fileStatus === "complete";
  const isProcessing = fileStatus === "pending" || fileStatus === "processing";
  const isFailed = fileStatus === "failed";

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || isSending || !isComplete) return;

    setInput("");
    const userMessageId = crypto.randomUUID();

    // Optimistically add user message
    const userMessage: IMessage = {
      id: userMessageId,
      role: "user",
      content: query,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
      const res = await fetch(`${baseUrl}/api/chats/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          chatId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate answer");
      }

      const resData = await res.json();

      if (resData.success && resData.data) {
        const assistantMessage: IMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: resData.data.answer || "No response returned.",
          citations: resData.data.sources || [],
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Invalid response received from server");
      }
    } catch (err: any) {
      console.error("Query error:", err);
      toast.error(err.message || "Something went wrong while querying AI");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Top Banner / Ingestion Pipeline Status Notice */}
      {isProcessing && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <div className="flex-1">
            <span>RAG Ingestion in progress... </span>
            <span className="text-muted-foreground font-normal hidden sm:inline">
              Embedding document chunks into vector database. Chat input unlocks once ready.
            </span>
          </div>
        </div>
      )}

      {isFailed && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-destructive/10 border-b border-destructive/20 text-destructive text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Processing failed for this document. Please try re-uploading.</span>
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-semibold text-foreground">
                {isComplete ? "Document Ready!" : "Analyzing Document"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isComplete
                  ? `Ask any question to retrieve answers directly from "${fileName || "your PDF"}" with source citations.`
                  : "We are processing and indexing your PDF. Chat will unlock automatically as soon as it is finished."}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 text-sm",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 space-y-2.5 shadow-xs",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-xs"
                    : "bg-muted/70 text-foreground border border-border/40 rounded-tl-xs"
                )}
              >
                <div className="whitespace-pre-wrap leading-relaxed break-words text-xs sm:text-sm">
                  {msg.content}
                </div>

                {/* Citations / Sources */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-border/40 space-y-1.5">
                    <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Sources & Citations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((cite, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/80 text-[11px] font-medium text-foreground/80 border border-border/40"
                          title={`${cite.fileName} - Page ${cite.pageNumber}`}
                        >
                          Page {cite.pageNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="h-7 w-7 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* AI Thinking indicator */}
        {isSending && (
          <div className="flex gap-3 justify-start items-center text-xs text-muted-foreground animate-pulse">
            <div className="h-7 w-7 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 bg-muted/60 border border-border/40 rounded-2xl px-4 py-2.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>Searching document and generating answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-border/40 bg-muted/20">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isComplete || isSending}
            placeholder={
              isProcessing
                ? "Processing document... Chat input locked"
                : isFailed
                ? "Document indexing failed"
                : "Ask anything about this PDF..."
            }
            className={cn(
              "flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-border/50 bg-background/80 focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all",
              (!isComplete || isSending) && "opacity-60 cursor-not-allowed bg-muted/40"
            )}
          />

          <button
            type="submit"
            disabled={!isComplete || isSending || !input.trim()}
            className={cn(
              "inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-xs shrink-0",
              isComplete && !isSending && input.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            )}
            title={!isComplete ? "Chat unlocks when processing completes" : "Send query"}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isProcessing ? (
              <Clock className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
