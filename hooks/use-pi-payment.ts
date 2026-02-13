"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"

interface PaymentData {
  amount: number
  memo: string
  metadata: Record<string, any>
}

interface PaymentDTO {
  identifier: string
  user_uid: string
  amount: number
  memo: string
  metadata: Record<string, any>
  status: any
  transaction: any
}

export function usePiPayment() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPayment = async (
    paymentData: PaymentData
  ): Promise<PaymentDTO | null> => {
    // ============================
    // ✅ Pi Browser Required
    // ============================
    if (typeof window === "undefined") return null

    if (!window.Pi || !window.Pi.createPayment) {
      setError("Pi SDK not available. Please open in Pi Browser.")
      return null
    }

    setIsProcessing(true)
    setError(null)

    try {
      console.log("💰 Creating Pi Payment:", paymentData)

      const payment = await window.Pi.createPayment(paymentData, {
        // ============================
        // ✅ 1. Server Approval Required
        // ============================
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("✅ Ready for approval:", paymentId)

          await api.post(API_ROUTES.PAYMENT_APPROVE, {
            payment_id: paymentId,
            metadata: paymentData.metadata,
          })
        },

        // ============================
        // ✅ 2. Server Completion Required
        // ============================
        onReadyForServerCompletion: async (
          paymentId: string,
          txid: string
        ) => {
          console.log("✅ Ready for completion:", paymentId, txid)

          await api.post(API_ROUTES.PAYMENT_COMPLETE, {
            payment_id: paymentId,
            txid,
          })
        },

        // ============================
        // Cancel Payment
        // ============================
        onCancel: (paymentId: string) => {
          console.warn("❌ Payment cancelled:", paymentId)
          setError("Payment was cancelled")
        },

        // ============================
        // Error Handler
        // ============================
        onError: (err: Error) => {
          console.error("❌ Payment error:", err)
          setError(err.message)
        },
      })

      console.log("✅ Payment Created:", payment)

      return payment
    } catch (err) {
      console.error("❌ Payment creation failed:", err)
      setError(err instanceof Error ? err.message : "Payment failed")
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    createPayment,
    isProcessing,
    error,
  }
}
