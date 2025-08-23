'use server';

import { suggestFairTaskAssignment } from '@/ai/flows/suggest-fair-task-assignment';
import { teamMembers } from '@/lib/initial-data';
import type { PastAssignments } from '@/lib/types';
import { teamMemberNames } from '@/lib/types';

export async function getSuggestion(
  taskTitle: string,
  pastAssignments: PastAssignments
) {
  try {
    const result = await suggestFairTaskAssignment({
      task: taskTitle,
      teamMembers: [...teamMemberNames],
      pastAssignments,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return { success: false, error: 'Failed to get a suggestion. Please try again.' };
  }
}
