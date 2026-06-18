"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function getParentLinkedStudents() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const links = await db.parentStudentLink.findMany({
    where: { parentId: session.user.id },
    include: {
      student: { select: { id: true, name: true, email: true, image: true } }
    }
  });

  return links.map(link => link.student);
}

export async function getStudentFullProfile(studentId: string) {
  // 1. Get active term for the student's school
  const student = await db.user.findUnique({
    where: { id: studentId },
    select: { schoolId: true }
  });

  if (!student?.schoolId) return null;

  const activeTerm = await db.sessionTerm.findFirst({
    where: { schoolId: student.schoolId, isActive: true },
  });

  if (!activeTerm) return null;

  // 2. Fetch the enrollment for that active term, including all related data
  const enrollment = await db.enrollment.findUnique({
    where: { studentId_sessionTermId: { studentId, sessionTermId: activeTerm.id } },
    include: {
      class: true,
      results: {
        include: { schoolSubject: { include: { subjectBank: true } } }
      },
      affectiveDomain: true,
      psychomotorDomain: true,
      attendanceRecords: true
    }
  });

  if (!enrollment) return null;

  // Calculate aggregates
  const totalMarks = enrollment.results.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const average = enrollment.results.length > 0 ? (totalMarks / (enrollment.results.length * 100)) * 100 : 0;
  
  const presentCount = enrollment.attendanceRecords.filter(r => r.status === "PRESENT").length;
  const absentCount = enrollment.attendanceRecords.filter(r => r.status === "ABSENT").length;
  const lateCount = enrollment.attendanceRecords.filter(r => r.status === "LATE").length;

  return {
    enrollment,
    activeTerm,
    stats: { average, presentCount, absentCount, lateCount }
  };
}
