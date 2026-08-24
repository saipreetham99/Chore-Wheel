"use client";

import { useMemo } from "react";
import type { Chore, TeamMemberName } from "@/lib/types";
import { Icon } from "./icon";
import { format, addDays, getMonth } from "date-fns";
import { generateWeeklySchedule } from "@/lib/scheduling";
import { memberAccent, memberInitials } from "@/lib/member-style";

type MonthlyCalendarViewProps = {
  chores: Record<string, Chore>;
  teamMembers: TeamMemberName[];
  monthOffset: number;
};

export function MonthlyCalendarView({
  chores,
  teamMembers,
  monthOffset,
}: MonthlyCalendarViewProps) {
  const firstDayOfMonth = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthlySchedule = useMemo(() => {
    if (!teamMembers.length || !Object.keys(chores).length) return [];
    return generateWeeklySchedule(chores, teamMembers, monthOffset);
  }, [chores, teamMembers, monthOffset]);

  // NOTE: same date maths as before. Week boundaries drift off the calendar
  // week — that gets corrected in the scheduling pass (step 3).
  const getWeekDateRange = (weekIndex: number) => {
    const weekStart = addDays(firstDayOfMonth, weekIndex * 7);
    const weekEnd = addDays(weekStart, 6);
    const sameMonth = getMonth(weekStart) === getMonth(weekEnd);
    return `${format(weekStart, "MMM d")} – ${format(weekEnd, sameMonth ? "d" : "MMM d")}`;
  };

  if (!monthlySchedule.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/60 p-12 text-center">
        <p className="font-headline text-lg font-semibold tracking-tight">
          Nothing to schedule yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add at least one person and one task to build the month.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-9">
      {monthlySchedule.map((week, weekIndex) => (
        <section
          key={weekIndex}
          className="animate-rise-in space-y-3"
          style={{ animationDelay: `${weekIndex * 60}ms` }}
        >
          <div className="flex items-center gap-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
              Week {String(weekIndex + 1).padStart(2, "0")}
            </h3>
            <span aria-hidden className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
              {getWeekDateRange(weekIndex)}
            </span>
          </div>

          <div
            className="member-grid"
            style={
              { "--cols": Math.min(teamMembers.length, 6) } as React.CSSProperties
            }
          >
            {teamMembers.map((member, memberIndex) => {
              const assignedTasks = week[memberIndex] ?? [];

              return (
                <article
                  key={`${weekIndex}-${member}`}
                  style={
                    { "--rail": memberAccent(memberIndex) } as React.CSSProperties
                  }
                  className="surface-shadow flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <span aria-hidden className="h-1 w-full bg-[hsl(var(--rail))]" />

                  <header className="flex items-center gap-2.5 px-3.5 pb-2 pt-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[hsl(var(--rail)/0.12)] text-[11px] font-bold text-[hsl(var(--rail))]">
                      {memberInitials(member)}
                    </span>
                    <h4 className="truncate font-headline text-sm font-semibold tracking-tight">
                      {member}
                    </h4>
                    <span className="ml-auto shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {assignedTasks.length}
                    </span>
                  </header>

                  <div className="flex flex-col gap-1.5 px-2.5 pb-2.5">
                    {assignedTasks.length > 0 ? (
                      assignedTasks.map((task) => {
                        const chore = chores[task.choreId];
                        if (!chore) return null;
                        return (
                          <div
                            key={task.id}
                            className="flex items-center gap-2.5 rounded-md bg-muted/70 px-2.5 py-2"
                          >
                            <Icon
                              name={chore.iconName}
                              className="h-4 w-4 shrink-0 text-[hsl(var(--rail))]"
                            />
                            <p className="truncate text-[13px] font-medium leading-tight">
                              {chore.title}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="rounded-md border border-dashed border-border px-2.5 py-3 text-center text-xs text-muted-foreground">
                        Free this week
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
