import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getFeeCategories, getAllInvoices } from "@/actions/fees";
import AdminFeesClient from "./AdminFeesClient";

export default async function AdminFeesPage() {
  const session = await auth();
  if (!session?.user || !session.user.roles?.includes("ADMIN")) redirect("/login");

  const dbUser = await db.user.findUnique({ where: { id: session.user.id }, select: { schoolId: true } });
  const schoolId = dbUser?.schoolId;
  if (!schoolId) return <div>No school associated with this admin account.</div>;

  const classes = await db.class.findMany({ where: { schoolId }, select: { id: true, name: true } });
  const categories = await getFeeCategories(schoolId);
  const invoices = await getAllInvoices(schoolId);

  return (
    <div className="container py-8 min-h-[calc(100vh-4rem)]">
      <AdminFeesClient 
        schoolId={schoolId}
        classes={classes}
        categories={categories}
        invoices={invoices}
      />
    </div>
  );
}
