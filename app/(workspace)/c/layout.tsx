import Sidebar from "@/components/layout/Sidebar"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-hidden">
        <Sidebar />
        {children}
      </div>
    </div>
  )
}
