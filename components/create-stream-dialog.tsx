"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Video } from "lucide-react"
import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"

interface CreateStreamDialogProps {
  onStreamCreated: (streamId: string) => void
}

export function CreateStreamDialog({ onStreamCreated }: CreateStreamDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!title.trim()) return

    setCreating(true)
    try {
      const response = await api.post<{ id: string }>(API_ROUTES.CREATE_STREAM, {
        title: title.trim(),
        description: description.trim(),
      })

      onStreamCreated(response.data.id)
      setOpen(false)
      setTitle("")
      setDescription("")
    } catch (err) {
      console.error("[v0] Failed to create stream:", err)
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
          <div className="space-y-2">
            <Label htmlFor="title">Stream Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter stream title"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers what your stream is about"
              rows={3}
            />
          </div>

          <Button onClick={handleCreate} disabled={creating || !title.trim()} className="w-full" size="lg">
            {creating ? "Creating..." : "Start Stream"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
