"use server";

import { db } from "@/lib/db";
import bcryptjs from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function setupDemoEnvironment() {
  try {
    // 1. Get or Create School
    let school = await db.school.findFirst();
    if (!school) {
      school = await db.school.create({
        data: { name: "GradeSync International Academy", address: "Lagos, Nigeria" },
      });
    }

    // 2. Get or Create Session/Term
    let term = await db.sessionTerm.findFirst();
    if (!term) {
      term = await db.sessionTerm.create({
        data: {
          name: "2025/2026 First Term",
          schoolId: school.id,
          isActive: true,
        },
      });
    }

    // 3. Get or Create Class (JSS1)
    let classJss1 = await db.class.findFirst({ where: { name: "JSS 1A" } });
    if (!classJss1) {
      // Find a Form Master to assign, or create one
      let formMaster = await db.user.findFirst({ where: { roles: { has: "FORM_MASTER" } } });
      if (!formMaster) {
        const hashed = await bcryptjs.hash("teacher123", 10);
        formMaster = await db.user.create({
          data: {
            name: "Mr. Ojo (Teacher)",
            email: "teacher@gradesync.edu",
            password: hashed,
            roles: ["FORM_MASTER"],
            schoolId: school.id,
          },
        });
      }

      classJss1 = await db.class.create({
        data: {
          name: "JSS 1A",
          schoolId: school.id,
          formMasterId: formMaster.id,
        },
      });
    }

    // 4. Seed 3 Dummy Students into that class
    const dummyStudents = [
      { name: "Chinedu Eze", email: "chinedu@student.edu" },
      { name: "Aisha Bello", email: "aisha@student.edu" },
      { name: "Oluwaseun Adeyemi", email: "seun@student.edu" },
    ];

    const studentIds = [];
    for (const s of dummyStudents) {
      let student = await db.user.findUnique({ where: { email: s.email } });
      if (!student) {
        const hashed = await bcryptjs.hash("student123", 10);
        student = await db.user.create({
          data: {
            name: s.name,
            email: s.email,
            password: hashed,
            roles: ["STUDENT"],
            schoolId: school.id,
          },
        });
      }
      studentIds.push(student.id);

      // Enroll student
      const existingEnrollment = await db.enrollment.findFirst({
        where: { studentId: student.id, sessionTermId: term.id },
      });
      if (!existingEnrollment) {
        await db.enrollment.create({
          data: {
            studentId: student.id,
            classId: classJss1.id,
            sessionTermId: term.id,
          },
        });
      }
    }

    // 5. Map Subjects to School if not mapped
    const existingSchoolSubjects = await db.schoolSubject.findMany({ where: { schoolId: school.id } });
    if (existingSchoolSubjects.length === 0) {
      const subjects = await db.subjectBank.findMany({
        where: { category: "JUNIOR_CORE" },
        take: 5,
      });
      
      for (const subj of subjects) {
        await db.schoolSubject.create({
          data: { schoolId: school.id, subjectBankId: subj.id },
        });
      }
    }

    // 6. Seed a Demo Parent linked to Chinedu
    let parent = await db.user.findUnique({ where: { email: "parent@gradesync.edu" } });
    if (!parent) {
      const hashed = await bcryptjs.hash("parent123", 10);
      parent = await db.user.create({
        data: {
          name: "Mr. Eze (Parent)",
          email: "parent@gradesync.edu",
          password: hashed,
          roles: ["PARENT"],
          schoolId: school.id,
        },
      });

      // Link to Chinedu
      const chinedu = await db.user.findUnique({ where: { email: "chinedu@student.edu" } });
      if (chinedu) {
        await db.parentStudentLink.create({
          data: {
            parentId: parent.id,
            studentId: chinedu.id,
            relationshipType: "Father",
          },
        });
      }
    }

    revalidatePath("/admin");
    return { success: true, message: "Demo environment setup successfully!" };

  } catch (error: any) {
    console.error("Setup Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminDashboardData() {
  const school = await db.school.findFirst();
  const term = await db.sessionTerm.findFirst();
  const classes = await db.class.count();
  const students = await db.user.count({ where: { roles: { has: "STUDENT" } } });
  
  return {
    school,
    term,
    stats: { classes, students }
  };
}
