"use client";

import { useEffect, useState } from "react";
import { toIsoDate } from "@/lib/date";

type Habit = { id: number; name: string; frequency: "daily" | "weekly"; streak: number | null };
type CheckInEntry = { id: number; habit_id: number; date: string; habitName: string };

const DAYS_BACK = 7;

function lastNDays(n: number): string[] {
  const today = new Date();
  const days: string[] = [];
  for (let i = 0; i < n; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    days.push(toIsoDate(date));
  }
  return days;
}

function labelForDate(iso: string, todayIsoStr: string): string {
  const date = new Date(iso + "T00:00:00");
  const yesterday = new Date(todayIsoStr + "T00:00:00");
  yesterday.setDate(yesterday.getDate() - 1);

  if (iso === todayIsoStr) return "Today";
  if (iso === toIsoDate(yesterday)) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(date);
}

export default function JournalPage() {
  const todayIsoStr = toIsoDate(new Date());
  const dates = lastNDays(DAYS_BACK);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [entriesByDate, setEntriesByDate] = useState<Record<string, CheckInEntry[]>>({});
  const [openPickerDate, setOpenPickerDate] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/habits")
      .then((res) => res.json())
      .then(setHabits);
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshAll() {
    const entries = await Promise.all(
      dates.map((date) => fetch(`/api/checkins?date=${date}`).then((res) => res.json()))
    );
    const byDate: Record<string, CheckInEntry[]> = {};
    dates.forEach((date, i) => (byDate[date] = entries[i]));
    setEntriesByDate(byDate);
  }

  async function refreshDate(date: string) {
    const res = await fetch(`/api/checkins?date=${date}`);
    const entries = await res.json();
    setEntriesByDate((prev) => ({ ...prev, [date]: entries }));
  }

  async function addActivity(date: string, habitId: number) {
    await fetch(`/api/habits/${habitId}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    });
    setOpenPickerDate(null);
    refreshDate(date);
  }

  async function removeActivity(date: string, habitId: number) {
    await fetch(`/api/habits/${habitId}/checkin?date=${date}`, { method: "DELETE" });
    refreshDate(date);
  }

  return (
    <>
      <h1 className="page-title">Journal</h1>
      <p className="page-subtitle">The last {DAYS_BACK} days, most recent first.</p>

      {dates.map((date) => {
        const entries = entriesByDate[date] ?? [];
        const loggedHabitIds = new Set(entries.map((e) => e.habit_id));
        const availableHabits = habits.filter((h) => !loggedHabitIds.has(h.id));
        const pickerOpen = openPickerDate === date;

        return (
          <div key={date} className="card journal-day">
            <div className="journal-day-header">
              <span className="journal-date">{labelForDate(date, todayIsoStr)}</span>
              {pickerOpen ? (
                availableHabits.length === 0 ? (
                  <span className="empty-state">All logged</span>
                ) : (
                  <select
                    className="select-input"
                    autoFocus
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) addActivity(date, Number(e.target.value));
                    }}
                    onBlur={() => setOpenPickerDate(null)}
                  >
                    <option value="" disabled>
                      Choose an activity…
                    </option>
                    {availableHabits.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                )
              ) : (
                <button
                  className="btn btn-icon"
                  onClick={() => setOpenPickerDate(date)}
                  aria-label={`Add activity for ${date}`}
                >
                  +
                </button>
              )}
            </div>

            {entries.length === 0 ? (
              <p className="empty-state">Nothing logged.</p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="activity-chip">
                  <span>{entry.habitName}</span>
                  <button
                    className="activity-chip-remove"
                    onClick={() => removeActivity(date, entry.habit_id)}
                    aria-label={`Remove ${entry.habitName}`}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        );
      })}
    </>
  );
}
