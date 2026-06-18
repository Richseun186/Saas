"use client";

import { useState } from "react";
import { recordPayment } from "@/actions/fees";
import { CreditCard, History, Receipt } from "lucide-react";

export default function ParentFeesClient({ invoices }: { invoices: any[] }) {
  const [isPaying, setIsPaying] = useState(false);

  const handleSimulatePayment = async (invoiceId: string, amountDue: number, amountPaid: number) => {
    const remaining = amountDue - amountPaid;
    if (remaining <= 0) return;

    if (!confirm(`Simulate paying ₦${remaining.toLocaleString()} via card?`)) return;

    setIsPaying(true);
    const res = await recordPayment(invoiceId, remaining, "Simulated Card Payment");
    setIsPaying(false);

    if (res.success) {
      alert("Payment successful! Receipt generated.");
    } else {
      alert("Payment failed: " + res.error);
    }
  };

  const pendingInvoices = invoices.filter(inv => inv.status !== "PAID");
  const paidInvoices = invoices.filter(inv => inv.status === "PAID");

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent w-fit">
          Fees & Payments
        </h1>
        <p className="text-muted-foreground mt-1">Manage outstanding bills and view payment history.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Outstanding Bills */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-400" />
            Outstanding Bills
          </h2>
          {pendingInvoices.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center text-emerald-400 font-medium">
              You have no outstanding bills. Great job!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInvoices.map(inv => {
                const totalPaid = inv.payments.reduce((sum: number, p: any) => sum + p.amountPaid, 0);
                const remaining = inv.amountDue - totalPaid;

                return (
                  <div key={inv.id} className="glass-card p-5 rounded-2xl border-l-4 border-l-rose-500 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{inv.feeCategory.name}</h3>
                        <p className="text-sm text-muted-foreground">For: {inv.enrollment.student.name} ({inv.enrollment.sessionTerm.name})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-rose-400">₦{remaining.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Original: ₦{inv.amountDue.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleSimulatePayment(inv.id, inv.amountDue, totalPaid)}
                      disabled={isPaying}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      {isPaying ? "Processing..." : "Pay Now (Simulate)"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Payment History
          </h2>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {invoices.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No payment history found.</div>
              ) : (
                invoices.flatMap(inv => inv.payments).sort((a: any, b: any) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()).map((payment: any) => {
                  const invoice = invoices.find(i => i.id === payment.invoiceId);
                  return (
                    <div key={payment.id} className="p-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                      <div>
                        <p className="font-medium">{invoice?.feeCategory.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.paymentDate).toLocaleDateString()} • {payment.method}
                        </p>
                      </div>
                      <p className="font-bold text-emerald-400">+₦{payment.amountPaid.toLocaleString()}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
