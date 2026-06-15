export default function FormMasterDashboard() {
  return (
    <div className="container py-8 animate-fade-in space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Form Master Dashboard</h1>
        <p className="text-muted-foreground">
          Enter continuous assessment and exam scores for your class.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Select a Class and Subject</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
            Choose from the dropdown above to load the Broadsheet and begin entering scores. (Integration coming soon)
          </p>
        </div>
      </div>
    </div>
  );
}
