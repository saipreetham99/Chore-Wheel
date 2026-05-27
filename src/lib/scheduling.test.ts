import { generateWeeklySchedule } from './scheduling';
import { chores } from './initial-data';
import type { Task, Chore, TeamMemberName } from "./types";

// Mock data
const mockMembers: TeamMemberName[] = ["Alice", "Bob", "Charlie", "David"];

// Mock chores (more than members to force multiple tasks per person, but one of each type per week)
const mockChores: Record<string, Chore> = {
    'c1': { id: 'c1', title: 'Task 1', description: 'd1', iconName: 'Home', frequency: 1 },
    'c2': { id: 'c2', title: 'Task 2', description: 'd2', iconName: 'Home', frequency: 1 },
    'c3': { id: 'c3', title: 'Task 3', description: 'd3', iconName: 'Home', frequency: 1 },
    'c4': { id: 'c4', title: 'Task 4', description: 'd4', iconName: 'Home', frequency: 1 },
    'c5': { id: 'c5', title: 'Task 5', description: 'd5', iconName: 'Home', frequency: 1 }, // 5 tasks, 4 people. Someone gets 2.
};

// 1. Test: No duplicates if frequency = 1
console.log("--- Test 1: No duplicates if freq=1 ---");
const schedule1 = generateWeeklySchedule(mockChores, mockMembers, 0);

schedule1.forEach((week, weekIdx) => {
    week.forEach((memberTasks, memberIdx) => {
        const memberName = mockMembers[memberIdx];
        const taskIds = memberTasks.map(t => t.choreId);
        const uniqueTasks = new Set(taskIds);
        if (taskIds.length !== uniqueTasks.size) {
            console.error(`FAIL: Week ${weekIdx}, Member ${memberName} has duplicates:`, taskIds);
        } else {
            // console.log(`PASS: Week ${weekIdx}, Member ${memberName} tasks:`, taskIds);
        }
    });
});
console.log("Test 1 complete.");

// 2. Test: Duplicates minimized if freq > 1
console.log("\n--- Test 2: High frequency task (should result in duplicates but minimized) ---");
const highFreqChores: Record<string, Chore> = {
    ...mockChores,
    'c_common': { id: 'c_common', title: 'Common Task', description: 'd', iconName: 'Home', frequency: 5 }, // 5 times a week, 4 people. ONE person must get it twice.
};

const schedule2 = generateWeeklySchedule(highFreqChores, mockMembers, 0);
schedule2.forEach((week, weekIdx) => {
    // Check distribution of 'c_common'
    const counts = new Map<string, number>();
    mockMembers.forEach(m => counts.set(m, 0));

    week.forEach((tasks, idx) => {
        tasks.forEach(t => {
            if (t.choreId === 'c_common') {
                counts.set(mockMembers[idx], counts.get(mockMembers[idx])! + 1);
            }
        });
    });

    console.log(`Week ${weekIdx} distribution of 'c_common':`, Object.fromEntries(counts));

    // Check for other tasks
    week.forEach((memberTasks, memberIdx) => {
        const memberName = mockMembers[memberIdx];
        const taskIds = memberTasks.map(t => t.choreId);
        const c1Count = taskIds.filter(id => id === 'c1').length;
        if (c1Count > 1) {
            console.error(`FAIL: Week ${weekIdx}, Member ${memberName} has duplicate 'c1' (freq=1)`);
        }
    });
});
console.log("Test 2 complete.");
