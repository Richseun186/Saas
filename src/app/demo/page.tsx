"use client";

/**
 * ============================================================================
 *  Demo Page — GradeSync Nigeria Phase 2 Component Showcase
 * ============================================================================
 *
 *  This page displays both the Broadsheet (interactive score entry) and
 *  ReportCard (printable result) components side-by-side, populated with
 *  realistic Nigerian school mock data.
 *
 *  Route: /demo
 * ============================================================================
 */

import Broadsheet from "@/components/shared/Broadsheet";
import ReportCard from "@/components/shared/ReportCard";
import { computeStudentResults, computeClassPositions } from "@/lib/computation";
import type { RawScore } from "@/lib/computation";

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA — Realistic Nigerian School Context
// ═══════════════════════════════════════════════════════════════════════════════

/** Mock student roster for the Broadsheet */
const MOCK_STUDENTS = [
  { id: "stu-001", name: "Adebayo Oluwaseun", admissionNo: "GSN/2024/001" },
  { id: "stu-002", name: "Chidinma Okafor", admissionNo: "GSN/2024/002" },
  { id: "stu-003", name: "Fatima Bello", admissionNo: "GSN/2024/003" },
  { id: "stu-004", name: "Emeka Nwosu", admissionNo: "GSN/2024/004" },
  { id: "stu-005", name: "Ngozi Eze", admissionNo: "GSN/2024/005" },
  { id: "stu-006", name: "Yusuf Ibrahim", admissionNo: "GSN/2024/006" },
  { id: "stu-007", name: "Blessing Okonkwo", admissionNo: "GSN/2024/007" },
  { id: "stu-008", name: "Abdullahi Musa", admissionNo: "GSN/2024/008" },
];

/** Pre-filled scores for the Broadsheet demo (first 4 students) */
const MOCK_INITIAL_SCORES = [
  { studentId: "stu-001", ca1: 18, ca2: 17, exam: 52 },
  { studentId: "stu-002", ca1: 15, ca2: 19, exam: 48 },
  { studentId: "stu-003", ca1: 12, ca2: 14, exam: 38 },
  { studentId: "stu-004", ca1: 20, ca2: 18, exam: 55 },
];

// ---------------------------------------------------------------------------
// Mock data for the Report Card — A single student's full term result
// ---------------------------------------------------------------------------

/** Raw scores for Adebayo Oluwaseun across all subjects */
const ADEBAYO_RAW_SCORES: RawScore[] = [
  { subjectId: "english",    ca1: 18, ca2: 17, exam: 52 },
  { subjectId: "maths",      ca1: 20, ca2: 18, exam: 55 },
  { subjectId: "basic-sci",  ca1: 15, ca2: 16, exam: 45 },
  { subjectId: "basic-tech", ca1: 14, ca2: 13, exam: 40 },
  { subjectId: "social-std", ca1: 17, ca2: 18, exam: 50 },
  { subjectId: "civic-edu",  ca1: 19, ca2: 17, exam: 48 },
  { subjectId: "cca",        ca1: 16, ca2: 15, exam: 42 },
  { subjectId: "biz-std",    ca1: 13, ca2: 14, exam: 38 },
  { subjectId: "french",     ca1: 10, ca2: 12, exam: 35 },
  { subjectId: "agric",      ca1: 17, ca2: 16, exam: 46 },
];

/** Subject names mapped by subjectId */
const SUBJECT_NAMES: Record<string, string> = {
  "english":    "English Language",
  "maths":      "Mathematics",
  "basic-sci":  "Basic Science",
  "basic-tech": "Basic Technology",
  "social-std": "Social Studies",
  "civic-edu":  "Civic Education",
  "cca":        "Cultural & Creative Arts",
  "biz-std":    "Business Studies",
  "french":     "French",
  "agric":      "Agricultural Science",
};

// Compute results using Phase 1 engine
const computedResults = computeStudentResults(ADEBAYO_RAW_SCORES);
const reportCardResults = computedResults.map((r) => ({
  subject: SUBJECT_NAMES[r.subjectId] || r.subjectId,
  ca1: Number(r.ca1) || 0,
  ca2: Number(r.ca2) || 0,
  exam: Number(r.exam) || 0,
  total: r.total,
  grade: r.grade,
  remark: r.remark,
}));

// Compute term total and average
const termTotalScore = computedResults.reduce((sum, r) => sum + r.total, 0);
const averagePercentage = computedResults.length > 0
  ? termTotalScore / computedResults.length
  : 0;

