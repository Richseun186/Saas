"use server";

import { db } from "@/lib/db";

export async function getStudentReportCard(studentId: string) {
  // Find active term for the student's school
  const student = await db.user.findUnique({
    where: { id: studentId },
    select: { name: true, email: true, schoolId: true }
  });

  if (!student || !student.schoolId) return null;

  const activeTerm = await db.sessionTerm.findFirst({
    where: { schoolId: student.schoolId, isActive: true },
    include: { school: true }
  });

  if (!activeTerm) return null;

  // Find enrollment for this term
  const enrollment = await db.enrollment.findFirst({
    where: { studentId, sessionTermId: activeTerm.id },
    include: {
      class: true,
      results: {
        include: {
          schoolSubject: {
            include: { subjectBank: true }
          }
        }
      }
    }
  });

  if (!enrollment) return null;

  // Calculate totals and format results for the ReportCard component
  let termTotalScore = 0;
  const resultsData = enrollment.results.map(r => {
    termTotalScore += r.total;
    return {
      subject: r.schoolSubject.subjectBank.name,
      ca1: r.ca1,
      ca2: r.ca2,
      exam: r.exam,
      total: r.total,
      grade: r.grade || "-",
      remark: r.remark || "-"
    };
  });

  const totalStudents = await db.enrollment.count({
    where: { classId: enrollment.classId, sessionTermId: activeTerm.id }
  });

  const averagePercentage = resultsData.length > 0 ? (termTotalScore / (resultsData.length * 100)) * 100 : 0;

  return {
    schoolName: activeTerm.school.name,
    schoolAddress: activeTerm.school.address || "Nigeria",
    schoolMotto: "Knowledge is Power", // Static for now
    session: activeTerm.name,
    term: "Term", // Derived from name usually, let's just pass activeTerm.name
    studentName: student.name || student.email,
    admissionNo: "GSN-" + studentId.substring(0, 4).toUpperCase(),
    className: enrollment.class.name,
    classPosition: "N/A", // Calculating exact position requires analyzing all students, skipping for demo speed
    totalStudents,
    results: resultsData,
    termTotalScore,
    averagePercentage,
    formMasterRemark: enrollment.formMasterRemark || undefined,
    principalRemark: enrollment.principalRemark || undefined
  };
}
