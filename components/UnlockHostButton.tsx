"use client"

export default function UnlockHostButton({ userId }: { userId: string }) {
  async function handleUnlock() {
    try {
      // ============================
      // 1. Create Pi Payment
      // ============================
      const payment = await window.Pi.createPayment({
        amount: 1,
        memo: "Unlock Host Access",
        metadata: { type: "host_unlock" },
      })

      // ============================
      // 2. Approve Payment
      // ============================
      await fetch("/api/payments/approve", {
        method: "POST",
        body: JSON.stringify({
          paymentId: payment.identifier,
          userId,
          amount: 1,
        }),
      })

      // ============================
      // 3. Complete Payment
      // ============================
      await fetch("/api/payments/complete", {
        method: "POST",
        body: JSON.stringify({
          paymentId: payment.identifier,
          txid: payment.transaction.txid,
        }),
      })

      // ============================
      // 4. Unlock Host
      // ============================
      const res = await fetch("/api/host/unlock", {
        method: "POST",
        body: JSON.stringify({
          userId,
          paymentId: payment.identifier,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        alert("❌ Unlock failed: " + data.error)
        return
      }

      alert(`🎉 Success! You got ${data.reward} coins`)
      window.location.reload()
    } catch (err) {
      console.error("❌ Unlock error:", err)
      alert("Payment cancelled or failed")
    }
  }

  return (
    <button
      onClick={handleUnlock}
      className="px-4 py-2 rounded-xl bg-black text-white"
    >
      Unlock Host (Pay 1 Pi + Get 50,000 Coins)
    </button>
  )
}
