"use client"

import { useState } from "react"

export default function UnlockHostButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleUnlock() {
    if (!window.Pi) {
      alert("❌ Pi SDK not found. Please open this app inside Pi Browser.")
      return
    }

    if (loading) return

    try {
      setLoading(true)

      await window.Pi.createPayment(
        {
          amount: 1,
          memo: "Unlock Host Access",
          metadata: { type: "host_unlock" },
        },

        // ============================
        // ✅ Official Pi Payment Callbacks
        // ============================
        {
          // ============================
          // 1. Server Approval
          // ============================
          onReadyForServerApproval: async function (paymentId: string) {
            console.log("✅ Approving payment:", paymentId)

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

            const data = await res.json()

            if (!data.success) {
              throw new Error(data.error || "Approval failed")
            }
          },

          // ============================
          // 2. Server Completion
          // ============================
          onReadyForServerCompletion: async function (
            paymentId: string,
            txid: string
          ) {
            console.log("✅ Completing payment:", paymentId, txid)

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

            const data = await res.json()

            if (!data.success) {
              alert("❌ Payment complete failed: " + data.error)
              setLoading(false)
              return
            }

            alert("🎉 Host Access Unlocked!\n+50,000 Coins Added")

            // Refresh dashboard state
            window.location.reload()
          },

          // ============================
          // 3. Cancelled
          // ============================
          onCancel: function (paymentId: string) {
            console.log("❌ Payment cancelled:", paymentId)
            alert("Payment cancelled.")
            setLoading(false)
          },

          // ============================
          // 4. Error
          // ============================
          onError: function (error: any, payment?: any) {
            console.error("❌ Payment error:", error, payment)
            alert("Payment failed: " + (error?.message || "Unknown error"))
            setLoading(false)
          },
        }
      )
    } catch (err: any) {
      console.error("❌ Unlock error:", err)
      alert("Unlock failed: " + (err?.message || "Unknown error"))
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUnlock}
      disabled={loading}
      className={`px-4 py-2 rounded-xl text-white ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-black"
      }`}
    >
      {loading
        ? "Processing Payment..."
        : "Unlock Host (Pay 1 Pi + Get 50,000 Coins)"}
    </button>
  )
}
