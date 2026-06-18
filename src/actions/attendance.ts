"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export async function getClassAttendanceByDate(classId: string, termId: string, dateStr: string) {
  // Parse date string (YYYY-MM-DD) into a Date object at UTC midnight
  const date = new Date(dateStr);

  // Get all students enrolled in this class for this term
  const enrollments = await db.enrollment.findMany({
    where: { classId, sessionTermId: termId },
    include: {
      student: { select: { id: true, name: true, image: true } },
      attendanceRecords: {
        where: { date }
      }
    },
    orderBy: { student: { name: "asc" } },
  });

  return enrollments.map(e => {
    const record = e.attendanceRecords[0] || null;
    return {
      enrollmentId: e.id,
      studentName: e.student.name || "Unknown Student",
      status: (record?.status as AttendanceStatus) || null,
      note: record?.note || "",
    };
  });
}

export async function saveClassAttendance(
  dateStr: string,
  records: Array<{ enrollmentId: string; status: AttendanceStatus; note?: string }>
) {
  try {
    const date = new Date(dateStr);

    const operations = records.map(record => {
      return db.attendanceRecord.upsert({
        where: {
          enrollmentId_date: {
            enrollmentId: record.enrollmentId,
            date
          }
        },
        update: {
          status: record.status as any, // Cast for Prisma generated types
          note: record.note
        },
        create: {
          enrollmentId: record.enrollmentId,
          date,
          status: record.status as any,
          note: record.note
        }
      });
    });

    await db.$transaction(operations);
    revalidatePath("/form-master/attendance");

    return { success: true };
  } catch (error: any) {
    console.error("Save attendance error:", error);
    return { success: false, error: error.message };
  }
}
