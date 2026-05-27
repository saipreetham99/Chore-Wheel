
"use client";

import { useMemo } from "react";
import type { Task, Chore, TeamMemberName } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Icon } from "./icon";
import { shuffle } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { format, startOfWeek, addDays, getDate, getMonth, getYear } from 'date-fns';
import { generateWeeklySchedule } from "@/lib/scheduling";

type MonthlyCalendarViewProps = {
  chores: Record<string, Chore>;
  teamMembers: TeamMemberName[];
  monthOffset: number;
};

const WEEKS_IN_MONTH = 4;

export function MonthlyCalendarView({
  chores,
  teamMembers,
  monthOffset,
}: MonthlyCalendarViewProps) {

  const firstDayOfMonth = useMemo(() => {
    const d = new Date();
    d.setDate(1); // Avoid issues with months that have fewer days
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

    const startFormat = getMonth(weekStart) === getMonth(weekEnd) ? 'MMM d' : 'MMM d';
    const endFormat = 'MMM d, yyyy';

    return `${format(weekStart, startFormat)} - ${format(weekEnd, endFormat)}`;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-10">
        {monthlySchedule.map((week, weekIndex) => (
          <div key={weekIndex} className="space-y-4">
            <h3 className="text-xl font-semibold">
              Week {weekIndex + 1} <span className="text-base font-normal text-muted-foreground">({getWeekDateRange(weekIndex)})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {teamMembers.map((member, memberIndex) => {
                const assignedTasks = week[memberIndex] || [];
                return (
                  <Card key={`${weekIndex}-${member}`} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-center">{member}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-start gap-2 text-center p-2">
                      <ScrollArea className="h-[120px] w-full">
                        <div className="p-2 space-y-2">
                          {assignedTasks.length > 0 ? (
                            assignedTasks.map(task => {
                              const chore = chores[task.choreId];
                              return chore ? (
                                <div key={task.id} className="p-2 rounded-lg bg-muted/50 flex items-center gap-2 text-left">
                                  <Icon name={chore.iconName} className="h-5 w-5 text-primary flex-shrink-0" />
                                  <div className="flex-grow">
                                    <p className="text-sm font-semibold">{chore.title}</p>
                                    <p className="text-xs text-muted-foreground">{chore.description}</p>
                                  </div>
                                </div>
                              ) : null
                            })
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-muted-foreground text-sm">No tasks this week</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
