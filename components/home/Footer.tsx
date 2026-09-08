
export default function Footer() {
  return (
    <footer className="w-full py-6 text-center text-xs text-muted-foreground border-t border-border/40">
      <p>© {new Date().getFullYear()} PDF Chat • Intelligent Document Assistant</p>
    </footer>
  )
}