import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllocationsForSchool, getAllocationFormData, createAllocation, deleteAllocation } from "@/actions/subject-allocation";
import { db } from "@/lib/db";
import { Trash2, Plus, BookOpen, Users } from "lucide-react";

export default async function AllocationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.roles?.includes("ADMIN")) redirect("/student");

  // Get the user's school
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { schoolId: true },
  });

  if (!user?.schoolId) {
    return (
      <div className="container py-10">
        <p className="text-muted-foreground">No school assigned to your account. Please contact support.</p>
      </div>
    );
  }

  const [{ allocations, activeTerm }, formData] = await Promise.all([
    getAllocationsForSchool(user.schoolId),
    getAllocationFormData(user.schoolId),
  ]);

  return (
    <div className="container py-10 space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent w-fit">
          Subject Allocations
        </h1>
        <p className="text-muted-foreground mt-1">
          Assign subject teachers to classes for{" "}
          <span className="text-foreground font-medium">
            {activeTerm?.name ?? "the active term"}
          </span>
          .
        </p>
      </div>

      {!activeTerm ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl text-center space-y-2">
          <BookOpen className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">No active term found.</p>
          <p className="text-sm text-muted-foreground/60">Please create and activate a term before assigning subjects.</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Create Form ── */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 space-y-5 sticky top-24">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-5 h-5 text-teal-400" />
                <h2 className="font-semibold text-lg">Assign a Teacher</h2>
              </div>

              <form
                action={async (formData: FormData) => {
                  "use server";
                  const teacherId = formData.get("teacherId") as string;
                  const classId = formData.get("classId") as string;
                  const schoolSubjectId = formData.get("schoolSubjectId") as string;
                  const sessionTermId = formData.get("sessionTermId") as string;
                  if (teacherId && classId && schoolSubjectId && sessionTermId) {
                    await createAllocation({ teacherId, classId, schoolSubjectId, sessionTermId });
                  }
                }}
                className="space-y-4"
              >
                <input type="hidden" name="sessionTermId" value={activeTerm.id} />

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Teacher</label>
                  <select
                    name="teacherId"
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 appearance-none"
                  >
                    <option value="">Select a teacher…</option>
                    {formData.teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.roles.join(", ").replace(/_/g, " ")})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Class</label>
                  <select
                    name="classId"
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 appearance-none"
                  >
                    <option value="">Select a class…</option>
                    {formData.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Subject</label>
                  <select
                    name="schoolSubjectId"
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 appearance-none"
                  >
                    <option value="">Select a subject…</option>
                    {formData.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.customName ?? s.subjectBank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-90 text-white font-semibold py-2.5 text-sm transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                >
                  Assign Teacher
                </button>
              </form>
            </div>
          </div>

          {/* ── Allocation Table ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                Current Allocations
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({allocations.length} total)
                </span>
              </h2>
            </div>

            {allocations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-2xl text-center space-y-2">
                <Users className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">No allocations yet. Use the form to assign your first teacher.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teacher</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subject</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((a, i) => (
                      <tr
                        key={a.id}
                        className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                          i === allocations.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">{a.teacher.name}</div>
                          <div className="text-xs text-muted-foreground">{a.teacher.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-xs font-medium text-teal-400">
                            {a.class.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {a.schoolSubject.subjectBank.name}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <form
                            action={async () => {
                              "use server";
                              await deleteAllocation(a.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                              title="Remove allocation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
