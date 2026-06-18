"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getActiveTerm } from "./grading"; // Re-use

// --- ADMIN ACTIONS ---

export async function getFeeCategories(schoolId: string) {
  return await db.feeCategory.findMany({
    where: { schoolId },
    orderBy: { createdAt: "desc" }
  });
}

export async function createFeeCategory(data: { schoolId: string, name: string, amount: number, description?: string }) {
  try {
    const fee = await db.feeCategory.create({ data });
    revalidatePath("/admin/fees");
    return { success: true, fee };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateInvoicesForClass(classId: string, feeCategoryId: string) {
  try {
    const cls = await db.class.findUnique({ where: { id: classId }, select: { schoolId: true } });
    if (!cls) return { success: false, error: "Class not found" };

    const term = await getActiveTerm(cls.schoolId);
    if (!term) return { success: false, error: "No active term" };

    const fee = await db.feeCategory.findUnique({ where: { id: feeCategoryId } });
    if (!fee) return { success: false, error: "Fee category not found" };

    // Get all enrollments for this class in active term
    const enrollments = await db.enrollment.findMany({
      where: { classId, sessionTermId: term.id }
    });

    let createdCount = 0;
    for (const e of enrollments) {
      // Check if invoice already exists for this fee & enrollment
      const existing = await db.invoice.findFirst({
        where: { enrollmentId: e.id, feeCategoryId }
      });
      
      if (!existing) {
        await db.invoice.create({
          data: {
            enrollmentId: e.id,
            feeCategoryId,
            amountDue: fee.amount,
            status: "PENDING"
          }
        });
        createdCount++;
      }
    }

    revalidatePath("/admin/fees");
    return { success: true, message: `Created ${createdCount} invoices.` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllInvoices(schoolId: string) {
  return await db.invoice.findMany({
    where: {
      enrollment: { class: { schoolId } }
    },
    include: {
      enrollment: {
        include: {
          student: { select: { id: true, name: true, email: true } },
          class: { select: { name: true } },
          sessionTerm: { select: { name: true } }
        }
      },
      feeCategory: true,
      payments: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function recordPayment(invoiceId: string, amountPaid: number, method: string, referenceNumber?: string) {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true }
    });
    if (!invoice) return { success: false, error: "Invoice not found" };

    // Create payment record
    await db.paymentRecord.create({
      data: {
        invoiceId,
        amountPaid,
        method,
        referenceNumber
      }
    });

    // Recalculate status
    const totalPaidSoFar = invoice.payments.reduce((sum, p) => sum + p.amountPaid, 0) + amountPaid;
    let newStatus: "PENDING" | "PARTIAL" | "PAID" = "PENDING";
    
    if (totalPaidSoFar >= invoice.amountDue) newStatus = "PAID";
    else if (totalPaidSoFar > 0) newStatus = "PARTIAL";

    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus }
    });

    revalidatePath("/admin/fees");
    revalidatePath("/parent/fees");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- PARENT ACTIONS ---

export async function getParentInvoices(parentId: string) {
  return await db.invoice.findMany({
    where: {
      enrollment: {
        student: {
          parentLinks: { some: { parentId } }
        }
      }
    },
    include: {
      feeCategory: true,
      payments: true,
      enrollment: {
        include: {
          student: { select: { name: true } },
          sessionTerm: { select: { name: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}
