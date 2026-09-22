export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      {children}
    </div>
  );
}
