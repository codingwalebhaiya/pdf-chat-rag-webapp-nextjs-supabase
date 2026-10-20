"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  SquarePen,
  MessageSquare,
  FileText,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  User,
  Settings,
  ChevronRight,
} from "lucide-react"

import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PDFUploadModal } from "@/components/home/PDFUploadModal"
import { logout } from "@/app/actions/auth-actions"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn, getInitials } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface IChat {
  id: string
  userId: string
  documentId: string
  title: string
  createdAt: Date
  updatedAt: Date
}

interface IProfile {
  email: string
  name: string
  id: string
  userId: string
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

interface SidebarClientProps {
  profile: IProfile | null | undefined
  chats: IChat[] | null
}

function ActionTooltip({
  label,
  children,
  side = "right",
  disabled = false,
}: {
  label: string
  children: React.ReactNode
  side?: "right" | "top" | "bottom" | "left"
  disabled?: boolean
}) {
  if (disabled) return <>{children}</>
  return (
    <Tooltip delayDuration={50}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        sideOffset={10}
        className="z-50 rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-md"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export function SidebarClient({ profile, chats }: SidebarClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { theme, setTheme } = useTheme()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

  // Initialize from localStorage on client mount
  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem("sidebar_expanded")
    if (saved !== null) {
      setIsExpanded(saved === "true")
    }
  }, [])

  // Auto-collapse on mobile route navigation
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false)
    }
  }, [pathname, isMobile])

  const toggleExpanded = () => {
    const nextState = !isExpanded
    setIsExpanded(nextState)
    localStorage.setItem("sidebar_expanded", String(nextState))
  }

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logout()

      if (result?.error) {
        toast.error("Logout failed")
        return
      }

      if (result?.success === true) {
        toast.success("Logged out successfully")
      }

      router.replace("/signin")
      router.refresh()
    })
  }

  const initials = profile?.name ? getInitials(profile.name) : "U"

  return (
    <TooltipProvider>
      {/* Mobile Floating Open Trigger when sidebar is closed */}
      {isMobile && !isExpanded && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={() => setIsExpanded(true)}
          className="fixed top-3 left-3 z-40 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-sidebar/95 text-sidebar-foreground shadow-sm backdrop-blur transition-all hover:bg-sidebar-accent"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </motion.button>
      )}

      {/* Mobile Backdrop Overlay */}
      {isMobile && isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs"
        />
      )}

      {/* Animated Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? (isExpanded ? 280 : 0) : isExpanded ? 260 : 60,
        }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 35,
        }}
        className={cn(
          "relative flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar text-sidebar-foreground select-none",
          isMobile ? "fixed inset-y-0 left-0 z-40 shadow-2xl" : "z-20"
        )}
      >
        {/* Top Header Row */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-3">
          {isExpanded ? (
            <>
              <Link
                href="/"
                onClick={() => {
                  if (isMobile) setIsExpanded(false)
                }}
                className="flex items-center gap-2 overflow-hidden px-1"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="truncate text-sm font-semibold text-sidebar-foreground"
                >
                  PDF Chat
                </motion.span>
              </Link>

              <ActionTooltip label="Close sidebar" side="bottom">
                <button
                  onClick={toggleExpanded}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  aria-label="Close sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </ActionTooltip>
            </>
          ) : (
            <div className="flex w-full justify-center">
              <ActionTooltip label="Open sidebar" side="right">
                <button
                  onClick={toggleExpanded}
                  className="group relative flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  aria-label="Open sidebar"
                >
                  {/* Default State: Logo icon */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 group-hover:scale-75 group-hover:opacity-0">
                    <FileText className="h-4 w-4" />
                  </div>

                  {/* Hover State: Open sidebar icon */}
                  <PanelLeft className="absolute h-5 w-5 scale-75 text-sidebar-foreground opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100" />
                </button>
              </ActionTooltip>
            </div>
          )}
        </div>

        {/* New Chat Action */}
        <div
          className={cn(
            "shrink-0",
            isExpanded ? "p-3" : "flex justify-center px-2 py-2"
          )}
        >
          {isExpanded ? (
            <button
              onClick={() => {
                if (isMobile) setIsExpanded(false)
                setIsUploadModalOpen(true)
              }}
              className="flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <SquarePen className="h-4 w-4 shrink-0" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="truncate"
              >
                New Chat
              </motion.span>
            </button>
          ) : (
            <ActionTooltip label="New chat" side="right">
              <button
                onClick={() => {
                  if (isMobile) setIsExpanded(false)
                  setIsUploadModalOpen(true)
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                aria-label="New chat"
              >
                <SquarePen className="h-4 w-4" />
              </button>
            </ActionTooltip>
          )}
        </div>

        {/* chats List */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {isExpanded && (
            <div className="space-y-0.5">
              {chats?.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No chats yet
                </div>
              ) : (
                chats?.map((chat) => {
                  const isActive = pathname === `/c/${chat.id}`
                  return (
                    <button
                      key={chat.id}
                      onClick={() => {
                        if (isMobile) setIsExpanded(false)
                        router.push(`/c/${chat.id}`)
                      }}
                      className={cn(
                        "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive &&
                          "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      )}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                      <span className="flex-1 truncate">{chat.title}</span>
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Bottom User Footer */}
        <div
          className={cn(
            "shrink-0 border-t border-border/40",
            isExpanded ? "p-3" : "flex justify-center px-2 py-3"
          )}
        >
          {isExpanded ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl p-1.5 text-left text-sidebar-foreground transition-colors outline-none hover:bg-sidebar-accent"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {profile?.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name || "User"}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-sidebar-foreground group-hover:text-sidebar-accent-foreground">
                      {profile?.name || "User"}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {profile?.email || "Free"}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                sideOffset={8}
                className="z-50 w-64 animate-in rounded-2xl border border-border bg-sidebar/95 p-1.5 text-sidebar-foreground shadow-2xl backdrop-blur-md fade-in-0 zoom-in-95"
              >
                {/* Top: Icon and User Name */}
                <DropdownMenuItem
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl p-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {profile?.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name || "User"}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-sidebar-foreground">
                      {profile?.name || "User"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {profile?.email || "Free"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                {/* Middle: Profile & Settings */}
                <DropdownMenuItem
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                {/* Bottom: Logout */}
                <DropdownMenuItem
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  disabled={isPending}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 text-destructive" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground transition-all outline-none hover:ring-2 hover:ring-primary/40"
                  aria-label={profile?.name || "User profile"}
                  title={profile?.name || "User profile"}
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name || "User"}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={14}
                className="z-50 w-64 animate-in rounded-2xl border border-border bg-sidebar/95 p-1.5 text-sidebar-foreground shadow-2xl backdrop-blur-md fade-in-0 zoom-in-95"
              >
                {/* Top: Icon and User Name */}
                <DropdownMenuItem
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl p-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {profile?.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name || "User"}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-sidebar-foreground">
                      {profile?.name || "User"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {profile?.email || "Free"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                {/* Middle: Profile & Settings */}
                <DropdownMenuItem
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                {/* Bottom: Logout */}
                <DropdownMenuItem
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  disabled={isPending}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 text-destructive" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </motion.aside>

      <PDFUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>Your personal account details</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary ring-4 ring-primary/20">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name || "User"}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="text-center">
              <h3 className="text-base font-semibold text-foreground">
                {profile?.name || "User"}
              </h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>

            <div className="w-full space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-primary">Free Tier</span>
              </div>
              <div className="flex justify-between border-t border-border/40 py-1">
                <span className="text-muted-foreground">Account ID</span>
                <span className="font-mono text-muted-foreground">
                  {profile?.id?.slice(0, 8) || "N/A"}...
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your interface preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <label className="text-sm font-medium text-foreground">
                Appearance
              </label>
              <p className="mb-3 text-xs text-muted-foreground">
                Customize the theme of the application.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["light", "dark", "system"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTheme(mode)}
                    className={cn(
                      "flex cursor-pointer items-center justify-center rounded-lg border py-2 text-xs font-medium capitalize transition-colors",
                      (isMounted ? theme === mode : mode === "system")
                        ? "border-primary bg-primary/10 font-semibold text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Modal */}
      <Dialog open={isLogoutConfirmOpen} onOpenChange={setIsLogoutConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="items-center text-center sm:text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <LogOut className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold sm:text-xl">
              Are you sure you want to log out?
            </DialogTitle>
            <DialogDescription className="text-center text-xs sm:text-sm">
              You will need to sign in again to access your conversations and
              documents.
            </DialogDescription>
          </DialogHeader>

          {/* User Profile Info Card */}
          <div className="my-2 flex items-center gap-3 rounded-xl border border-border/70 bg-muted/40 p-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-2 ring-primary/20">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name || "User"}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-foreground">
                {profile?.name || "Satyam Pandey"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {profile?.email || "moneymind144@gmail.com"}
              </p>
            </div>
          </div>

          {/* Actions: Log out / Cancel */}
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLogoutConfirmOpen(false)}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
              disabled={isPending}
              className="cursor-pointer gap-2"
            >
              <LogOut className={cn("h-4 w-4", isPending && "animate-spin")} />
              {isPending ? "Logging out..." : "Log out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
