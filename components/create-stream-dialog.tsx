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

export function CreateStreamDialog({ onStreamCreated }: CreateStreamDialogProps) {
  const { userData } = usePiAuth()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!title.trim()) return
    if (!userData) return alert("User not logged in")

    setCreating(true)

    try {
      const res = await api.post<{ id: string }>(
        API_ROUTES.CREATE_STREAM,
        {
          title: title.trim(),
          description: description.trim(),

          // ✅ FIX REQUIRED FIELDS
          host_id: userData.id,
          host_username: userData.username,
        }
      )

      onStreamCreated(res.data.id)
      setOpen(false)
      setTitle("")
      setDescription("")
    } catch (err) {
      console.error("❌ Failed to create stream:", err)
      alert("Failed to create stream")
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full gap-2">
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