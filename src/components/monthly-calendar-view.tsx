
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
    const seed = monthOffset;
    let shuffledTaskPool = shuffle(taskPool, seed);

    // 3. Create a schedule grid and track task counts per member
    const weeks: Task[][] = Array.from({ length: WEEKS_IN_MONTH }, () => []);
    const memberTaskCounts: Record<TeamMemberName, number> = teamMembers.reduce((acc, member) => ({ ...acc, [member]: 0 }), {});
    const weeklyAssignments: boolean[][] = Array.from({ length: WEEKS_IN_MONTH }, () => 
      Array.from({ length: teamMembers.length }, () => false)
    );

    // 4. Distribute tasks, prioritizing filling empty slots first
    shuffledTaskPool.forEach(choreId => {
      let assigned = false;
      // Try to find a slot for the task, starting with members who have the fewest tasks
      const sortedMembers = [...teamMembers].sort((a, b) => memberTaskCounts[a] - memberTaskCounts[b]);

      for (let week = 0; week < WEEKS_IN_MONTH; week++) {
        for (const member of sortedMembers) {
          const memberIndex = teamMembers.indexOf(member);
          if (!weeklyAssignments[week][memberIndex]) {
            weeks[week][memberIndex] = {
              id: `task-${member}-${choreId}-m${monthOffset}-w${week}`,
              choreId: choreId,
              assignee: member,
            };
            weeklyAssignments[week][memberIndex] = true;
            memberTaskCounts[member]++;
            assigned = true;
            break; // Move to the next task
          }
        }
        if (assigned) break; // Move to the next task
      }
    });

    // Fill any remaining empty slots by re-assigning tasks if necessary (e.g. more slots than tasks)
     for (let week = 0; week < WEEKS_IN_MONTH; week++) {
        for (let memberIndex = 0; memberIndex < teamMembers.length; memberIndex++) {
            if (!weeklyAssignments[week][memberIndex]) {
                const member = teamMembers[memberIndex];
                 // Find a task to assign - can be random or based on other logic
                const choreToAssign = shuffledTaskPool[(week * teamMembers.length + memberIndex) % shuffledTaskPool.length];
                if (choreToAssign) {
                  weeks[week][memberIndex] = {
                      id: `task-${member}-${choreToAssign}-m${monthOffset}-w${week}-fill`,
                      choreId: choreToAssign,
                      assignee: member,
                  };
                }
            }
        }
    }
    
    // Flatten and then restructure the tasks to ensure proper assignment objects
    const finalWeeks: Task[][] = Array.from({ length: WEEKS_IN_MONTH }, () => []);
    weeks.flat().filter(Boolean).forEach((task, index) => {
      const weekIndex = Math.floor(index / teamMembers.length);
      if (finalWeeks[weekIndex] && finalWeeks[weekIndex].length < teamMembers.length) {
         finalWeeks[weekIndex].push(task);
      }
    });


    // Re-map to ensure no member gets two tasks in one week if there are enough tasks.
    const finalSchedule: Task[][] = Array.from({ length: WEEKS_IN_MONTH }, () => []);
    for (let week = 0; week < WEEKS_IN_MONTH; week++) {
      const weekTasks = weeks[week].filter(Boolean);
      const assignedMembers = new Set<TeamMemberName>();
      const weekSchedule: Task[] = [];
      
      weekTasks.forEach(task => {
        if (!assignedMembers.has(task.assignee)) {
          weekSchedule.push(task);
          assignedMembers.add(task.assignee);
        }
      });
      finalSchedule[week] = weekSchedule;
    }


    return finalSchedule;
  }, [chores, teamMembers, monthOffset]);

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
