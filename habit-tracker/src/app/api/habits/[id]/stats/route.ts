import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { completionRate, heatmapCells } from "@/services/habitService";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const habitId = Number(params.id);
  if (Number.isNaN(habitId)) {
    return NextResponse.json({ error: "invalid habit id" }, { status: 400 });
  }
  const rate = completionRate(db, habitId);
  const heatmap = heatmapCells(db, habitId);
  return NextResponse.json({ completionRate: rate, heatmap });
}
