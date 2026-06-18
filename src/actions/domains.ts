"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────
// Get or create affective domain record for an enrollment
// ─────────────────────────────────────────────────────────────
export async function getOrCreateAffectiveDomain(enrollmentId: string) {
  const existing = await db.affectiveDomain.findUnique({ where: { enrollmentId } });
  if (existing) return existing;
  return db.affectiveDomain.create({ data: { enrollmentId } });
}

// ─────────────────────────────────────────────────────────────
// Get or create psychomotor domain record for an enrollment
// ─────────────────────────────────────────────────────────────
export async function getOrCreatePsychomotorDomain(enrollmentId: string) {
  const existing = await db.psychomotorDomain.findUnique({ where: { enrollmentId } });
  if (existing) return existing;
  return db.psychomotorDomain.create({ data: { enrollmentId } });
}

// ─────────────────────────────────────────────────────────────
// FORM MASTER: Save affective domain scores for a student
// ─────────────────────────────────────────────────────────────
export async function saveAffectiveDomain(
  enrollmentId: string,
  data: {
    punctuality: number;
    neatness: number;
    politeness: number;
    honesty: number;
    attentiveness: number;
    perseverance: number;
    cooperation: number;
    leadership: number;
  }
) {
  try {
    await db.affectiveDomain.upsert({
      where: { enrollmentId },
      update: data,
      create: { enrollmentId, ...data },
    });
    revalidatePath("/form-master");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────
// FORM MASTER: Save psychomotor domain scores for a student
// ─────────────────────────────────────────────────────────────
export async function savePsychomotorDomain(
  enrollmentId: string,
  data: {
    handwriting: number;
    sports: number;
    drawing: number;
    verbal_fluency: number;
    musical_skill: number;
    computer_skill: number;
  }
) {
  try {
    await db.psychomotorDomain.upsert({
      where: { enrollmentId },
      update: data,
      create: { enrollmentId, ...data },
    });
    revalidatePath("/form-master");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────
// Fetch all students in a class with their domain scores
// ─────────────────────────────────────────────────────────────
export async function getClassStudentsWithDomains(classId: string, termId: string) {
  return db.enrollment.findMany({
    where: { classId, sessionTermId: termId },
    include: {
      student: { select: { id: true, name: true, image: true } },
      affectiveDomain: true,
      psychomotorDomain: true,
    },
    orderBy: { student: { name: "asc" } },
  });
}
