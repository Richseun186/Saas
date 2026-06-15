import { getAdminDashboardData, setupDemoEnvironment } from "@/actions/admin";
import { revalidatePath } from "next/cache";

export default async function AdminDashboard() {
  const data = await getAdminDashboardData();
  const isSetup = !!data.school;

  return (
    <div className="container py-8 animate-fade-in space-y-8">
      <div className="flex flex-col gap-2 border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your school profile, sessions, terms, and subject offerings.
        </p>
      </div>

      {!isSetup ? (
        <div className="rounded-xl border bg-teal-50/50 p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold text-teal-900">Welcome to GradeSync Nigeria!</h2>
          <p className="text-teal-700 max-w-md mx-auto">
            Your database is currently empty. Click the button below to instantly seed a Demo School, a Term, a Class (JSS 1A), a Teacher, and 3 Students.
          </p>
          <form action={async () => {
            "use server";
            await setupDemoEnvironment();
          }}>
            <button className="bg-teal-600 text-white px-6 py-2 rounded-md font-medium hover:bg-teal-700 transition-colors">
              Initialize Demo Environment
            </button>
          </form>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
            <h3 className="font-semibold text-lg mb-1">School Profile</h3>
            <p className="text-2xl font-bold text-teal-700 truncate">{data.school?.name}</p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
            <h3 className="font-semibold text-lg mb-1">Active Term</h3>
            <p className="text-2xl font-bold text-teal-700 truncate">{data.term?.name}</p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
            <h3 className="font-semibold text-lg mb-1">Total Classes</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{data.stats.classes}</p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
            <h3 className="font-semibold text-lg mb-1">Total Students</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{data.stats.students}</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950 flex flex-col items-center justify-center min-h-[200px] text-center space-y-4 mt-8 opacity-70">
        <h3 className="font-semibold text-lg">Full Admin Panel Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          In a full production environment, this area would contain tables and forms for manual data entry of students, staff, and subjects. For this demo, please use the Form Master and Student dashboards to see the core value loop.
        </p>
      </div>
    </div>
  );
}
