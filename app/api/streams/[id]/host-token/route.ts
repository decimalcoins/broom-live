import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { AccessToken } from "livekit-server-sdk"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const streamId = params.id

  const streamRes = await db.query(
    `SELECT room_name, host_username FROM streams WHERE id=$1 LIMIT 1`,
    [streamId]
  )

  if (streamRes.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Stream not found" },
      { status: 404 }
    )
  }

  const { room_name, host_username } = streamRes.rows[0]

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity: `host-${host_username}` }
  )

  token.addGrant({
    roomJoin: true,
    room: room_name,
    canPublish: true,
    canSubscribe: true,
  })

  return NextResponse.json({
    success: true,
    token: token.toJwt(),
  })
}
