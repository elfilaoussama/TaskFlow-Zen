'use server';

import { categorizeTask as categorizeTaskFlow } from '@/ai/flows/categorize-task-into-swimlanes';

export async function getTaskCategory(description: string) {
  if (!description) {
    return { success: false, error: 'Task description is empty.' };
  }
  
  try {
    const result = await categorizeTaskFlow({ description });
    return { success: true, swimlane: result.swimlane };
  } catch (error) {
    console.error('AI categorization failed:', error);
    return { success: false, error: 'Failed to categorize task with AI.' };
  }
}
