"use client"

import { useState } from "react"

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
  from_address: string
  to_address: string
  direction: string
  status: {
    developer_approved: boolean
    transaction_verified: boolean
    developer_completed: boolean
    cancelled: boolean
    user_cancelled: boolean
  }
  transaction: {
    txid: string
    verified: boolean
    _link: string
  }
}

export function usePiPayment() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPayment = async (paymentData: PaymentData): Promise<PaymentDTO | null> => {
    if (typeof window.Pi === "undefined") {
      setError("Pi SDK not available")
      return null
    }

    setIsProcessing(true)
    setError(null)

    try {
      const payment = await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: (paymentId: string) => {
          console.log("[v0] Payment ready for approval:", paymentId)
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          console.log("[v0] Payment ready for completion:", paymentId, txid)
        },
        onCancel: (paymentId: string) => {
          console.log("[v0] Payment cancelled:", paymentId)
          setError("Payment was cancelled")
        },
        onError: (error: Error, payment?: PaymentDTO) => {
          console.error("[v0] Payment error:", error)
          setError(error.message)
        },
      })

      return payment
    } catch (err) {
      console.error("[v0] Payment creation failed:", err)
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
