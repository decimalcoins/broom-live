"use client"

import { useState } from "react"
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

interface CreateStreamDialogProps {
  onStreamCreated: (streamId: string) => void
}

export function CreateStreamDialog({
  onStreamCreated,
}: CreateStreamDialogProps) {
  const { userData } = usePiAuth()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)

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
      const res = await api.post(API_ROUTES.CREATE_STREAM, {
        userId: userData.id,
        title: title.trim(),
        description: description.trim(),
      })

      console.log("STREAM CREATE RESPONSE:", res.data)

      if (!res.data?.success) {
        alert("❌ " + (res.data?.error || "Stream create failed"))
        return
      }

      const streamId = res.data?.stream?.id

      if (!streamId) {
        alert("❌ Stream created but ID missing")
        return
      }

      alert("✅ Stream Created!")

      setOpen(false)
      setTitle("")
      setDescription("")

      onStreamCreated(streamId)
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
          <div>
            <Label>Stream Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional..."
            />
          </div>

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
