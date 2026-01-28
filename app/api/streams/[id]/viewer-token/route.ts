import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ⬅ wajib!

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: `viewer_${Date.now()}`,
      ttl: 3600,
    }
  );

  token.addGrant({
    roomJoin: true,
    room: id,
    canPublish: false,
    canSubscribe: true,
  });

  return NextResponse.json({ token: await token.toJwt() });
}
