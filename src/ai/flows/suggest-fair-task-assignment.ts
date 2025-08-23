'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting fair task assignments based on past task completion.
 *
 * - suggestFairTaskAssignment - A function that initiates the task assignment suggestion process.
 * - SuggestFairTaskAssignmentInput - The input type for the suggestFairTaskAssignment function.
 * - SuggestFairTaskAssignmentOutput - The return type for the suggestFairTaskAssignment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFairTaskAssignmentInputSchema = z.object({
  task: z.string().describe('The task to be assigned.'),
  teamMembers: z.array(z.string()).describe('The names of the team members.'),
  pastAssignments: z
    .record(z.string(), z.number())
    .describe(
      'A record of past task assignments, where keys are team member names and values are the number of tasks they have completed.'
    ),
});
export type SuggestFairTaskAssignmentInput = z.infer<
  typeof SuggestFairTaskAssignmentInputSchema
>;

const SuggestFairTaskAssignmentOutputSchema = z.object({
  suggestedAssignee: z
    .string()
    .describe(
      'The name of the team member suggested for the task, considering fairness and past assignments.'
    ),
  reasoning:
    z.string()
    .describe('The AI reasoning behind the task assignment suggestion.'),
});
export type SuggestFairTaskAssignmentOutput = z.infer<
  typeof SuggestFairTaskAssignmentOutputSchema
>;

export async function suggestFairTaskAssignment(
  input: SuggestFairTaskAssignmentInput
): Promise<SuggestFairTaskAssignmentOutput> {
  return suggestFairTaskAssignmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFairTaskAssignmentPrompt',
  input: {schema: SuggestFairTaskAssignmentInputSchema},
  output: {schema: SuggestFairTaskAssignmentOutputSchema},
  prompt: `You are a helpful assistant that suggests the best person to assign a task to, based on fairness.

Task: {{{task}}}
Team Members: {{#each teamMembers}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Past Assignments: {{#each pastAssignments}}{{{@key}}}: {{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Consider the task and the past assignments of each team member to suggest the most fair person to assign the task to.
Explain your reasoning. Take into account who has recently done the task and ensure everyone shares the load.

Output the suggested assignee and the reasoning in JSON format.`,
});

const suggestFairTaskAssignmentFlow = ai.defineFlow(
  {
    name: 'suggestFairTaskAssignmentFlow',
    inputSchema: SuggestFairTaskAssignmentInputSchema,
    outputSchema: SuggestFairTaskAssignmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
