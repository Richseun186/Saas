"use client";

import { useState, useMemo, useCallback } from "react";

// ── UI Primitives ──────────────────────────────────────────────────────────────
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// ── Computation engine (WAEC grading) ──────────────────────────────────────────
import { getGradeAndRemark } from "@/lib/computation";

// ── Utility for conditional classnames ─────────────────────────────────────────
import { cn } from "@/lib/utils";

// ── Icons ──────────────────────────────────────────────────────────────────────
import { Save, BookOpen, Users, BarChart3 } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Shape of each student passed in from the parent */
interface Student {
  id: string;
  name: string;
  admissionNo: string;
}

/** Shape of a single score entry (input / output) */
interface ScoreEntry {
  studentId: string;
  ca1: number;
  ca2: number;
  exam: number;
}

/** Extended score entry produced on save — includes computed fields */
interface ComputedScoreEntry extends ScoreEntry {
  total: number;
  grade: string;
  remark: string;
}

/** Props accepted by the Broadsheet component */
export interface BroadsheetProps {
  /** The subject being graded, e.g. "Mathematics" */
  subjectName: string;
  /** List of students in the class */
  students: Student[];
  /** Optional pre-existing scores to hydrate the form with */
  initialScores?: ScoreEntry[];
  /** Callback fired when the teacher clicks "Save Scores" */
  onSave?: (scores: ComputedScoreEntry[]) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Maximum marks for each assessment component */
const MAX_CA = 20; // CA1 and CA2 are each out of 20
const MAX_EXAM = 60; // Exam is out of 60

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE BADGE COLOR MAP
// Maps WAEC grades to Tailwind color classes for the pill badge.
// A1/B2/B3 → green variants, C4/C5/C6 → yellow/amber, D7/E8 → orange, F9 → red
// ═══════════════════════════════════════════════════════════════════════════════

const GRADE_COLORS: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800 ring-emerald-500/30",
  B2: "bg-green-100 text-green-800 ring-green-500/30",
  B3: "bg-lime-100 text-lime-800 ring-lime-500/30",
  C4: "bg-yellow-100 text-yellow-800 ring-yellow-500/30",
  C5: "bg-amber-100 text-amber-800 ring-amber-500/30",
  C6: "bg-amber-50 text-amber-700 ring-amber-400/30",
  D7: "bg-orange-100 text-orange-800 ring-orange-500/30",
  E8: "bg-orange-50 text-orange-700 ring-orange-400/30",
  F9: "bg-red-100 text-red-800 ring-red-500/30",
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER — build the initial scores map from props
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Converts the `initialScores` array into a Record keyed by studentId.
 * Students without initial scores default to 0/0/0.
 */
function buildInitialScoresMap(
  students: Student[],
  initialScores?: ScoreEntry[]
): Record<string, { ca1: number; ca2: number; exam: number }> {
  // Start with every student at zero
  const map: Record<string, { ca1: number; ca2: number; exam: number }> = {};

  for (const student of students) {
    map[student.id] = { ca1: 0, ca2: 0, exam: 0 };
  }

  // Overlay any pre-existing scores
  if (initialScores) {
    for (const score of initialScores) {
      if (map[score.studentId]) {
        map[score.studentId] = {
          ca1: score.ca1,
          ca2: score.ca2,
          exam: score.exam,
        };
      }
    }
  }

  return map;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BROADSHEET COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function Broadsheet({
  subjectName,
  students,
  initialScores,
  onSave,
}: BroadsheetProps) {
  // ── State: scores map keyed by studentId ──────────────────────────────────
  const [scores, setScores] = useState<
    Record<string, { ca1: number; ca2: number; exam: number }>
  >(() => buildInitialScoresMap(students, initialScores));

  // ── Derived: compute totals, grades, and remarks for every student ────────
  const computedRows = useMemo(() => {
    return students.map((student) => {
      const s = scores[student.id] ?? { ca1: 0, ca2: 0, exam: 0 };
      const total = s.ca1 + s.ca2 + s.exam;
      const { grade, remark } = getGradeAndRemark(total);

      return {
        ...student,
        ca1: s.ca1,
        ca2: s.ca2,
        exam: s.exam,
        total,
        grade,
        remark,
      };
    });
  }, [students, scores]);

  // ── Derived: class-level statistics for the summary bar ───────────────────
  const classAverage = useMemo(() => {
    if (computedRows.length === 0) return 0;
    const sum = computedRows.reduce((acc, row) => acc + row.total, 0);
    return Number((sum / computedRows.length).toFixed(1));
  }, [computedRows]);

  // ── Handler: update a single field for a single student ───────────────────
  const handleScoreChange = useCallback(
    (
      studentId: string,
      field: "ca1" | "ca2" | "exam",
      rawValue: string
    ) => {
      // Parse to number; treat empty/NaN as 0
      const parsed = parseInt(rawValue, 10);
      const value = isNaN(parsed) ? 0 : Math.max(0, parsed);

      setScores((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [field]: value,
        },
      }));
    },
    []
  );

  // ── Handler: save all scores ──────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!onSave) return;

    const payload: ComputedScoreEntry[] = computedRows.map((row) => ({
      studentId: row.id,
      ca1: row.ca1,
      ca2: row.ca2,
      exam: row.exam,
      total: row.total,
      grade: row.grade,
      remark: row.remark,
    }));

