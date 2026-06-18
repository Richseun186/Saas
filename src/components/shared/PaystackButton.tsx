"use client";

import { usePaystackPayment } from "react-paystack";
import { Loader2 } from "lucide-react";

interface PaystackButtonProps {
  email: string;
  amount: number;
  planKey: string;
  isPending: boolean;
  onSuccess: (reference: any) => void;
  onClose: () => void;
}

export default function PaystackButton({
  email,
  amount,
  planKey,
  isPending,
  onSuccess,
  onClose,
}: PaystackButtonProps) {
  const config = {
    reference: new Date().getTime().toString(),
    email: email,
    amount: amount * 100, // in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayNow = () => {
    if (!config.publicKey) {
      console.warn("No Paystack Public Key found. Using mock reference for dev purposes.");
      onSuccess({ reference: "mock_reference" });
      return;
    }
    initializePayment({ onSuccess, onClose });
  };

  return (
    <button
      onClick={handlePayNow}
      disabled={isPending}
      className="w-full py-4 rounded-xl bg-teal-500 text-white font-bold text-lg hover:bg-teal-400 transition flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-60"
    >
      {isPending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" /> Processing...
        </>
      ) : (
        <>Pay ₦{amount.toLocaleString()} via Paystack</>
      )}
    </button>
  );
}
