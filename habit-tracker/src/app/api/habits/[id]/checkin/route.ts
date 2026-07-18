import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { checkIn, removeCheckIn, todayIso } from "@/services/habitService";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const habitId = Number(params.id);
  if (Number.isNaN(habitId)) {
    return NextResponse.json({ error: "invalid habit id" }, { status: 400 });
  }
  const body = await request.json().catch(() => ({}));
  const date = typeof body.date === "string" ? body.date : todayIso();
  const entry = checkIn(db, habitId, date);
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const habitId = Number(params.id);
  if (Number.isNaN(habitId)) {
    return NextResponse.json({ error: "invalid habit id" }, { status: 400 });
  }
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? todayIso();
  removeCheckIn(db, habitId, date);
  return NextResponse.json({ ok: true });
}
