"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- TEACHER ACTIONS ---

export async function createCbtExam(data: {
  title: string;
  description?: string;
  durationMinutes: number;
  classId: string;
  schoolSubjectId: string;
  sessionTermId: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const exam = await db.cbtExam.create({
      data: {
        ...data,
        teacherId: session.user.id
      }
    });

    revalidatePath("/subject-teacher/cbt");
    return { success: true, exam };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addCbtQuestion(examId: string, data: {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  marks: number;
}) {
  try {
    await db.cbtQuestion.create({
      data: { examId, ...data }
    });
    revalidatePath(`/subject-teacher/cbt/${examId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTeacherExams(teacherId: string) {
  return await db.cbtExam.findMany({
    where: { teacherId },
    include: {
      class: true,
      schoolSubject: { include: { subjectBank: true } },
      _count: { select: { questions: true, attempts: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

// --- STUDENT ACTIONS ---

export async function getStudentExams(studentId: string, termId: string) {
  // Get student's enrollment for this term
  const enrollment = await db.enrollment.findUnique({
    where: { studentId_sessionTermId: { studentId, sessionTermId: termId } }
  });

  if (!enrollment) return [];

  // Find exams for this class and term
  const exams = await db.cbtExam.findMany({
    where: { classId: enrollment.classId, sessionTermId: termId },
    include: {
      schoolSubject: { include: { subjectBank: true } },
      teacher: { select: { name: true } },
      _count: { select: { questions: true } },
      attempts: { where: { enrollmentId: enrollment.id } } // Check if attempted
    },
    orderBy: { createdAt: "desc" }
  });

  return exams;
}

export async function startCbtAttempt(examId: string, studentId: string, termId: string) {
  try {
    const enrollment = await db.enrollment.findUnique({
      where: { studentId_sessionTermId: { studentId, sessionTermId: termId } }
    });
    if (!enrollment) return { success: false, error: "Not enrolled" };

    // Check if attempt exists
    let attempt = await db.cbtAttempt.findUnique({
      where: { examId_enrollmentId: { examId, enrollmentId: enrollment.id } }
    });

    if (attempt && attempt.status === "SUBMITTED") {
      return { success: false, error: "Exam already submitted" };
    }

    if (!attempt) {
      attempt = await db.cbtAttempt.create({
        data: {
          examId,
          enrollmentId: enrollment.id,
          status: "ONGOING"
        }
      });
    }

    return { success: true, attemptId: attempt.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitCbtExam(attemptId: string, answers: Record<string, string>) {
  try {
    const attempt = await db.cbtAttempt.findUnique({
      where: { id: attemptId },
      include: { exam: { include: { questions: true } } }
    });

    if (!attempt || attempt.status === "SUBMITTED") {
      return { success: false, error: "Invalid attempt or already submitted" };
    }

    // Grade the exam
    let score = 0;
    for (const question of attempt.exam.questions) {
      const studentAnswer = answers[question.id];
      if (studentAnswer === question.correctOption) {
        score += question.marks;
      }
    }

    await db.cbtAttempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        endTime: new Date(),
        score
      }
    });

    revalidatePath("/student/cbt");
    return { success: true, score, total: attempt.exam.totalMarks };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getExamForAttempt(examId: string) {
  return await db.cbtExam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        select: { id: true, questionText: true, optionA: true, optionB: true, optionC: true, optionD: true, marks: true } // Don't expose correctOption to client
      },
      schoolSubject: { include: { subjectBank: true } }
    }
  });
}
