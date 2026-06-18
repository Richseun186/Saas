"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function registerSchool(data: {
  schoolName: string;
  address: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  plan: string;
}) {
  try {
    // 1. Check if email is already taken
    const existingUser = await db.user.findUnique({
      where: { email: data.adminEmail }
    });

    if (existingUser) {
      return { success: false, error: "Email is already in use by another account." };
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

    // 3. Create the School and the Admin User within a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the school
      const school = await tx.school.create({
        data: {
          name: data.schoolName,
          address: data.address,
        }
      });

      // Create an active Session Term for the new school
      await tx.sessionTerm.create({
        data: {
          name: "First Term 2026/2027",
          isActive: true,
          schoolId: school.id,
        }
      });

      // Create the Admin User
      const admin = await tx.user.create({
        data: {
          name: data.adminName,
          email: data.adminEmail,
          password: hashedPassword,
          roles: ["ADMIN"],
          schoolId: school.id,
        }
      });

      return { school, admin };
    });

    return { success: true, data: result };

  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error.message || "Something went wrong during registration." };
  }
}
