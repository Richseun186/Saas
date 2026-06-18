"use client";

import { useState } from "react";
import { GraduationCap, Activity, Brain, Clock, ChevronDown, Printer } from "lucide-react";

export default function ParentDashboardClient({
  childrenData,
  profilesData
}: {
  childrenData: any[];
  profilesData: Record<string, any>;
}) {
  const [selectedChildId, setSelectedChildId] = useState(childrenData[0]?.id || "");

  if (childrenData.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-xl bg-slate-50">
        You are not linked to any students. Please contact the school administrator.
      </div>
    );
  }

  const selectedProfile = profilesData[selectedChildId];

  if (!selectedProfile) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-xl bg-slate-50">
        No active academic data found for this child.
      </div>
    );
  }

  const { enrollment, activeTerm, stats } = selectedProfile;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header & Child Selector ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 relative">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent w-fit">
            Parent Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoring progress for the {activeTerm.name}
          </p>
        </div>

        {childrenData.length > 1 && (
          <div className="relative">
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-white/10 bg-white/[0.05] focus:bg-white/[0.08] focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium min-w-[200px]"
            >
              {childrenData.map((child) => (
                <option key={child.id} value={child.id} className="bg-background">
                  {child.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        )}
      </div>

      {/* ── Overview Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-purple-500 hover-lift">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium text-sm">Average Score</h3>
          </div>
          <p className="text-3xl font-bold">{stats.average.toFixed(1)}%</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-teal-500 hover-lift">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <Activity className="w-5 h-5 text-teal-400" />
            <h3 className="font-medium text-sm">Days Present</h3>
          </div>
          <p className="text-3xl font-bold">{stats.presentCount}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-rose-500 hover-lift">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <Clock className="w-5 h-5 text-rose-400" />
            <h3 className="font-medium text-sm">Days Absent</h3>
          </div>
          <p className="text-3xl font-bold">{stats.absentCount}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-amber-500 hover-lift">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <Brain className="w-5 h-5 text-amber-400" />
            <h3 className="font-medium text-sm">Class Assigned</h3>
          </div>
          <p className="text-xl font-bold truncate mt-1">{enrollment.class.name}</p>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Academic Results Table */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </span>
            Academic Record
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="text-left py-3 font-medium">Subject</th>
                  <th className="text-center py-3 font-medium">CA1</th>
                  <th className="text-center py-3 font-medium">CA2</th>
                  <th className="text-center py-3 font-medium">Exam</th>
                  <th className="text-center py-3 font-medium">Total</th>
                  <th className="text-center py-3 font-medium">Grade</th>
                </tr>
              </thead>
              <tbody>
                {enrollment.results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No grades recorded yet.
                    </td>
                  </tr>
                ) : (
                  enrollment.results.map((result: any) => (
                    <tr key={result.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-medium">{result.schoolSubject.subjectBank.name}</td>
                      <td className="text-center py-3">{result.ca1 || "-"}</td>
                      <td className="text-center py-3">{result.ca2 || "-"}</td>
                      <td className="text-center py-3">{result.exam || "-"}</td>
                      <td className="text-center py-3 font-bold">{result.total || "-"}</td>
                      <td className="text-center py-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          ["A1", "B2", "B3"].includes(result.grade) ? "bg-emerald-500/20 text-emerald-400" :
                          ["C4", "C5", "C6"].includes(result.grade) ? "bg-blue-500/20 text-blue-400" :
                          ["D7", "E8"].includes(result.grade) ? "bg-amber-500/20 text-amber-400" :
                          "bg-rose-500/20 text-rose-400"
                        }`}>
                          {result.grade || "-"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Behavioural Domains */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10">
             <h2 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-violet-400" />
              </span>
              Affective Domain
            </h2>
            {!enrollment.affectiveDomain ? (
              <p className="text-sm text-muted-foreground">Not graded yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(enrollment.affectiveDomain)
                  .filter(([k]) => !['id', 'enrollmentId'].includes(k))
                  .map(([key, value]: any) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm capitalize text-muted-foreground">{key}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <div
                            key={num}
                            className={`w-4 h-4 rounded-sm ${num <= value ? "bg-violet-500" : "bg-white/10"}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10">
             <h2 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-amber-400" />
              </span>
              Psychomotor Domain
            </h2>
            {!enrollment.psychomotorDomain ? (
              <p className="text-sm text-muted-foreground">Not graded yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(enrollment.psychomotorDomain)
                  .filter(([k]) => !['id', 'enrollmentId'].includes(k))
                  .map(([key, value]: any) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm capitalize text-muted-foreground">{key.replace("_", " ")}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <div
                            key={num}
                            className={`w-4 h-4 rounded-sm ${num <= value ? "bg-amber-500" : "bg-white/10"}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── AI Remarks ── */}
      {(enrollment.formMasterRemark || enrollment.principalRemark) && (
        <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-white/[0.02] to-teal-500/5">
          <h2 className="text-xl font-bold mb-4">Official Remarks</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {enrollment.formMasterRemark && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <h3 className="text-sm font-semibold text-teal-400 mb-2 uppercase tracking-wider">Form Master</h3>
                <p className="text-muted-foreground italic">&ldquo;{enrollment.formMasterRemark}&rdquo;</p>
              </div>
            )}
            {enrollment.principalRemark && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <h3 className="text-sm font-semibold text-emerald-400 mb-2 uppercase tracking-wider">Principal</h3>
                <p className="text-muted-foreground italic">&ldquo;{enrollment.principalRemark}&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Quick Links ── */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Links</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="/parent/fees"
            className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
            <div>
              <h3 className="font-bold">Fees & Payments</h3>
              <p className="text-sm text-muted-foreground">View invoices and make payments</p>
            </div>
          </a>
          <a
            href={`/parent/report-card/${selectedChildId}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-purple-500/10 hover:border-purple-500/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">Official Report Card</h3>
              <p className="text-sm text-muted-foreground">Download or print end-of-term PDF</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
