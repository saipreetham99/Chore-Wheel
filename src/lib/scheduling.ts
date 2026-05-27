import type { Task, Chore, TeamMemberName } from "./types";
import { shuffle } from "./utils";

export function generateWeeklySchedule(
  chores: Record<string, Chore>,
  teamMembers: TeamMemberName[],
  monthOffset: number,
  weeksInMonth: number = 4
): Task[][][] {
  const schedule: Task[][][] = Array.from({ length: weeksInMonth }, () =>
    Array.from({ length: teamMembers.length }, () => [])
  );

  const seed = monthOffset;

  for (let week = 0; week < weeksInMonth; week++) {
    // 1. Create a pool of all task instances for the week
    const weeklyTaskPool: string[] = [];
    for (const choreId in chores) {
      const chore = chores[choreId];
      for (let i = 0; i < (chore.frequency || 1); i++) {
        weeklyTaskPool.push(chore.id);
      }
    }
    
    // Shuffle the pool to ensure random distribution of tasks that don't have conflicts
    const shuffledTasks = shuffle(weeklyTaskPool, seed + week);
    
    // Tracking for the greedy assignment
    // We want to track which tasks each member has already been assigned this week
    const memberTasks = new Map<TeamMemberName, Set<string>>();
    const memberLoad = new Map<TeamMemberName, number>();
    
    teamMembers.forEach(m => {
        memberTasks.set(m, new Set());
        memberLoad.set(m, 0);
    });

    shuffledTasks.forEach((choreId, taskIndex) => {
        // Find the best member for this task
        // Criteria:
        // 1. Doesn't have this task yet (hard constraint if possible, soft otherwise)
        // 2. Has the lowest load
        // 3. Random tie-breaker

        // Sort members by suitability
        const sortedMembers = [...teamMembers].sort((a, b) => {
            const hasTaskA = memberTasks.get(a)!.has(choreId);
            const hasTaskB = memberTasks.get(b)!.has(choreId);
            
            // 1. Preference: Has task? False is better.
            if (hasTaskA !== hasTaskB) {
                return hasTaskA ? 1 : -1;
            }

            // 2. Preference: Load? Lower is better.
            const loadA = memberLoad.get(a)!;
            const loadB = memberLoad.get(b)!;
            if (loadA !== loadB) {
                return loadA - loadB;
            }
            
            // 3. Tie-breaker: Random (stable for the same seed/inputs ideally, but standard sort needs comparison)
            // We'll use a rotated starting index based on week to disperse 'first pick' advantage
            // But since we are sorting the *entire* list, we can just use the index in the original array as a deterministic tie breaker
            // combined with a rotation.
            const idxA = teamMembers.indexOf(a);
            const idxB = teamMembers.indexOf(b);
            
            // Rotate the "efficiency" preference each week so the same person isn't always the "tie breaker winner"
            // (Lower index wins tie in stable sort usually, so we want to effectively rotate who is 'first')
            const rotatedIdxA = (idxA + week) % teamMembers.length;
            const rotatedIdxB = (idxB + week) % teamMembers.length;
            
            return rotatedIdxA - rotatedIdxB;
        });

        const chosenMember = sortedMembers[0];
        
        // Assign
        const memberIndex = teamMembers.indexOf(chosenMember);
        schedule[week][memberIndex].push({
            id: `task-${chosenMember}-${choreId}-m${monthOffset}-w${week}-i${taskIndex}`,
            choreId: choreId,
            assignee: chosenMember,
        });
        
        memberTasks.get(chosenMember)!.add(choreId);
        memberLoad.set(chosenMember, memberLoad.get(chosenMember)! + 1);
    });
  }

  return schedule;
}
