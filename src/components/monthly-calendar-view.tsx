
"use client";

import { useMemo } from "react";
import type { Task, Chore, TeamMemberName } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Icon } from "./icon";
import { shuffle } from "@/lib/utils";

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
  
    // 1. Create a pool of all task instances for the month based on frequency
    const taskPool: string[] = [];
    for (const choreId in chores) {
      const chore = chores[choreId];
      for (let i = 0; i < (chore.frequency || 1); i++) {
        taskPool.push(chore.id);
      }
    }
    
    // 2. Shuffle the pool to randomize initial distribution
    let shuffledTaskPool = shuffle(taskPool);
    
    // Create a seed based on the monthOffset to ensure consistent shuffling for the same month
    const seed = monthOffset;
    shuffledTaskPool = shuffle(shuffledTaskPool, seed);


    // 3. Distribute tasks as evenly as possible among team members across all weeks
    const assignments: { member: TeamMemberName, choreId: string, week: number }[] = [];
    const memberTaskCounts: Record<TeamMemberName, number> = teamMembers.reduce((acc, member) => ({ ...acc, [member]: 0 }), {});

    const totalSlots = teamMembers.length * WEEKS_IN_MONTH;
    shuffledTaskPool.slice(0, totalSlots).forEach((choreId, index) => {
        const week = Math.floor(index / teamMembers.length);
        
        // Simple rotation for assignment
        const memberIndex = index % teamMembers.length;
        const member = teamMembers[memberIndex];
        
        assignments.push({
            member,
            choreId,
            week,
        });
        memberTaskCounts[member]++;
    });
    
    // 4. Structure the assignments into weekly tasks
    const weeks: Task[][] = Array.from({ length: WEEKS_IN_MONTH }, () => []);

    assignments.forEach(({member, choreId, week}) => {
        weeks[week].push({
            id: `task-${member}-${choreId}-m${monthOffset}-w${week}`,
            choreId: choreId,
            assignee: member,
        });
    });

    return weeks;
  }, [chores, teamMembers, monthOffset]);

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
                        const assignedTask = (weekTasks || []).find(t => t.assignee === member);
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
