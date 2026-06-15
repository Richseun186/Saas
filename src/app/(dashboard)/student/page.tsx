export default function StudentDashboard() {
  return (
    <div className="container py-8 animate-fade-in space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">
          View your academic performance and term report cards.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Your Report Card will appear here</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
            Once results are published for the current term, you will be able to view and print your full report card.
          </p>
        </div>
      </div>
    </div>
  );
}
