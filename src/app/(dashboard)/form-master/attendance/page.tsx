import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFormMasterClasses, getActiveTerm } from "@/actions/grading";
import { getClassAttendanceByDate } from "@/actions/attendance";
import ClientAttendanceTable from "./ClientAttendanceTable";
import { Calendar } from "lucide-react";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const roles = session.user.roles || [];
  if (!roles.includes("FORM_MASTER") && !roles.includes("ADMIN")) redirect("/student");

  const classes = await getFormMasterClasses(session.user.id);
  const schoolId = classes[0]?.schoolId || "";
  const term = await getActiveTerm(schoolId);

  if (!term || classes.length === 0) {
    return (
      <div className="container py-10">
        <p className="text-muted-foreground text-center py-20 border border-dashed border-white/10 rounded-2xl">
          No active term or assigned class found. Contact your administrator.
        </p>
      </div>
    );
  }

  const activeClass = classes[0];

  // Default to today (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = searchParams.date || today;

  const attendanceData = await getClassAttendanceByDate(activeClass.id, term.id, selectedDate);

  return (
    <div className="container py-10 space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent w-fit">
            Daily Attendance
          </h1>
          <p className="text-muted-foreground mt-1">
            Track student attendance for <span className="text-foreground font-medium">{activeClass.name}</span>
          </p>
        </div>

        {/* ── Date Picker Form ── */}
        <form className="flex items-center gap-3 bg-white/[0.02] border border-white/10 p-2 rounded-xl backdrop-blur-sm">
          <Calendar className="w-5 h-5 text-sky-400 ml-2" />
          <input
            type="date"
            name="date"
            defaultValue={selectedDate}
            className="bg-transparent text-foreground border-none focus:ring-0 px-2 cursor-pointer outline-none [color-scheme:dark]"
            onChange={(e) => {
              if (e.target.value) {
                e.target.form?.submit();
              }
            }}
          />
        </form>
      </div>

      {attendanceData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl text-center">
          <p className="text-muted-foreground">No students enrolled in this class for the active term.</p>
        </div>
      ) : (
        <ClientAttendanceTable initialData={attendanceData} dateStr={selectedDate} />
      )}
    </div>
  );
}
