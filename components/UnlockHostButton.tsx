"use client"

import { useState } from "react"

export default function UnlockHostButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleUnlock() {
    if (!window.Pi || !window.Pi.createPayment) {
      alert("❌ Pi SDK not found. Please open inside Pi Browser.")
      return
    }

    if (loading) return

    try {
      setLoading(true)

      await window.Pi.createPayment(
        {
          amount: 1,
          memo: "Unlock Host Access",
          metadata: {
            type: "host_unlock",
          },
        },
        {
          // ============================
          // Server approval
          // ============================

          onReadyForServerApproval: async (paymentId: string) => {
            const res = await fetch("/api/payments/approve", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentId,
                userId,
                amount: 1,
              }),
            })

            const data = await res.json().catch(() => null)

            if (!res.ok || !data?.success) {
              throw new Error(data?.error || "Server approval failed")
            }
          },

          // ============================
          // Server completion
          // ============================

          onReadyForServerCompletion: async (
            paymentId: string,
            txid: string
          ) => {
            const res = await fetch("/api/payments/complete", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentId,
                txid,
                userId,
              }),
            })

            const data = await res.json().catch(() => null)

            if (!res.ok || !data?.success) {
              alert("❌ Unlock failed: " + (data?.error || "Unknown error"))
              setLoading(false)
              return
            }

            alert("🎉 Host Unlocked! +50,000 Coins")

            setLoading(false)

            // refresh dashboard
            window.location.reload()
          },

          // ============================
          // Cancel
          // ============================

          onCancel: () => {
            alert("Payment cancelled.")
            setLoading(false)
          },

          // ============================
          // Error
          // ============================

          onError: (err: any) => {
            console.error("Pi Payment Error:", err)
            alert("Payment error: " + (err?.message || "Unknown error"))
            setLoading(false)
          },
        }
      )
    } catch (err: any) {
      console.error("Unlock error:", err)
      alert("Unlock failed: " + (err?.message || "Unknown error"))
      setLoading(false)
    }
  }

  return (
    <button
      disabled={loading}
      onClick={handleUnlock}
      className="px-4 py-2 rounded-xl bg-black text-white"
    >
      {loading ? "Processing..." : "Unlock Host (Pay 1 Pi)"}
    </button>
  )
}