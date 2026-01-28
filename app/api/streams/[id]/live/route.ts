// app/api/streams/live/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.query(
      `SELECT 
          id, host_id, host_username, title, description,
          is_live, viewer_count, started_at, thumbnail_url
        FROM streams
        WHERE is_live = true
        ORDER BY started_at DESC`
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/streams/live error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