    onSave(payload);
  }, [onSave, computedRows]);

  // ── Helper: check if a value exceeds its maximum (for red border) ─────────
  const isInvalid = (value: number, max: number): boolean => value > max;

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full space-y-4">
      {/* ── SUMMARY BAR ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-4 rounded-xl border bg-gradient-to-r",
          "from-slate-50 to-white p-4 shadow-sm dark:from-slate-900 dark:to-slate-950"
        )}
      >
        {/* Subject name chip */}
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            {subjectName}
          </span>
        </div>

        {/* Total students chip */}
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 dark:bg-blue-950">
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {students.length} Student{students.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Average class score chip */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 dark:bg-amber-950">
          <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Class Avg: {classAverage}%
          </span>
        </div>
      </div>

      {/* ── BROADSHEET TABLE ──────────────────────────────────────────────── */}
      <Table>
        {/* Sticky header so column labels remain visible while scrolling */}
        <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
          <TableRow>
            <TableHead className="w-[50px] text-center font-semibold">
              S/N
            </TableHead>
            <TableHead className="min-w-[180px] font-semibold">
              Student Name
            </TableHead>
            <TableHead className="w-[120px] font-semibold">
              Adm. No
            </TableHead>
            <TableHead className="w-[100px] text-center font-semibold">
              CA1 <span className="text-xs font-normal text-muted-foreground">/ {MAX_CA}</span>
            </TableHead>
            <TableHead className="w-[100px] text-center font-semibold">
              CA2 <span className="text-xs font-normal text-muted-foreground">/ {MAX_CA}</span>
            </TableHead>
            <TableHead className="w-[100px] text-center font-semibold">
              Exam <span className="text-xs font-normal text-muted-foreground">/ {MAX_EXAM}</span>
            </TableHead>
            <TableHead className="w-[80px] text-center font-semibold">
              Total
            </TableHead>
            <TableHead className="w-[80px] text-center font-semibold">
              Grade
            </TableHead>
            <TableHead className="w-[120px] text-center font-semibold">
              Remark
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {computedRows.map((row, index) => {
            // Pre-compute validation flags for this row
            const ca1Invalid = isInvalid(row.ca1, MAX_CA);
            const ca2Invalid = isInvalid(row.ca2, MAX_CA);
            const examInvalid = isInvalid(row.exam, MAX_EXAM);
            const gradeColor =
              GRADE_COLORS[row.grade] ?? "bg-gray-100 text-gray-800";

            return (
              <TableRow
                key={row.id}
                className={cn(
                  "transition-colors duration-150",
                  // Alternate row striping for readability
                  index % 2 === 0
                    ? "bg-white dark:bg-slate-950"
                    : "bg-slate-50/60 dark:bg-slate-900/60"
                )}
              >
                {/* ── Serial Number ─────────────────────────────────────── */}
                <TableCell className="text-center font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>

                {/* ── Student Name ──────────────────────────────────────── */}
                <TableCell className="font-medium">{row.name}</TableCell>

                {/* ── Admission Number ──────────────────────────────────── */}
                <TableCell className="text-muted-foreground">
                  {row.admissionNo}
                </TableCell>

                {/* ── CA1 Input ─────────────────────────────────────────── */}
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min={0}
                    max={MAX_CA}
                    value={row.ca1 || ""}
                    placeholder="0"
                    onChange={(e) =>
                      handleScoreChange(row.id, "ca1", e.target.value)
                    }
                    className={cn(
                      "h-8 w-16 mx-auto text-center text-sm transition-all duration-200",
                      // Red border + ring when value exceeds the maximum
                      ca1Invalid &&
                        "border-red-500 ring-2 ring-red-500/20 focus-visible:ring-red-500/40"
                    )}
                  />
                </TableCell>

                {/* ── CA2 Input ─────────────────────────────────────────── */}
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min={0}
                    max={MAX_CA}
                    value={row.ca2 || ""}
                    placeholder="0"
                    onChange={(e) =>
                      handleScoreChange(row.id, "ca2", e.target.value)
                    }
                    className={cn(
                      "h-8 w-16 mx-auto text-center text-sm transition-all duration-200",
                      ca2Invalid &&
                        "border-red-500 ring-2 ring-red-500/20 focus-visible:ring-red-500/40"
                    )}
                  />
                </TableCell>

                {/* ── Exam Input ────────────────────────────────────────── */}
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min={0}
                    max={MAX_EXAM}
                    value={row.exam || ""}
                    placeholder="0"
                    onChange={(e) =>
                      handleScoreChange(row.id, "exam", e.target.value)
                    }
                    className={cn(
                      "h-8 w-16 mx-auto text-center text-sm transition-all duration-200",
                      examInvalid &&
                        "border-red-500 ring-2 ring-red-500/20 focus-visible:ring-red-500/40"
                    )}
                  />
                </TableCell>

                {/* ── Total (auto-computed) ─────────────────────────────── */}
                <TableCell className="text-center font-semibold tabular-nums">
                  {row.total}
                </TableCell>

                {/* ── Grade Badge (color-coded pill) ────────────────────── */}
                <TableCell className="text-center">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center rounded-full px-2.5 py-0.5",
                      "text-xs font-bold ring-1 ring-inset transition-colors duration-200",
                      gradeColor
                    )}
                  >
                    {row.grade}
                  </span>
                </TableCell>

                {/* ── Remark (auto-computed) ────────────────────────────── */}
                <TableCell className="text-center text-sm text-muted-foreground">
                  {row.remark}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* ── SAVE BUTTON ───────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-5 py-2.5",
            "bg-primary text-primary-foreground font-medium text-sm",
            "shadow-sm transition-all duration-200",
            "hover:bg-primary/90 hover:shadow-md",
            "active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          <Save className="h-4 w-4" />
          Save Scores
        </button>
      </div>
    </div>
  );
}
