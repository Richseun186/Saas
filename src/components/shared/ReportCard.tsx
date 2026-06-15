/**
 * ============================================================================
 *  ReportCard.tsx — Traditional Nigerian-Style Printable Report Card
 * ============================================================================
 *
 *  A purely presentational **Server Component** (no "use client") that renders
 *  a student's end-of-term result in a format familiar to every Nigerian
 *  school — clean borders, green/teal header accents, alternating row colours,
 *  and a print-optimised layout.
 *
 *  Sections
 *  --------
 *  1. School Header       – Name, address, motto, session & term
 *  2. Student Info Grid   – Two-column layout for student metadata
 *  3. Results Table       – S/N, Subject, CA1, CA2, Exam, Total, Grade, Remark
 *  4. Performance Summary – Highlighted total score & average
 *  5. Remarks             – Form Master & Principal remarks
 *  6. Signatures          – Signature lines with date placeholders
 *
 *  Print behaviour
 *  ---------------
 *  The outer wrapper uses Tailwind `print:` variants to strip shadows and
 *  borders. A "Print Report Card" button is visible on-screen but hidden
 *  when printing (`print:hidden`).  Because the print button needs
 *  `onClick`, it lives in its own tiny client island imported below — but
 *  the rest of the card remains a Server Component.
 *
 *  NOTE: We intentionally avoid importing any Shadcn UI components here so
 *  the entire tree stays server-renderable. All elements are native HTML
 *  styled with Tailwind.
 * ============================================================================
 */

