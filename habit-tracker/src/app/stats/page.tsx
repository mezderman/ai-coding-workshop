"use client";

import { useEffect, useState } from "react";

type Habit = { id: number; name: string };
type HeatmapCell = { start: string; end: string; checked: boolean };
type HabitStats = { completionRate: number; heatmap: HeatmapCell[] };

export default function StatsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [statsByHabit, setStatsByHabit] = useState<Record<number, HabitStats>>({});

  useEffect(() => {
    fetch("/api/habits")
      .then((res) => res.json())
      .then((loadedHabits: Habit[]) => {
        setHabits(loadedHabits);
        loadedHabits.forEach((habit) => {
          fetch(`/api/habits/${habit.id}/stats`)
            .then((res) => res.json())
            .then((stats: HabitStats) =>
              setStatsByHabit((prev) => ({ ...prev, [habit.id]: stats }))
            );
        });
      });
  }, []);

  return (
    <>
      <h1 className="page-title">Stats</h1>
      <p className="page-subtitle">Completion rate for each habit.</p>

      {habits.map((habit) => {
        const stats = statsByHabit[habit.id];
        return (
          <div key={habit.id} className="card">
            <div className="stats-card-header">
              <span className="stats-habit-name">{habit.name}</span>
              <span className="stats-completion-rate">
                {stats ? `${Math.round(stats.completionRate * 100)}%` : "…"}
              </span>
            </div>
            {stats && (
              <div className="stats-heatmap">
                {stats.heatmap.map((cell) => (
                  <div
                    key={cell.start}
                    className={`stats-heatmap-cell${
                      cell.checked ? " stats-heatmap-cell--checked" : ""
                    }`}
                    title={cell.start === cell.end ? cell.start : `${cell.start} – ${cell.end}`}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
