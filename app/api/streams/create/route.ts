import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const id = body.id || uuid();
    const host_id = body.host_id;
    const host_username = body.host_username;
    const title = body.title ?? "Untitled Stream";

    const result = await db.query(
      `INSERT INTO streams (id, host_id, host_username, title, is_live, viewer_count)
       VALUES ($1, $2, $3, $4, true, 0)
       RETURNING *`,
      [id, host_id, host_username, title]
    );

    return NextResponse.json(result.rows[0]);

  } catch (err: any) {
    console.error("POST /api/streams/create error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
