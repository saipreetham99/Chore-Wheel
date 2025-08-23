
"use client";

import { useMemo } from "react";
import type { Task, Chore, TeamMemberName } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Icon } from "./icon";

type MonthlyCalendarViewProps = {
  startWeekTasks: Task[];
  chores: Record<string, Chore>;
  teamMembers: TeamMemberName[];
  uniqueChoreIds: string[];
  monthOffset: number;
};

const WEEKS_IN_MONTH = 4;

export function MonthlyCalendarView({
  startWeekTasks,
  chores,
  teamMembers,
  uniqueChoreIds,
  monthOffset,
}: MonthlyCalendarViewProps) {

  const monthlySchedule = useMemo(() => {
    if (!startWeekTasks || !teamMembers.length || !uniqueChoreIds.length) return [];
  
    const weeks: Task[][] = [startWeekTasks];
    let lastWeekTasks = startWeekTasks;
  
    for (let i = 1; i < WEEKS_IN_MONTH; i++) {
        const lastWeekAssignments = new Map<TeamMemberName, string>();
        lastWeekTasks.forEach(task => {
            lastWeekAssignments.set(task.assignee, task.choreId);
        });
  
        const nextWeekTasks: Task[] = [];
        const availableChoresForWeek = [...uniqueChoreIds];
  
        teamMembers.forEach((member, memberIndex) => {
            const lastChoreId = lastWeekAssignments.get(member);
            let nextChoreId: string | undefined;
  
            if(lastChoreId) {
                const lastChoreIndex = availableChoresForWeek.indexOf(lastChoreId);
                if(lastChoreIndex !== -1) {
                    // Simple rotation: take the next chore in the list
                    nextChoreId = availableChoresForWeek[(lastChoreIndex + 1) % availableChoresForWeek.length];
                }
            }
            
            // Fallback or initial assignment logic
            if(!nextChoreId) {
                nextChoreId = uniqueChoreIds[(memberIndex + i) % uniqueChoreIds.length];
            }
            
            const task: Task = {
                id: `task-${member}-${nextChoreId}-m${monthOffset}-w${i}`,
                choreId: nextChoreId,
                assignee: member,
            };
            nextWeekTasks.push(task);
        });
        
        weeks.push(nextWeekTasks);
        lastWeekTasks = nextWeekTasks;
    }
    return weeks;
  }, [startWeekTasks, teamMembers, uniqueChoreIds, monthOffset]);

  const tasksByAssignee = (taskList: Task[]) => taskList.reduce((acc, task) => {
    acc[task.assignee] = task;
    return acc;
  }, {} as Record<TeamMemberName, Task>);


  return (
    <div className="space-y-8">
      <div className="space-y-10">
        {monthlySchedule.map((weekTasks, weekIndex) => (
            <div key={weekIndex} className="space-y-4">
                <h3 className="text-xl font-semibold">Week {weekIndex + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {teamMembers.map((member) => {
                        const assignedTask = tasksByAssignee(weekTasks)[member];
                        const chore = assignedTask ? chores[assignedTask.choreId] : null;
                        return (
                            <Card key={`${weekIndex}-${member}`}>
                                <CardHeader>
                                    <CardTitle className="text-center">{member}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center gap-2 text-center h-24">
                                    {chore ? (
                                        <>
                                            <Icon name={chore.iconName} className="h-6 w-6 text-primary" />
                                            <p className="text-muted-foreground">{chore.title}</p>
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground">No task assigned</p>
                                    )}
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