// Also demonstrate class positions with 3 mock students
const classPositionDemo = computeClassPositions([
  { studentId: "stu-001", results: computedResults },
  {
    studentId: "stu-002",
    results: computeStudentResults([
      { subjectId: "english", ca1: 15, ca2: 19, exam: 48 },
      { subjectId: "maths", ca1: 14, ca2: 16, exam: 42 },
      { subjectId: "basic-sci", ca1: 12, ca2: 13, exam: 35 },
    ]),
  },
  {
    studentId: "stu-004",
    results: computeStudentResults([
      { subjectId: "english", ca1: 20, ca2: 18, exam: 55 },
      { subjectId: "maths", ca1: 19, ca2: 20, exam: 58 },
      { subjectId: "basic-sci", ca1: 18, ca2: 17, exam: 50 },
    ]),
  },
]);

// Find Adebayo's position
const adebayoRanked = classPositionDemo.find((s) => s.studentId === "stu-001");

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function DemoPage() {
  return (
    <div className="container py-8 space-y-12 animate-fade-in">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
          GradeSync Nigeria — Phase 2 Demo
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Interactive preview of the Broadsheet (for Form Masters) and the
          printable Report Card (for Students/Parents). Scores auto-compute
          using the WAEC A1–F9 grading engine built in Phase 1.
        </p>
      </div>

      {/* ================================================================== */}
      {/*  SECTION 1 — BROADSHEET DEMO                                       */}
      {/* ================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-teal-500 to-emerald-500" />
          <h2 className="text-xl font-semibold">
            📋 Form Master&apos;s Broadsheet
          </h2>
        </div>
        <p className="text-sm text-muted-foreground ml-5">
          Enter scores for <strong>Mathematics — JSS 1A</strong>. The first 4
          students have pre-filled scores. Try editing them — totals, grades, and
          the class average update in real-time.
        </p>

        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-950">
          <Broadsheet
            subjectName="Mathematics"
            students={MOCK_STUDENTS}
            initialScores={MOCK_INITIAL_SCORES}
            onSave={(scores) => {
              console.log("Saved scores:", scores);
              alert(`✅ Scores saved for ${scores.length} students!`);
            }}
          />
        </div>
      </section>

      {/* ================================================================== */}
      {/*  SECTION 2 — REPORT CARD DEMO                                      */}
      {/* ================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-teal-500 to-emerald-500" />
          <h2 className="text-xl font-semibold">
            🎓 Student Report Card
          </h2>
        </div>
        <p className="text-sm text-muted-foreground ml-5">
          Full end-of-term report for <strong>Adebayo Oluwaseun</strong> in
          JSS 1A. Includes all 10 subjects, performance summary, AI remark
          placeholders, and a working print button.
        </p>

        <ReportCard
          schoolName="Federal Government College, Lagos"
          schoolAddress="Victoria Island, Lagos State, Nigeria"
          schoolMotto="Knowledge is Power"
          session="2025/2026"
          term="First Term"
          studentName="Adebayo Oluwaseun"
          admissionNo="GSN/2024/001"
          className="JSS 1A"
          classPosition={adebayoRanked?.classPosition ?? "1st"}
          totalStudents={42}
          nextTermBegins="6th January, 2026"
          results={reportCardResults}
          termTotalScore={termTotalScore}
          averagePercentage={Number(averagePercentage.toFixed(1))}
          formMasterRemark="Adebayo is a diligent and hardworking student who shows great promise in Science and Mathematics. He should maintain this effort and improve in French and Business Studies. Keep up the good work!"
          principalRemark="An impressive performance this term. Adebayo demonstrates discipline and academic excellence. I encourage him to continue striving for the best. Well done!"
        />
      </section>

      {/* ================================================================== */}
      {/*  SECTION 3 — CLASS POSITION ENGINE DEMO                            */}
      {/* ================================================================== */}
      <section className="space-y-4 pb-12">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-teal-500 to-emerald-500" />
          <h2 className="text-xl font-semibold">
            🏆 Class Position Engine Output
          </h2>
        </div>
        <p className="text-sm text-muted-foreground ml-5">
          Demonstrates the <code>computeClassPositions</code> function ranking
          3 students by their term total scores with correct ordinal suffixes.
        </p>

        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-teal-700 to-teal-800 text-white">
                  <th className="px-4 py-3 text-left rounded-tl-lg">Position</th>
                  <th className="px-4 py-3 text-left">Student ID</th>
                  <th className="px-4 py-3 text-right">Term Total</th>
                  <th className="px-4 py-3 text-right">Average %</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Subjects</th>
                </tr>
              </thead>
              <tbody>
                {classPositionDemo.map((student, idx) => (
                  <tr
                    key={student.studentId}
                    className={`border-b transition-colors hover:bg-teal-50/50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-teal-700">
                      {student.classPosition}
                    </td>
                    <td className="px-4 py-3 font-medium">{student.studentId}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {student.termTotalScore}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {student.averagePercentage}%
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {student.results.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
