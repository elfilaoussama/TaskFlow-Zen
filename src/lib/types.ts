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
}

export interface Settings {
  priorityWeights: {
    urgency: number;
    importance: number;
    impact: number;
    deadline: number;
  };
  categories: Category[];
  tags: string[];
  timezones: { id: string; name: string }[];
  soundEnabled: boolean;
}
