
import type { Chore, Task, TeamMemberName, PastAssignments } from './types';

export const teamMembers: TeamMemberName[] = ['Person 1', 'Person 2', 'Person 3', 'Person 4'];

export const chores: Record<string, Chore> = {
  'clean-kitchen': { id: 'clean-kitchen', title: 'Clean Kitchen', description: 'Wipe counters, do dishes, clean sink.', iconName: 'CookingPot', frequency: 1 },
  'clean-living-area': { id: 'clean-living-area', title: 'Clean Living Area', description: 'Tidy up, dust surfaces, vacuum.', iconName: 'Sofa', frequency: 1 },
  'clean-bathroom': { id: 'clean-bathroom', title: 'Clean Bathroom', description: 'Clean toilet, sink, and shower.', iconName: 'Bath', frequency: 1 },

  'take-out-trash': { id: 'take-out-trash', title: 'Take out Trash', description: 'Empty all non-kitchen trash bins and take to curb.', iconName: 'Trash', frequency: 1 },
};

export const uniqueChoreIds = Object.keys(chores);

export const initialTasks: Task[] = teamMembers.map((member, index) => {
    const choreId = uniqueChoreIds[index % uniqueChoreIds.length];
    return {
        id: `task-${member}-${choreId}`,
        choreId: choreId,
        assignee: member,
    };
});


export const initialPastAssignments: PastAssignments = {
    'Person 1': 5,
    'Person 2': 4,
    'Person 3': 6,
    'Person 4': 5,
};
