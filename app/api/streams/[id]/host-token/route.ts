import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity: `host_${id}_${Date.now()}`, ttl: 3600 }
  );

  token.addGrant({
    room: id,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return NextResponse.json({ token: await token.toJwt() });
}
