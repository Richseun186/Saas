"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// ─────────────────────────────────────────────────────────────
// ADMIN: Fetch all allocations for a school (by active term)
// ─────────────────────────────────────────────────────────────
export async function getAllocationsForSchool(schoolId: string) {
  const activeTerm = await db.sessionTerm.findFirst({
    where: { schoolId, isActive: true },
  });

  if (!activeTerm) return { allocations: [], activeTerm: null };

  const allocations = await db.subjectAllocation.findMany({
    where: { sessionTermId: activeTerm.id },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      class: { select: { id: true, name: true } },
      schoolSubject: {
        include: { subjectBank: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return { allocations, activeTerm };
}

// ─────────────────────────────────────────────────────────────
// ADMIN: Get data needed to populate allocation form
// ─────────────────────────────────────────────────────────────
export async function getAllocationFormData(schoolId: string) {
  const [teachers, classes, subjects, activeTerm] = await Promise.all([
    db.user.findMany({
      where: {
        schoolId,
        roles: { hasSome: ["SUBJECT_TEACHER", "FORM_MASTER"] },
      },
      select: { id: true, name: true, email: true, roles: true },
      orderBy: { name: "asc" },
    }),
    db.class.findMany({
      where: { schoolId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.schoolSubject.findMany({
      where: { schoolId },
      include: { subjectBank: { select: { name: true } } },
      orderBy: { subjectBank: { name: "asc" } },
    }),
    db.sessionTerm.findFirst({
      where: { schoolId, isActive: true },
    }),
  ]);

  return { teachers, classes, subjects, activeTerm };
}

// ─────────────────────────────────────────────────────────────
// ADMIN: Create a new subject allocation
// ─────────────────────────────────────────────────────────────
export async function createAllocation(data: {
  teacherId: string;
  classId: string;
  schoolSubjectId: string;
  sessionTermId: string;
}) {
  try {
    await db.subjectAllocation.create({ data });
    revalidatePath("/admin/allocations");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "This subject is already assigned to a teacher for this class and term." };
    }
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ADMIN: Remove an allocation
// ─────────────────────────────────────────────────────────────
export async function deleteAllocation(allocationId: string) {
  try {
    await db.subjectAllocation.delete({ where: { id: allocationId } });
    revalidatePath("/admin/allocations");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────
// SUBJECT TEACHER: Fetch their own allocated subjects
// ─────────────────────────────────────────────────────────────
export async function getMyAllocations() {
  const session = await auth();
  if (!session?.user?.id) return { allocations: [], activeTerm: null };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { schoolId: true },
  });

  if (!user?.schoolId) return { allocations: [], activeTerm: null };

  const activeTerm = await db.sessionTerm.findFirst({
    where: { schoolId: user.schoolId, isActive: true },
  });

  if (!activeTerm) return { allocations: [], activeTerm: null };

  const allocations = await db.subjectAllocation.findMany({
    where: {
      teacherId: session.user.id,
      sessionTermId: activeTerm.id,
    },
    include: {
      class: { select: { id: true, name: true } },
      schoolSubject: {
        include: { subjectBank: { select: { name: true } } },
      },
      sessionTerm: { select: { name: true } },
    },
    orderBy: { class: { name: "asc" } },
  });

  return { allocations, activeTerm };
}
