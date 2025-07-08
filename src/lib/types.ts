export type SwimlaneId = 'Morning' | 'Midday' | 'Evening';

export const SWIMLANES: SwimlaneId[] = ['Morning', 'Midday', 'Evening'];

export interface Category {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '#3b82f6' },
  { id: 'personal', name: 'Personal', color: '#10b981' },
  { id: 'study', name: 'Study', color: '#f97316' },
  { id: 'health', name: 'Health & Fitness', color: '#ef4444' },
];

export type Attachment = {
  id: string;
  name: string;
} & ({
  type: 'link';
  url: string;
} | {
  type: 'file';
  dataUri: string;
  fileType: string;
});


export interface PriorityParams {
  urgency: number;
  importance: number;
  impact: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  swimlane: SwimlaneId;
  priority: PriorityParams;
  tags: string[];
  deadline: string;
  createdAt: string;
  status: 'todo' | 'completed';
  completedAt?: string;
  isDaily: boolean;
  duration?: number; // Duration in minutes
  attachments?: Attachment[];
}

export interface Settings {
  priorityWeights: {
    urgency: number;
    importance: number;
    impact: number;
    deadline: number;
  };
  swimlaneTimes: {
    Morning: { start: number; end: number };
    Midday: { start: number; end: number };
    Evening: { start: number; end: number };
  };
  categories: Category[];
  tags: string[];
  timezones: { id: string; name: string }[];
  soundEnabled: boolean;
}
