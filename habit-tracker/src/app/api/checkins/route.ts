import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { listCheckInsForDate, todayIso } from "@/services/habitService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? todayIso();
  return NextResponse.json(listCheckInsForDate(db, date));
}
