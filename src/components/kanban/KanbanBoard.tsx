"use client";

import React from 'react';
import { Task, SWIMLANES } from '@/lib/types';
import { Swimlane } from './Swimlane';
import { useTaskContext } from '@/contexts/TaskContext';
import { Skeleton } from '@/components/ui/skeleton';

interface KanbanBoardProps {
  boardType: 'general' | 'daily';
}

export function KanbanBoard({ boardType }: KanbanBoardProps) {
  const { tasks, isLoading } = useTaskContext();

  const boardTasks = tasks.filter(task => (boardType === 'daily' ? task.isDaily : !task.isDaily));

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-6 p-6">
        {SWIMLANES.map(id => (
          <div key={id} className="flex-1 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6">
      {SWIMLANES.map(id => (
        <Swimlane
          key={id}
          id={id}
          title={id}
          tasks={boardTasks.filter(task => task.swimlane === id)}
          boardType={boardType}
        />
      ))}
    </div>
  );
}
