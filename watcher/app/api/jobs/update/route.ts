// watcher/app/api/jobs/update/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { jobId, status, result } = body;

  // 🔹 TODO: update in Supabase
  console.log("Job update:", body);

  return NextResponse.json({ ok: true });
}