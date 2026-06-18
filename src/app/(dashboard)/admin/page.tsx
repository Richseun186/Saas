import { getAdminDashboardData, setupDemoEnvironment } from "@/actions/admin";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function AdminDashboard() {
  const data = await getAdminDashboardData();
  const isSetup = !!data.school;

  return (
    <div className="container py-8 animate-fade-in space-y-8 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent w-fit">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to the GradeSync Nigeria administration portal.
        </p>
      </div>

      {!isSetup ? (
        <div className="glass-card rounded-2xl p-8 max-w-2xl animate-slide-up hover-lift mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-teal-500/20 p-4 rounded-xl text-teal-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Quick Setup</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Configure the initial school, terms, classes, and demo students.
              </p>
            </div>
          </div>

          <form action={async () => {
            "use server";
            await setupDemoEnvironment();
            revalidatePath("/admin");
          }}>
            <button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-90 text-white font-semibold rounded-lg px-6 py-3 shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all">
              Initialize Demo Environment
            </button>
          </form>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card rounded-xl p-6 hover-lift animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="font-semibold text-lg mb-1 text-foreground">School Profile</h3>
            <p className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent truncate">{data.school?.name}</p>
          </div>
          <div className="glass-card rounded-xl p-6 hover-lift animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="font-semibold text-lg mb-1 text-foreground">Active Term</h3>
            <p className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent truncate">{data.term?.name}</p>
          </div>
          <div className="glass-card rounded-xl p-6 hover-lift animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="font-semibold text-lg mb-1 text-foreground">Total Classes</h3>
            <p className="text-3xl font-bold text-slate-200">{data.stats.classes}</p>
          </div>
          <div className="glass-card rounded-xl p-6 hover-lift animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <h3 className="font-semibold text-lg mb-1 text-foreground">Total Students</h3>
            <p className="text-3xl font-bold text-slate-200">{data.stats.students}</p>
          </div>
        </div>
      )}

      <div className="glass-card rounded-xl p-6 space-y-4 mt-8">
        <h3 className="font-semibold text-lg text-foreground">Administration</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/allocations"
            className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-teal-500/10 hover:border-teal-500/30 p-5 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <p className="font-semibold text-foreground">Subject Allocations</p>
              <p className="text-xs text-muted-foreground mt-0.5">Assign teachers to subjects and classes</p>
            </div>
          </a>
          <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 opacity-50 cursor-not-allowed">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <p className="font-semibold text-foreground">Staff Management</p>
              <p className="text-xs text-muted-foreground mt-0.5">Coming soon</p>
            </div>
          </div>
          <Link href="/admin/fees" className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-emerald-500/10 hover:border-emerald-500/30 p-5 transition-all cursor-pointer">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <p className="font-semibold text-foreground">Fees & Payments</p>
              <p className="text-xs text-muted-foreground mt-0.5">Manage invoices</p>
            </div>
          </Link>
          <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 opacity-50 cursor-not-allowed">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div>
              <p className="font-semibold text-foreground">Report Cards</p>
              <p className="text-xs text-muted-foreground mt-0.5">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
