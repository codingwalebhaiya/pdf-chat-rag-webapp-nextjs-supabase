import { AppSidebar } from "@/components/layout/AppSidebar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />
      <main className="relative flex-1 overflow-y-auto h-full">
        {children}
      </main>
    </div>
  )
}
