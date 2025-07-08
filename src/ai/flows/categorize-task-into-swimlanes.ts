// src/ai/flows/categorize-task-into-swimlanes.ts
'use server';

/**
 * @fileOverview An AI agent to categorize tasks into swimlanes (Morning, Midday, Evening).
 *
 * - categorizeTask - A function that categorizes a task into a swimlane.
 * - CategorizeTaskInput - The input type for the categorizeTask function.
 * - CategorizeTaskOutput - The return type for the categorizeTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTaskInputSchema = z.object({
  description: z.string().describe('The description of the task to categorize.'),
});
export type CategorizeTaskInput = z.infer<typeof CategorizeTaskInputSchema>;

const CategorizeTaskOutputSchema = z.object({
  swimlane: z
    .enum(['Morning', 'Midday', 'Evening'])
    .describe('The recommended swimlane for the task.'),
});
export type CategorizeTaskOutput = z.infer<typeof CategorizeTaskOutputSchema>;

export async function categorizeTask(input: CategorizeTaskInput): Promise<CategorizeTaskOutput> {
  return categorizeTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTaskPrompt',
  input: {schema: CategorizeTaskInputSchema},
  output: {schema: CategorizeTaskOutputSchema},
  prompt: `Given the following task description, determine whether it should be placed in the Morning, Midday, or Evening swimlane.

Description: {{{description}}}

Consider when the task would be most effectively completed.
Response:`,
});

const categorizeTaskFlow = ai.defineFlow(
  {
    name: 'categorizeTaskFlow',
    inputSchema: CategorizeTaskInputSchema,
    outputSchema: CategorizeTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
