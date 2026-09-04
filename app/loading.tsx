export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-2">
        {/* Tailwind animated spinner */}
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm font-medium text-slate-600">Loading application...</p>
      </div>
    </div>
  );
}
