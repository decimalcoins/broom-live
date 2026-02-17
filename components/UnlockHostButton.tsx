"use client"

import { useState } from "react"

export default function UnlockHostButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleUnlock() {
    if (!window.Pi) {
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
          metadata: { type: "host_unlock" },
        },
        {
          // ✅ Approve
          onReadyForServerApproval: async (paymentId: string) => {
            const res = await fetch("/api/payments/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId,
                userId,
                amount: 1,
              }),
            })

            const data = await res.json()
            if (!data.success) throw new Error(data.error)
          },

          // ✅ Complete
          onReadyForServerCompletion: async (
            paymentId: string,
            txid: string
          ) => {
            const res = await fetch("/api/payments/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId,
                txid,
                userId,
              }),
            })

            const data = await res.json()

            if (!data.success) {
              alert("❌ Unlock failed: " + data.error)
              setLoading(false)
              return
            }

            alert("🎉 Host Unlocked! +50,000 Coins")
            window.location.reload()
          },

          // Cancel
          onCancel: () => {
            alert("Payment cancelled.")
            setLoading(false)
          },

          // Error
          onError: (err: any) => {
            alert("Payment error: " + err?.message)
            setLoading(false)
          },
        }
      )
    } catch (err: any) {
      alert("Unlock failed: " + err.message)
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
