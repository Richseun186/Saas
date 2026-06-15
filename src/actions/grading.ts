"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getFormMasterClasses(userId: string) {
  return await db.class.findMany({
    where: { formMasterId: userId },
    select: { id: true, name: true, schoolId: true }
  });
}

export async function getActiveTerm(schoolId: string) {
  return await db.sessionTerm.findFirst({
    where: { schoolId, isActive: true },
    select: { id: true, name: true }
  });
}

export async function getSchoolSubjects(schoolId: string) {
  return await db.schoolSubject.findMany({
    where: { schoolId },
    include: { subjectBank: true }
  });
}

export async function getBroadsheetData(classId: string, termId: string, schoolSubjectId: string) {
  // Get all students enrolled in this class for this term
  const enrollments = await db.enrollment.findMany({
    where: { classId, sessionTermId: termId },
    include: {
      student: { select: { id: true, name: true, email: true } },
      results: {
        where: { schoolSubjectId }
      }
    },
    orderBy: { student: { name: 'asc' } }
  });

  return enrollments.map(e => {
    const result = e.results[0] || null;
    return {
      enrollmentId: e.id,
      studentId: e.student.id,
      studentName: e.student.name || e.student.email,
      ca1: result?.ca1 || 0,
      ca2: result?.ca2 || 0,
      exam: result?.exam || 0,
      total: result?.total || 0,
      grade: result?.grade || "-",
      remark: result?.remark || "-",
    };
  });
}

function calculateGradeAndRemark(total: number) {
  if (total >= 75) return { grade: "A1", remark: "Excellent" };
  if (total >= 70) return { grade: "B2", remark: "Very Good" };
  if (total >= 65) return { grade: "B3", remark: "Good" };
  if (total >= 60) return { grade: "C4", remark: "Credit" };
  if (total >= 55) return { grade: "C5", remark: "Credit" };
  if (total >= 50) return { grade: "C6", remark: "Credit" };
  if (total >= 45) return { grade: "D7", remark: "Pass" };
  if (total >= 40) return { grade: "E8", remark: "Pass" };
  return { grade: "F9", remark: "Fail" };
}

export async function saveScores(
  schoolSubjectId: string,
  scores: Array<{ enrollmentId: string; ca1: number; ca2: number; exam: number }>
) {
  try {
    const operations = scores.map(s => {
      const total = s.ca1 + s.ca2 + s.exam;
      const { grade, remark } = calculateGradeAndRemark(total);
      
      return db.result.upsert({
        where: {
          enrollmentId_schoolSubjectId: {
            enrollmentId: s.enrollmentId,
            schoolSubjectId
          }
        },
        update: {
          ca1: s.ca1,
          ca2: s.ca2,
          exam: s.exam,
          total,
          grade,
          remark
        },
        create: {
          enrollmentId: s.enrollmentId,
          schoolSubjectId,
          ca1: s.ca1,
          ca2: s.ca2,
          exam: s.exam,
          total,
          grade,
          remark
        }
      });
    });

    await db.$transaction(operations);
    revalidatePath("/form-master");
    
    return { success: true };
  } catch (error: any) {
    console.error("Save scores error:", error);
    return { success: false, error: error.message };
  }
}
