import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: `viewer_${id}_${Date.now()}`,
      ttl: 3600,
    }
  );

  token.addGrant({
    room: id,
    roomJoin: true,
    canSubscribe: true,
  });

  const jwt = await token.toJwt();
  return NextResponse.json({ token: jwt });
}
