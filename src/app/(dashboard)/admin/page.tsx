export default function AdminDashboard() {
  return (
    <div className="container py-8 animate-fade-in space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your school profile, sessions, terms, and subject offerings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder cards for admin functions */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
          <h3 className="font-semibold text-lg mb-2">School Profile</h3>
          <p className="text-sm text-muted-foreground">Configure name, address, and motto.</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
          <h3 className="font-semibold text-lg mb-2">Academic Sessions</h3>
          <p className="text-sm text-muted-foreground">Set current active session and term.</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
          <h3 className="font-semibold text-lg mb-2">Subject Management</h3>
          <p className="text-sm text-muted-foreground">Map curriculum subjects to classes.</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
          <h3 className="font-semibold text-lg mb-2">Staff & Roles</h3>
          <p className="text-sm text-muted-foreground">Assign Form Masters to specific classes.</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
          <h3 className="font-semibold text-lg mb-2">Student Registry</h3>
          <p className="text-sm text-muted-foreground">Enroll and manage student records.</p>
        </div>
      </div>
    </div>
  );
}
