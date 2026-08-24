"use client";

import { useMemo } from "react";
import type { Chore, TeamMemberName } from "@/lib/types";
import { format, addDays, getMonth } from "date-fns";
import { generateWeeklySchedule } from "@/lib/scheduling";
import { memberAccent, memberInitials } from "@/lib/member-style";
import { Icon } from "./icon";

type PrintSheetProps = {
  chores: Record<string, Chore>;
  teamMembers: TeamMemberName[];
  monthOffset: number;
  monthLabel: string;
};

/**
 * Hidden on screen, and the ONLY thing that survives on paper.
 * Locked to the printable height of one A4 landscape page, so the layout
 * cannot paginate — see the .print-sheet rules in globals.css.
 */
export function PrintSheet({
  chores,
  teamMembers,
  monthOffset,
  monthLabel,
}: PrintSheetProps) {
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

  const getWeekDateRange = (weekIndex: number) => {
    const weekStart = addDays(firstDayOfMonth, weekIndex * 7);
    const weekEnd = addDays(weekStart, 6);
    const sameMonth = getMonth(weekStart) === getMonth(weekEnd);
    return `${format(weekStart, "MMM d")} – ${format(weekEnd, sameMonth ? "d" : "MMM d")}`;
  };

  if (!monthlySchedule.length || !teamMembers.length) return null;

  // The densest cell in the month sets the type size, so every row matches.
  const busiestCell = monthlySchedule.reduce((max, week) => {
    const weekMax = week.reduce((m, tasks) => Math.max(m, tasks.length), 0);
    return Math.max(max, weekMax);
  }, 0);

  return (
    <div
      className="print-sheet"
      data-density={busiestCell > 4 ? "tight" : busiestCell > 2 ? "medium" : "roomy"}
      style={{ "--people": teamMembers.length } as React.CSSProperties}
    >
      <div className="print-head">
        <span className="print-title">Chore Wheel</span>
        <span className="print-month">{monthLabel}</span>
      </div>

      <div className="print-grid">
        <div className="print-row print-row--head">
          <div className="print-corner" />
          {teamMembers.map((member, memberIndex) => (
            <div
              key={`head-${member}`}
              className="print-person"
              style={{ "--rail": memberAccent(memberIndex) } as React.CSSProperties}
            >
              <span className="print-monogram">{memberInitials(member)}</span>
              <span className="print-person-name">{member}</span>
            </div>
          ))}
        </div>

        {monthlySchedule.map((week, weekIndex) => (
          <div key={`row-${weekIndex}`} className="print-row">
            <div className="print-week">
              <span className="print-week-no">
                Week {String(weekIndex + 1).padStart(2, "0")}
              </span>
              <span className="print-week-dates">{getWeekDateRange(weekIndex)}</span>
            </div>

            {teamMembers.map((member, memberIndex) => {
              const assignedTasks = week[memberIndex] ?? [];
              return (
                <div
                  key={`cell-${weekIndex}-${member}`}
                  className="print-cell"
                  style={
                    { "--rail": memberAccent(memberIndex) } as React.CSSProperties
                  }
                >
                  {assignedTasks.length > 0 ? (
                    assignedTasks.map((task) => {
                      const chore = chores[task.choreId];
                      if (!chore) return null;
                      return (
                        <div key={task.id} className="print-chip">
                          <Icon name={chore.iconName} />
                          <span>{chore.title}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="print-free">Free</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
