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

// Simple seeded PRNG
function seededRandom(seed: number) {
  let s = Math.sin(seed) * 10000;
  return s - Math.floor(s);
}

export function shuffle<T>(array: T[], seed?: number): T[] {
  let currentIndex = array.length,  randomIndex;
  const newArray = [...array]; // Create a copy to avoid mutating the original array

  const random = seed !== undefined ? () => seededRandom(seed * (currentIndex+1)) : Math.random;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }

  return newArray;
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
  'clean-kitchen': { id: 'clean-kitchen', title: 'Clean Kitchen', description: 'Wipe counters, do dishes, clean sink.', iconName: 'CookingPot', frequency: 1 },
  'clean-living-area': { id: 'clean-living-area', title: 'Clean Living Area', description: 'Tidy up, dust surfaces, vacuum.', iconName: 'Sofa', frequency: 1 },
  'clean-bathroom': { id: 'clean-bathroom', title: 'Clean Bathroom', description: 'Clean toilet, sink, and shower.', iconName: 'Bath', frequency: 1 },
  'take-out-trash': { id: 'take-out-trash', title: 'Take out Trash', description: 'Empty all non-kitchen trash bins and take to curb.', iconName: 'Trash2', frequency: 1 },
};
