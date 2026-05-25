"use client";

export default function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
      <div className="bg-accent rounded-lg px-6 py-4 flex items-center gap-3 shadow-lg">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <span className="text-sm font-medium">Preparing invoices…</span>
      </div>
    </div>
  );
}