import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "rose", name: "Rose", price: 10 },
    { id: "diamond", name: "Diamond", price: 100 },
  ]);
}
