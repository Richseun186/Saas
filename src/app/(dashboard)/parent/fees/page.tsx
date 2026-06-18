import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getParentInvoices } from "@/actions/fees";
import ParentFeesClient from "./ParentFeesClient";

export default async function ParentFeesPage() {
  const session = await auth();
  if (!session?.user || !session.user.roles?.includes("PARENT")) redirect("/login");

  const invoices = await getParentInvoices(session.user.id);

  return (
    <div className="container py-8 min-h-[calc(100vh-4rem)]">
      <ParentFeesClient invoices={invoices} />
    </div>
  );
}
