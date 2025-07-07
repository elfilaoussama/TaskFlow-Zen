"use client";

import React, { useState } from 'react';
import { Task, SwimlaneId } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { useTaskContext } from '@/contexts/TaskContext';
import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/use-sound';

interface SwimlaneProps {
  id: SwimlaneId;
  title: string;
  tasks: Task[];
  boardType: 'general' | 'daily';
}

export function Swimlane({ id, title, tasks, boardType }: SwimlaneProps) {
  const { moveTask } = useTaskContext();
  const [isDragOver, setIsDragOver] = useState(false);
  const playSound = useSound();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      moveTask(taskId, id, tasks.length);
      playSound('drop');
    }
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "flex-1 p-4 rounded-lg bg-muted/50 transition-colors duration-200",
        isDragOver && "bg-accent/30"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-headline text-foreground">{title}</h2>
        <span className="text-sm font-medium text-muted-foreground bg-background px-2 py-1 rounded-full">{tasks.length}</span>
      </div>
      <div className="h-full min-h-[200px]">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} boardType={boardType} />
        ))}
         {tasks.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg p-4">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
