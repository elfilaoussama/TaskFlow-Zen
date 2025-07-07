export type SwimlaneId = 'Morning' | 'Midday' | 'Evening';

export const SWIMLANES: SwimlaneId[] = ['Morning', 'Midday', 'Evening'];

export interface PriorityParams {
  urgency: number;
  importance: number;
  impact: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
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
  tags: string[];
  timezones: { id: string; name: string }[];
  soundEnabled: boolean;
}
