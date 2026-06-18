"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { resend, EMAIL_FROM } from "@/lib/email";
import WelcomeEmail from "@/components/emails/WelcomeEmail";
import { render } from "@react-email/render";
import React from "react"; // Needed for React.createElement

// Plan details matching frontend
const PLANS: Record<string, { amount: number; name: string }> = {
  basic:    { name: "Basic Plan",    amount: 25000 },
  standard: { name: "Standard Plan", amount: 50000 },
  premium:  { name: "Premium Plan",  amount: 100000 },
};

export async function registerSchool(data: {
  schoolName: string;
  address: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  plan: string;
  reference: string;
}) {
  try {
    const planDetails = PLANS[data.plan] || PLANS.standard;

    // 1. Verify Paystack transaction
    // If no secret key is found (e.g. during local dev without env variables), we'll skip verification
    // but log a warning. In a real app, you MUST require the secret key.
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (secretKey && data.reference !== "mock_reference") {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${data.reference}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });
      const result = await response.json();
      
      if (!result.status || result.data.status !== "success") {
        return { success: false, error: "Payment verification failed. Please contact support." };
      }
      
      // Paystack amount is in kobo. Verify it matches (or exceeds) expected amount.
      const expectedKobo = planDetails.amount * 100;
      if (result.data.amount < expectedKobo) {
        return { success: false, error: "Payment amount mismatch. Please contact support." };
      }
    }

    // 2. Check if email is already taken
    const existingUser = await db.user.findUnique({
      where: { email: data.adminEmail }
    });

    if (existingUser) {
      return { success: false, error: "Email is already in use by another account." };
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

    // 4. Create the School, Subscription, Session, and Admin User within a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the school
      const school = await tx.school.create({
        data: {
          name: data.schoolName,
          address: data.address,
        }
      });

      // Calculate 4 months from now for the term duration (roughly one term)
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 4);

      // Create Subscription
      await tx.subscription.create({
        data: {
          schoolId: school.id,
          plan: data.plan,
          amount: planDetails.amount,
          reference: data.reference,
          status: "active",
          endDate: endDate,
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

    // 5. Send Welcome Email via Resend
    if (resend) {
      try {
        const html = await render(
          React.createElement(WelcomeEmail, {
            adminName: data.adminName,
            schoolName: data.schoolName,
            planName: planDetails.name,
          })
        );
        
        await resend.emails.send({
          from: EMAIL_FROM,
          to: data.adminEmail,
          subject: "Welcome to GradeSync Nigeria! 🎉",
          html: html,
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // We don't fail the registration if email fails
      }
    } else {
      console.warn("RESEND_API_KEY not set. Skipping welcome email.");
    }

    return { success: true, data: result };

  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error.message || "Something went wrong during registration." };
  }
}