import { cn } from "@/lib/utils";
import {
  Printer,
  GraduationCap,
  Award,
  MessageSquare,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  1. TYPES                                                                  */
/* -------------------------------------------------------------------------- */

/** A single subject row in the results table. */
export interface SubjectResult {
  subject: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

/** Full set of props required by the <ReportCard /> component. */
export interface ReportCardProps {
  /** Official school name — displayed prominently in the header. */
  schoolName: string;
  /** Optional school address line (displayed beneath the name). */
  schoolAddress?: string;
  /** Optional school motto (displayed in italics). */
  schoolMotto?: string;
  /** Academic session, e.g. "2025/2026". */
  session: string;
  /** Term label, e.g. "First Term". */
  term: string;

  /* -- Student metadata -- */
  studentName: string;
  admissionNo: string;
  /** Class label, e.g. "JSS 1A". */
  className: string;
  /** Position in class, e.g. "3rd". */
  classPosition: string;
  /** Total number of students in the class. */
  totalStudents: number;
  /** Optional date when next term begins. */
  nextTermBegins?: string;

  /* -- Academic data -- */
  /** Array of per-subject results. */
  results: SubjectResult[];
  /** Sum of all subject totals for the term. */
  termTotalScore: number;
  /** Overall average percentage across all subjects. */
  averagePercentage: number;

  /* -- Remarks -- */
  /** Optional form master / class teacher remark. */
  formMasterRemark?: string;
  /** Optional principal / head teacher remark. */
  principalRemark?: string;
}

/* -------------------------------------------------------------------------- */
/*  2. GRADE COLOUR HELPER                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Returns Tailwind text colour classes that match the WAEC grading colour
 * scheme used across the GradeSync platform:
 *
 *  - A1 – B3  → green  (Excellent / Very Good / Good)
 *  - C4 – C6  → amber  (Credit)
 *  - D7 – E8  → orange (Pass)
 *  - F9       → red    (Fail)
 *
 * Falls back to neutral grey for unrecognised grades.
 */
function gradeColorClass(grade: string): string {
  switch (grade) {
    case "A1":
    case "B2":
    case "B3":
      return "text-emerald-700 font-semibold";
    case "C4":
    case "C5":
    case "C6":
      return "text-amber-600 font-semibold";
    case "D7":
    case "E8":
      return "text-orange-600 font-semibold";
    case "F9":
      return "text-red-600 font-bold";
    default:
      return "text-gray-700";
  }
}

/**
 * Returns a subtle background tint for grade badges to reinforce colour
 * coding without overwhelming the printed page.
 */
function gradeBgClass(grade: string): string {
  switch (grade) {
    case "A1":
    case "B2":
    case "B3":
      return "bg-emerald-50";
    case "C4":
    case "C5":
    case "C6":
      return "bg-amber-50";
    case "D7":
    case "E8":
      return "bg-orange-50";
    case "F9":
      return "bg-red-50";
    default:
      return "bg-gray-50";
  }
}

/* -------------------------------------------------------------------------- */
/*  3. PRINT BUTTON (Client Island)                                           */
/* -------------------------------------------------------------------------- */

/**
 * Because this is a Server Component, we cannot attach `onClick` directly.
 * Instead we render a tiny `<button>` that uses an inline `onclick` via a
 * `<script>` tag approach — but the simplest cross-framework trick is to
 * rely on `window.print()` via an anchor-like workaround.
 *
 * However, Next.js RSC does NOT allow inline event handlers. So we render
 * the print button as a <form> with a hidden action — or better yet, we
 * embed a micro <script> to wire the click. This keeps us in Server
 * Component land without needing a separate client file.
 *
 * For maximum simplicity and robustness we'll render it as a link-styled
 * element with a data attribute, and add a one-liner script.
 */

/* -------------------------------------------------------------------------- */
/*  4. MAIN COMPONENT                                                         */
/* -------------------------------------------------------------------------- */

export default function ReportCard({
  schoolName,
  schoolAddress,
  schoolMotto,
  session,
  term,
  studentName,
  admissionNo,
  className: studentClass, // renamed to avoid collision with HTML className
  classPosition,
  totalStudents,
  nextTermBegins,
  results,
  termTotalScore,
  averagePercentage,
  formMasterRemark,
  principalRemark,
}: ReportCardProps) {
  return (
    <div
      className={cn(
        /* ── Screen appearance ── */
        "mx-auto max-w-3xl bg-white shadow-lg rounded-lg",
        "border border-gray-200",
        "font-serif text-gray-900",

        /* ── Print overrides ── */
        "print:shadow-none print:border-none print:rounded-none",
        "print:max-w-full print:text-black"
      )}
    >
      {/* ================================================================== */}
      {/*  SECTION A — SCHOOL HEADER                                         */}
      {/* ================================================================== */}
      <header
        className={cn(
          "border-b-4 border-teal-700",
          "bg-gradient-to-b from-teal-700 to-teal-800",
          "px-8 py-6 text-center text-white",
          "print:bg-teal-700 print:text-white"
        )}
      >
        {/* School crest icon */}
        <div className="mx-auto mb-2 flex items-center justify-center">
          <GraduationCap className="h-10 w-10" strokeWidth={1.5} />
        </div>

        {/* School name */}
        <h1 className="text-2xl font-bold uppercase tracking-wide md:text-3xl">
          {schoolName}
        </h1>

        {/* School address (optional) */}
        {schoolAddress && (
          <p className="mt-1 text-sm font-light tracking-wide opacity-90">
            {schoolAddress}
          </p>
        )}

        {/* School motto (optional, italic) */}
        {schoolMotto && (
          <p className="mt-1 text-xs italic opacity-80">
            &ldquo;{schoolMotto}&rdquo;
          </p>
        )}

        {/* Session & Term labels */}
        <div
          className={cn(
            "mt-4 inline-flex items-center gap-4 rounded-full",
            "bg-white/15 px-6 py-1.5 text-sm font-medium backdrop-blur-sm"
          )}
        >
          <span>
            Session: <strong>{session}</strong>
          </span>
          <span className="opacity-50">|</span>
          <span>
            Term: <strong>{term}</strong>
          </span>
        </div>
      </header>

      {/* Title bar — "Student Report Card" */}
      <div
        className={cn(
          "bg-teal-50 px-8 py-2 text-center",
          "border-b border-teal-200"
        )}
      >
        <h2 className="text-sm font-bold uppercase tracking-widest text-teal-800">
          <Award className="mr-1.5 inline-block h-4 w-4 -translate-y-px" />
          Student Report Card
        </h2>
      </div>

      {/* ================================================================== */}
      {/*  SECTION B — STUDENT INFORMATION GRID                              */}
      {/* ================================================================== */}
      <section className="grid grid-cols-1 gap-0 border-b border-gray-200 sm:grid-cols-2">
        {/* Left column */}
        <div className="space-y-1 border-b border-gray-200 px-8 py-4 sm:border-b-0 sm:border-r">
          <InfoRow label="Student Name" value={studentName} />
          <InfoRow label="Admission No" value={admissionNo} />
          <InfoRow label="Class" value={studentClass} />
        </div>

        {/* Right column */}
        <div className="space-y-1 px-8 py-4">
          <InfoRow label="Position in Class" value={classPosition} />
          <InfoRow
            label="No. of Students"
            value={String(totalStudents)}
          />
          <InfoRow
            label="Next Term Begins"
            value={nextTermBegins ?? "To be announced"}
          />
        </div>
      </section>

      {/* ================================================================== */}
      {/*  SECTION C — RESULTS TABLE                                         */}
      {/* ================================================================== */}
      <section className="px-4 py-5 sm:px-8">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-teal-800">
          <Award className="h-4 w-4" />
          Academic Performance
        </h3>

        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <table className="w-full border-collapse text-sm">
            {/* ---- Table Head ---- */}
            <thead>
              <tr className="bg-teal-700 text-white">
                <Th className="w-12 text-center">S/N</Th>
                <Th className="text-left">Subject</Th>
                <Th className="w-16 text-center">CA1</Th>
                <Th className="w-16 text-center">CA2</Th>
                <Th className="w-16 text-center">Exam</Th>
                <Th className="w-16 text-center">Total</Th>
                <Th className="w-16 text-center">Grade</Th>
                <Th className="text-left">Remark</Th>
              </tr>
            </thead>

            {/* ---- Table Body ---- */}
            <tbody>
              {results.map((row, idx) => (
                <tr
                  key={row.subject}
                  className={cn(
                    /* Alternating row colours */
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                    "border-t border-gray-200 transition-colors",
                    "hover:bg-teal-50/50"
                  )}
                >
                  {/* Serial number */}
                  <Td className="text-center text-gray-500">
                    {idx + 1}
                  </Td>

                  {/* Subject name */}
                  <Td className="font-medium text-gray-800">
                    {row.subject}
                  </Td>

                  {/* Continuous Assessment 1 */}
                  <Td className="text-center">{row.ca1}</Td>

                  {/* Continuous Assessment 2 */}
                  <Td className="text-center">{row.ca2}</Td>

                  {/* Exam score */}
                  <Td className="text-center">{row.exam}</Td>

                  {/* Total */}
                  <Td className="text-center font-bold">{row.total}</Td>

                  {/* Grade — colour-coded */}
                  <Td className="text-center">
                    <span
                      className={cn(
                        "inline-block rounded px-2 py-0.5 text-xs font-bold",
                        gradeColorClass(row.grade),
                        gradeBgClass(row.grade)
                      )}
                    >
                      {row.grade}
                    </span>
                  </Td>

                  {/* Remark */}
                  <Td className="text-gray-600">{row.remark}</Td>
                </tr>
              ))}

              {/* Empty-state row */}
              {results.length === 0 && (
                <tr>
                  <Td
                    className="py-8 text-center text-gray-400 italic"
                    colSpan={8}
                  >
                    No results available for this term.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  SECTION D — PERFORMANCE SUMMARY                                   */}
      {/* ================================================================== */}
      <section className="px-4 sm:px-8">
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-4",
            "rounded-lg border-2 border-teal-200 bg-teal-50 px-6 py-4"
          )}
        >
          {/* Total score */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
              Total Score
            </p>
            <p className="text-2xl font-bold text-teal-900">
              {termTotalScore}
              <span className="text-sm font-normal text-teal-600">
                {" "}
                / {results.length * 100}
              </span>
            </p>
          </div>

          {/* Divider (hidden on tiny screens) */}
          <div className="hidden h-10 w-px bg-teal-300 sm:block" />

          {/* Average percentage */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
              Average Percentage
            </p>
            <p className="text-2xl font-bold text-teal-900">
              {averagePercentage.toFixed(1)}%
            </p>
          </div>

          {/* Divider */}
          <div className="hidden h-10 w-px bg-teal-300 sm:block" />

          {/* Number of subjects */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
              Subjects Offered
            </p>
            <p className="text-2xl font-bold text-teal-900">
              {results.length}
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  SECTION E — REMARKS                                               */}
      {/* ================================================================== */}
      <section className="space-y-4 px-4 py-5 sm:px-8">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-teal-800">
          <MessageSquare className="h-4 w-4" />
          Remarks
        </h3>

        {/* Form Master's Remark */}
        <RemarkBox
          label="Form Master's Remark"
          remark={formMasterRemark}
        />

        {/* Principal's Remark */}
        <RemarkBox
          label="Principal's Remark"
          remark={principalRemark}
        />
      </section>

      {/* ================================================================== */}
      {/*  SECTION F — SIGNATURES                                            */}
      {/* ================================================================== */}
      <section
        className={cn(
          "grid grid-cols-1 gap-6 border-t border-gray-200",
          "px-4 py-6 sm:grid-cols-2 sm:px-8"
        )}
      >
        <SignatureLine label="Form Master's Signature" />
        <SignatureLine label="Principal's Signature" />
      </section>

      {/* ================================================================== */}
      {/*  PRINT BUTTON (hidden when printing)                               */}
      {/* ================================================================== */}
      <div className="border-t border-gray-200 px-8 py-4 text-center print:hidden">
        {/*
         * Since this is a Server Component we cannot use onClick directly.
         * We render a <button> and wire it with an inline module script
         * that calls window.print(). This is safe, framework-agnostic,
         * and avoids the need for a separate client component file.
         */}
        <button
          id="gradesync-print-btn"
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg",
            "bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white",
            "shadow-sm transition-colors hover:bg-teal-800",
            "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          )}
        >
          <Printer className="h-4 w-4" />
          Print Report Card
        </button>

        {/* Inline script to bind the click handler — runs in the browser */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.getElementById("gradesync-print-btn")
                ?.addEventListener("click", function () { window.print(); });
            `,
          }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  5. SUB-COMPONENTS (private helpers)                                       */
/* -------------------------------------------------------------------------- */

/**
 * InfoRow — A single label/value pair used in the student info grid.
 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="min-w-[120px] font-semibold text-gray-500">
        {label}:
      </span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

/**
 * Th — Styled table header cell.
 * Applies consistent padding and bold white text on the teal header row.
 */
function Th({
  children,
  className: extraClass,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-3 py-2.5 text-xs font-bold uppercase tracking-wider",
        extraClass
      )}
    >
      {children}
    </th>
  );
}

/**
 * Td — Styled table data cell.
 * Accepts an optional `colSpan` for empty-state rows.
 */
function Td({
  children,
  className: extraClass,
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn("whitespace-nowrap px-3 py-2", extraClass)}
    >
      {children}
    </td>
  );
}

/**
 * RemarkBox — A bordered box displaying a teacher/principal remark.
 * If no remark is provided, a muted placeholder is shown.
 */
function RemarkBox({
  label,
  remark,
}: {
  label: string;
  remark?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p
        className={cn(
          "text-sm leading-relaxed",
          remark ? "text-gray-800" : "italic text-gray-400"
        )}
      >
        {remark || "No remark provided."}
      </p>
    </div>
  );
}

/**
 * SignatureLine — Renders a horizontal line with a label beneath it,
 * mimicking a traditional signature block on printed report cards.
 */
function SignatureLine({ label }: { label: string }) {
  return (
    <div className="space-y-1 pt-4">
      {/* The signature line */}
      <div className="border-b-2 border-dotted border-gray-400" />

      {/* Label & date placeholder */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-600">{label}</p>
        <p className="text-xs text-gray-400">
          Date: _______________
        </p>
      </div>
    </div>
  );
}
