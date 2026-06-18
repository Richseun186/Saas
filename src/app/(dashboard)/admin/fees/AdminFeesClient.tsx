"use client";

import { useState } from "react";
import { createFeeCategory, generateInvoicesForClass, recordPayment } from "@/actions/fees";
import { Plus, Send, WalletCards, Search } from "lucide-react";

export default function AdminFeesClient({
  schoolId,
  classes,
  categories,
  invoices
}: {
  schoolId: string;
  classes: { id: string; name: string }[];
  categories: any[];
  invoices: any[];
}) {
  const [activeTab, setActiveTab] = useState<"SETTINGS" | "INVOICING" | "LEDGER">("LEDGER");
  
  // Create Fee State
  const [feeName, setFeeName] = useState("");
  const [feeAmount, setFeeAmount] = useState("");

  // Invoice State
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [selectedFeeId, setSelectedFeeId] = useState(categories[0]?.id || "");
  const [isGenerating, setIsGenerating] = useState(false);

  // Ledger state
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeName || !feeAmount) return;
    const res = await createFeeCategory({
      schoolId,
      name: feeName,
      amount: Number(feeAmount)
    });
    if (res.success) {
      setFeeName("");
      setFeeAmount("");
      alert("Fee created successfully");
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleGenerateInvoices = async () => {
    if (!selectedClassId || !selectedFeeId) return;
    setIsGenerating(true);
    const res = await generateInvoicesForClass(selectedClassId, selectedFeeId);
    setIsGenerating(false);
    if (res.success) alert(res.message);
    else alert("Error: " + res.error);
  };

  const handleRecordPayment = async (invoiceId: string, amountDue: number, alreadyPaid: number) => {
    const remaining = amountDue - alreadyPaid;
    const amountStr = prompt(`Enter amount paid (Remaining: ₦${remaining.toLocaleString()}):`, remaining.toString());
    if (!amountStr) return;
    
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return alert("Invalid amount");

    const method = prompt("Payment Method (e.g., Cash, Transfer):", "Transfer") || "Cash";
    
    const res = await recordPayment(invoiceId, amount, method);
    if (res.success) alert("Payment recorded!");
    else alert("Error: " + res.error);
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.enrollment.student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.feeCategory.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent w-fit">
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage school fees, generate invoices, and record payments.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/10 rounded-xl w-fit">
        {(["LEDGER", "INVOICING", "SETTINGS"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            {tab === "LEDGER" ? "Payment Ledger" : tab === "INVOICING" ? "Issue Invoices" : "Fee Settings"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "SETTINGS" && (
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={handleCreateFee} className="glass-card p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-emerald-400" />
              Create New Fee Category
            </h2>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Fee Name (e.g., JSS 1 Tuition)</label>
              <input 
                required value={feeName} onChange={e => setFeeName(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Amount (₦)</label>
              <input 
                required type="number" min="0" value={feeAmount} onChange={e => setFeeAmount(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors">
              Save Fee Category
            </button>
          </form>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold mb-4">Active Fee Categories</h2>
            {categories.length === 0 ? <p className="text-muted-foreground text-sm">No categories created yet.</p> : (
              <div className="space-y-3">
                {categories.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-emerald-400 font-bold">₦{c.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "INVOICING" && (
        <div className="glass-card p-6 rounded-2xl max-w-2xl">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Send className="w-5 h-5 text-cyan-400" />
            Bulk Issue Invoices
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Select Class to Bill</label>
              <select 
                value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="" disabled>Select a class...</option>
                {classes.map(c => <option key={c.id} value={c.id} className="bg-background">{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Select Fee Category</label>
              <select 
                value={selectedFeeId} onChange={e => setSelectedFeeId(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="" disabled>Select a fee...</option>
                {categories.map(c => <option key={c.id} value={c.id} className="bg-background">{c.name} (₦{c.amount.toLocaleString()})</option>)}
              </select>
            </div>
            <button 
              onClick={handleGenerateInvoices} disabled={isGenerating || !selectedClassId || !selectedFeeId}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all"
            >
              {isGenerating ? "Generating Invoices..." : "Issue Invoices to Class"}
            </button>
            <p className="text-xs text-muted-foreground text-center">This will generate a pending invoice for every student currently enrolled in the selected class.</p>
          </div>
        </div>
      )}

      {activeTab === "LEDGER" && (
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <WalletCards className="w-5 h-5 text-emerald-400" />
              Outstanding & Paid Invoices
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                placeholder="Search student or fee..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="text-left py-3 font-medium">Student</th>
                  <th className="text-left py-3 font-medium">Class</th>
                  <th className="text-left py-3 font-medium">Fee Description</th>
                  <th className="text-right py-3 font-medium">Amount Due</th>
                  <th className="text-right py-3 font-medium">Amount Paid</th>
                  <th className="text-center py-3 font-medium">Status</th>
                  <th className="text-right py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">No invoices found.</td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => {
                    const totalPaid = inv.payments.reduce((sum: number, p: any) => sum + p.amountPaid, 0);
                    const isPaid = inv.status === "PAID";
                    
                    return (
                      <tr key={inv.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-medium">{inv.enrollment.student.name}</td>
                        <td className="py-3 text-muted-foreground">{inv.enrollment.class.name}</td>
                        <td className="py-3 text-muted-foreground">{inv.feeCategory.name}</td>
                        <td className="py-3 text-right font-medium">₦{inv.amountDue.toLocaleString()}</td>
                        <td className="py-3 text-right text-emerald-400">₦{totalPaid.toLocaleString()}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                            isPaid ? "bg-emerald-500/20 text-emerald-400" :
                            inv.status === "PARTIAL" ? "bg-amber-500/20 text-amber-400" :
                            "bg-rose-500/20 text-rose-400"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {!isPaid && (
                            <button 
                              onClick={() => handleRecordPayment(inv.id, inv.amountDue, totalPaid)}
                              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg font-medium transition-colors"
                            >
                              Record Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
