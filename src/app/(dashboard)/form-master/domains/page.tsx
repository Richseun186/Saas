import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFormMasterClasses, getActiveTerm } from "@/actions/grading";
import { getClassStudentsWithDomains, saveAffectiveDomain, savePsychomotorDomain } from "@/actions/domains";
import { AFFECTIVE_TRAITS, PSYCHOMOTOR_TRAITS, SCORE_LABELS } from "@/lib/constants";
import { Brain, Activity } from "lucide-react";

export default async function DomainsPage() {
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

  // Use first class by default
  const activeClass = classes[0];
  const students = await getClassStudentsWithDomains(activeClass.id, term.id);

  const scoreOptions = [1, 2, 3, 4, 5];

  return (
    <div className="container py-10 space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent w-fit">
          Behavioural Domains
        </h1>
        <p className="text-muted-foreground mt-1">
          Score students on affective and psychomotor traits — <span className="text-foreground font-medium">{activeClass.name}</span> · {term.name}
        </p>
      </div>

      {/* ── Score Legend ── */}
      <div className="flex flex-wrap gap-2">
        {scoreOptions.map((s) => (
          <span key={s} className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-muted-foreground">
            <span className="font-bold text-foreground">{s}</span> = {SCORE_LABELS[s]}
          </span>
        ))}
      </div>

      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl text-center">
          <p className="text-muted-foreground">No students enrolled in this class for the active term.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {students.map((enrollment) => (
            <div key={enrollment.id} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              {/* Student header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-sm font-bold text-white">
                  {enrollment.student.name?.charAt(0) ?? "?"}
                </div>
                <div>
                  <p className="font-semibold">{enrollment.student.name}</p>
                  <p className="text-xs text-muted-foreground">Enrollment ID: {enrollment.id.slice(0, 8)}…</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
                {/* ── Affective Domain ── */}
                <form
                  action={async (fd: FormData) => {
                    "use server";
                    await saveAffectiveDomain(enrollment.id, {
                      punctuality:   Number(fd.get("punctuality")),
                      neatness:      Number(fd.get("neatness")),
                      politeness:    Number(fd.get("politeness")),
                      honesty:       Number(fd.get("honesty")),
                      attentiveness: Number(fd.get("attentiveness")),
                      perseverance:  Number(fd.get("perseverance")),
                      cooperation:   Number(fd.get("cooperation")),
                      leadership:    Number(fd.get("leadership")),
                    });
                  }}
                  className="p-5 space-y-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-violet-400" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-violet-400">Affective Domain</h3>
                  </div>
                  <div className="space-y-3">
                    {AFFECTIVE_TRAITS.map((trait) => {
                      const currentVal = enrollment.affectiveDomain?.[trait.key] ?? 3;
                      return (
                        <div key={trait.key} className="flex items-center justify-between gap-4">
                          <label className="text-sm text-muted-foreground min-w-[120px]">{trait.label}</label>
                          <div className="flex gap-1">
                            {scoreOptions.map((score) => (
                              <label key={score} className="cursor-pointer">
                                <input
                                  type="radio"
                                  name={trait.key}
                                  value={score}
                                  defaultChecked={currentVal === score}
                                  className="sr-only peer"
                                />
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-xs font-medium text-muted-foreground peer-checked:bg-violet-500/20 peer-checked:border-violet-500/50 peer-checked:text-violet-300 hover:bg-white/5 transition-colors cursor-pointer">
                                  {score}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-300 py-2 text-sm font-medium transition-colors"
                  >
                    Save Affective Scores
                  </button>
                </form>

                {/* ── Psychomotor Domain ── */}
                <form
                  action={async (fd: FormData) => {
                    "use server";
                    await savePsychomotorDomain(enrollment.id, {
                      handwriting:    Number(fd.get("handwriting")),
                      sports:         Number(fd.get("sports")),
                      drawing:        Number(fd.get("drawing")),
                      verbal_fluency: Number(fd.get("verbal_fluency")),
                      musical_skill:  Number(fd.get("musical_skill")),
                      computer_skill: Number(fd.get("computer_skill")),
                    });
                  }}
                  className="p-5 space-y-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-amber-400">Psychomotor Domain</h3>
                  </div>
                  <div className="space-y-3">
                    {PSYCHOMOTOR_TRAITS.map((trait) => {
                      const currentVal = enrollment.psychomotorDomain?.[trait.key] ?? 3;
                      return (
                        <div key={trait.key} className="flex items-center justify-between gap-4">
                          <label className="text-sm text-muted-foreground min-w-[120px]">{trait.label}</label>
                          <div className="flex gap-1">
                            {scoreOptions.map((score) => (
                              <label key={score} className="cursor-pointer">
                                <input
                                  type="radio"
                                  name={trait.key}
                                  value={score}
                                  defaultChecked={currentVal === score}
                                  className="sr-only peer"
                                />
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-xs font-medium text-muted-foreground peer-checked:bg-amber-500/20 peer-checked:border-amber-500/50 peer-checked:text-amber-300 hover:bg-white/5 transition-colors cursor-pointer">
                                  {score}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 py-2 text-sm font-medium transition-colors"
                  >
                    Save Psychomotor Scores
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
