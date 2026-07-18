import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { listHabits, currentStreak } from "@/services/habitService";

export async function GET() {
  const habits = listHabits(db).map((habit) => ({
    ...habit,
    streak: currentStreak(db, habit.id),
  }));
  return NextResponse.json(habits);
}
