
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
