import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isLive = searchParams.get("is_live");

    let query = `
      SELECT id, host_id, host_username, title, description,
             is_live, viewer_count, started_at, thumbnail_url
      FROM streams
    `;

    const values: any[] = [];

    if (isLive === "true") {
      query += ` WHERE is_live = true`;
    }

    query += ` ORDER BY started_at DESC`;

    const result = await db.query(query, values);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/streams error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
