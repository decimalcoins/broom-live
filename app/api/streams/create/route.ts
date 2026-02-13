import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { nanoid } from "nanoid"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, description, host_id, host_username } = body

    if (!title || !host_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const streamId = `stream-${nanoid(8)}`

    await db.query(
      `
      INSERT INTO streams (
        id,
        title,
        description,
        host_id,
        host_username,
        is_live,
        viewer_count,
        started_at
      )
      VALUES ($1,$2,$3,$4,$5,false,0,NOW())
    `,
      [streamId, title, description || "", host_id, host_username]
    )

    return NextResponse.json({
      success: true,
      id: streamId,
    })
  } catch (err) {
    console.error("❌ Create stream error:", err)
    return NextResponse.json(
      { error: "Failed to create stream" },
      { status: 500 }
    )
  }
}