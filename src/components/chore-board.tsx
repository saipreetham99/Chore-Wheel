"use client";

import { useState } from "react";
import type { Task, Chore, TeamMemberName, PastAssignments } from "@/lib/types";
import { TaskCard } from "./task-card";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type ChoreBoardProps = {
  initialTasks: Task[];
  chores: Record<string, Chore>;
  initialPastAssignments: PastAssignments;
};

export function ChoreBoard({
  initialTasks,
  chores,
}: ChoreBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draggingTask, setDraggingTask] = useState<string | null>(null);
  const [dropzoneTarget, setDropzoneTarget] = useState<TeamMemberName | null>(null);

  const { toast } = useToast();

  const handleDragStart = (taskId: string) => {
    setDraggingTask(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTask(null);
    setDropzoneTarget(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (memberName: TeamMemberName) => {
    if (draggingTask) {
      setDropzoneTarget(memberName);
    }
  };

  const handleDrop = (assignee: TeamMemberName) => {
    if (!draggingTask) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === draggingTask ? { ...task, assignee } : task
      )
    );
    const chore = chores[tasks.find(t => t.id === draggingTask)!.choreId];
    toast({
        title: "Task Reassigned!",
        description: `${chore.title} has been moved to ${assignee}.`,
    })
  };

  const teamMembersWithTasks = tasks.reduce((acc, task) => {
    if (!acc.includes(task.assignee)) {
        acc.push(task.assignee);
    }
    return acc;
    }, [] as TeamMemberName[]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamMembersWithTasks.map((memberName) => (
          <Card
            key={memberName}
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnter(memberName)}
            onDrop={() => handleDrop(memberName)}
            className={cn(
              "transition-colors duration-300 min-h-[200px] flex flex-col",
              dropzoneTarget === memberName ? "bg-primary/10 border-primary" : "bg-card"
            )}
          >
            <CardHeader>
              <CardTitle className="text-center text-lg font-semibold">{memberName}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-2 pt-0">
              {tasks
                .filter((task) => task.assignee === memberName)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    chore={chores[task.choreId]}
                    onDragStart={() => handleDragStart(task.id)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggingTask === task.id}
                  />
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
