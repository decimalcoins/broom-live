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
    // ✅ DEV MODE → Dummy Payment
    // ============================
    if (process.env.NEXT_PUBLIC_APP_MODE === "dev") {
      console.warn("⚡ DEV MODE: Simulating Pi Payment")

      return {
        identifier: "dev-payment-001",
        user_uid: "dev-user",
        amount: paymentData.amount,
        memo: paymentData.memo,
        metadata: paymentData.metadata,
        status: {},
        transaction: {},
      }
    }

    // ============================
    // ✅ PROD MODE → Pi Browser Required
    // ============================
    if (typeof window.Pi === "undefined") {
      setError("Pi SDK not available. Please use Pi Browser.")
      return null
    }

    setIsProcessing(true)
    setError(null)

    try {
      const payment = await window.Pi.createPayment(paymentData, {
        // ============================
        // 1. Server Approval Required
        // ============================
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("✅ Ready for approval:", paymentId)

          await api.post(API_ROUTES.PAYMENT_APPROVE, {
            payment_id: paymentId,
          })
        },

        // ============================
        // 2. Server Completion Required
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

        // Cancel
        onCancel: (paymentId: string) => {
          console.warn("Payment cancelled:", paymentId)
          setError("Payment was cancelled")
        },

        // Error
        onError: (err: Error) => {
          console.error("Payment error:", err)
          setError(err.message)
        },
      })

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