import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Task, Chore, TeamMemberName } from "./types";
import { chores as choreData } from "./initial-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function rotateChores(tasks: Task[], teamMembers: TeamMemberName[]): Task[] {
  if (tasks.length === 0) return [];
  
  const lastChoreId = tasks[tasks.length - 1].choreId;
  const rotatedTasks = tasks.slice(0, -1);
  const newFirstTask = { ...tasks[tasks.length - 1], choreId: lastChoreId };

  const newTasks: Task[] = [
    {...tasks[tasks.length-1]},
    ...tasks.slice(0, -1)
  ];

  return newTasks.map((task, index) => ({
      ...task,
      assignee: teamMembers[index % teamMembers.length],
      id: `${task.id}-rotated-${Math.random()}`
  }));
}

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function getNextTuesday() {
  const date = new Date();
  const today = date.getDay();
  // In JS, Sunday is 0, Monday is 1, ..., Tuesday is 2.
  const tuesdayDayOfWeek = 2;
  let daysUntilTuesday = tuesdayDayOfWeek - today;
  if (daysUntilTuesday <= 0) {
    // If it's already past Tuesday this week, or it is Tuesday, get next week's Tuesday.
    daysUntilTuesday += 7;
  }
  date.setDate(date.getDate() + daysUntilTuesday);
  return date;
}


export const chores: Record<string, Chore> = {
  'clean-kitchen': { id: 'clean-kitchen', title: 'Clean Kitchen', description: 'Wipe counters, do dishes, clean sink.', iconName: 'CookingPot' },
  'clean-living-area': { id: 'clean-living-area', title: 'Clean Living Area', description: 'Tidy up, dust surfaces, vacuum.', iconName: 'Sofa' },
  'clean-bathroom': { id: 'clean-bathroom', title: 'Clean Bathroom', description: 'Clean toilet, sink, and shower.', iconName: 'Bath' },
  'take-out-trash': { id: 'take-out-trash', title: 'Take out Trash', description: 'Empty all non-kitchen trash bins and take to curb.', iconName: 'Trash2' },
};
