
"use client";

import { useMemo } from "react";
import type { Task, Chore, TeamMemberName } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Icon } from "./icon";
import { shuffle } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

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
  const monthlySchedule = useMemo(() => {
    if (!teamMembers.length || !Object.keys(chores).length) return [];

    const schedule: Task[][][] = Array.from({ length: WEEKS_IN_MONTH }, () =>
      Array.from({ length: teamMembers.length }, () => [])
    );

    const seed = monthOffset;
    const shuffledTeamMembers = shuffle([...teamMembers], seed);

    for (let week = 0; week < WEEKS_IN_MONTH; week++) {
      // 1. Create a pool of all task instances for the week
      const weeklyTaskPool: string[] = [];
      for (const choreId in chores) {
        const chore = chores[choreId];
        for (let i = 0; i < (chore.frequency || 1); i++) {
          weeklyTaskPool.push(chore.id);
        }
      }
      const shuffledTasks = shuffle(weeklyTaskPool, seed + week);

      // 2. Distribute tasks from the pool to team members
      shuffledTasks.forEach((choreId, taskIndex) => {
        const memberIndex = taskIndex % shuffledTeamMembers.length;
        const memberName = shuffledTeamMembers[memberIndex];
        const teamMemberOriginalIndex = teamMembers.indexOf(memberName);
        
        if (teamMemberOriginalIndex !== -1) {
            schedule[week][teamMemberOriginalIndex].push({
              id: `task-${memberName}-${choreId}-m${monthOffset}-w${week}-i${taskIndex}`,
              choreId: choreId,
              assignee: memberName,
            });
        }
      });
    }

    return schedule;
  }, [chores, teamMembers, monthOffset]);

  return (
    <div className="space-y-8">
      <div className="space-y-10">
        {monthlySchedule.map((week, weekIndex) => (
            <div key={weekIndex} className="space-y-4">
                <h3 className="text-xl font-semibold">Week {weekIndex + 1}</h3>
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
