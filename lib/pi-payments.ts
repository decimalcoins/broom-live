"use client";

export async function piPay({
  amount,
  memo,
  metadata,
}: {
  amount: number;
  memo: string;
  metadata?: any;
}) {
  if (typeof window === "undefined") {
    throw new Error("Pi Payment only works in browser");
  }

  const Pi = (window as any).Pi;

  if (!Pi) {
    throw new Error("Pi SDK not available. Use Pi Browser.");
  }

  return await Pi.createPayment(
    {
      amount,
      memo,
      metadata,
    },
    {
      onReadyForServerApproval: async (paymentId: string) => {
        console.log("Payment ready for approval:", paymentId);
      },
      onReadyForServerCompletion: async (paymentId: string) => {
        console.log("Payment ready for completion:", paymentId);
      },
      onCancel: (paymentId: string) => {
        console.warn("Payment cancelled:", paymentId);
      },
      onError: (err: any, payment?: any) => {
        console.error("Payment error:", err, payment);
      },
    }
  );
}