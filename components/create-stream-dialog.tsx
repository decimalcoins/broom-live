"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { usePiAuth } from "@/contexts/pi-auth-context"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"

import { Video } from "lucide-react"

import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"

export function CreateStreamDialog() {
  const { userData } = usePiAuth()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)

  // ============================
  // CREATE STREAM
  // ============================
  const handleCreate = async () => {
    if (!userData?.id) {
      alert("❌ User not logged in")
      return
    }

    if (!title.trim()) {
      alert("❌ Title required")
      return
    }

    setCreating(true)

    try {
      // ============================
      // 1. Create Stream in Backend
      // ============================
      const res = await api.post(API_ROUTES.CREATE_STREAM, {
        userId: userData.id,
        title: title.trim(),
        description: description.trim(),
      })

      if (!res.data?.success) {
        alert("❌ " + (res.data?.error || "Stream create failed"))
        return
      }

      const streamId = res.data?.stream?.id

      if (!streamId) {
        alert("❌ Stream created but ID missing")
        return
      }

      alert("✅ Stream Created! Going Live...")

      // ============================
      // 2. Close Dialog + Reset
      // ============================
      setOpen(false)
      setTitle("")
      setDescription("")

      // ============================
      // 3. Redirect Host to Broadcast Page
      // ============================
      router.push(`/dashboard/host/stream/${streamId}`)
    } catch (err: any) {
      alert("❌ Failed: " + (err?.message || "Unknown error"))
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="w-full gap-2"
          disabled={userData?.role !== "HOST"}
        >
          <Video className="w-5 h-5" />
          Go Live
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a Live Stream</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* TITLE */}
          <div>
            <Label>Stream Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional..."
            />
          </div>

          {/* BUTTON */}
          <Button
            className="w-full"
            disabled={creating}
            onClick={handleCreate}
          >
            {creating ? "Creating..." : "Start Stream"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
