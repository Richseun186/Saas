"use client";

import { useState } from "react";
import { saveClassAttendance, AttendanceStatus } from "@/actions/attendance";
import { CheckCircle2, XCircle, Clock, Save } from "lucide-react";

interface StudentAttendance {
  enrollmentId: string;
  studentName: string;
  status: AttendanceStatus | null;
  note: string;
}

export default function ClientAttendanceTable({
  initialData,
  dateStr,
}: {
  initialData: StudentAttendance[];
  dateStr: string;
}) {
  const [data, setData] = useState<StudentAttendance[]>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = (enrollmentId: string, status: AttendanceStatus) => {
    setData((prev) =>
      prev.map((s) => (s.enrollmentId === enrollmentId ? { ...s, status } : s))
    );
  };

  const handleNoteChange = (enrollmentId: string, note: string) => {
    setData((prev) =>
      prev.map((s) => (s.enrollmentId === enrollmentId ? { ...s, note } : s))
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setData((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSave = async () => {
    // Only save those that have a status selected
    const recordsToSave = data.filter((s) => s.status !== null) as {
      enrollmentId: string;
      status: AttendanceStatus;
      note?: string;
    }[];

    if (recordsToSave.length === 0) {
      alert("Please mark attendance for at least one student before saving.");
      return;
    }

    setIsSaving(true);
    const result = await saveClassAttendance(dateStr, recordsToSave);
    setIsSaving(false);

    if (result.success) {
      alert("Attendance saved successfully!");
    } else {
      alert("Failed to save: " + result.error);
    }
  };

  const presentCount = data.filter((s) => s.status === "PRESENT").length;
  const absentCount = data.filter((s) => s.status === "ABSENT").length;
  const lateCount = data.filter((s) => s.status === "LATE").length;

  return (
    <div className="space-y-6">
      {/* ── Action Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground mr-2">Mark all as:</span>
          <button
            onClick={() => handleMarkAll("PRESENT")}
            className="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors font-medium flex items-center gap-1"
          >
            <CheckCircle2 className="w-4 h-4" /> Present
          </button>
          <button
            onClick={() => handleMarkAll("ABSENT")}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors font-medium flex items-center gap-1"
          >
            <XCircle className="w-4 h-4" /> Absent
          </button>
        </div>

        <div className="flex gap-4 text-sm font-medium">
          <span className="text-teal-400">{presentCount} Present</span>
          <span className="text-rose-400">{absentCount} Absent</span>
          <span className="text-amber-400">{lateCount} Late</span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-black/20">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-1/3">Student</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Attendance Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Note (Optional)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((student, i) => (
              <tr
                key={student.enrollmentId}
                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                  i === data.length - 1 ? "border-b-0" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium">
                  {student.studentName}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(student.enrollmentId, "PRESENT")}
                      className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all ${
                        student.status === "PRESENT"
                          ? "bg-teal-500/20 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                          : "border-white/10 text-muted-foreground hover:bg-white/10"
                      }`}
                      title="Present"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.enrollmentId, "ABSENT")}
                      className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all ${
                        student.status === "ABSENT"
                          ? "bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                          : "border-white/10 text-muted-foreground hover:bg-white/10"
                      }`}
                      title="Absent"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.enrollmentId, "LATE")}
                      className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all ${
                        student.status === "LATE"
                          ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                          : "border-white/10 text-muted-foreground hover:bg-white/10"
                      }`}
                      title="Late"
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={student.note}
                    onChange={(e) => handleNoteChange(student.enrollmentId, e.target.value)}
                    placeholder="E.g., Sick, Traffic..."
                    className="w-full bg-transparent border-b border-white/10 focus:border-teal-500 py-1 text-sm outline-none transition-colors"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-90 text-white px-6 py-3 rounded-xl font-semibold shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-50 transition-all"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
}
