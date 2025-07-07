"use client";

import React, { useState, useEffect } from 'react';
import { Task, SwimlaneId } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { useTaskContext } from '@/contexts/TaskContext';
import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/use-sound';
import { formatDistanceToNowStrict } from 'date-fns';

interface SwimlaneProps {
  id: SwimlaneId;
  title: string;
  tasks: Task[];
  boardType: 'general' | 'daily';
}

export function Swimlane({ id, title, tasks, boardType }: SwimlaneProps) {
  const { moveTask, settings } = useTaskContext();
  const [isDragOver, setIsDragOver] = useState(false);
  const [timeText, setTimeText] = useState('');
  const playSound = useSound();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  useEffect(() => {
    if (boardType !== 'daily' || !isClient) return;

    const calculateTimeText = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const swimlaneTimes = settings.swimlaneTimes[id];

        if (!swimlaneTimes) return '';

        const start = new Date(now);
        start.setHours(swimlaneTimes.start, 0, 0, 0);
        
        const end = new Date(now);
        if (swimlaneTimes.end === 24) {
            end.setDate(end.getDate() + 1);
            end.setHours(0,0,0,0);
        } else {
            end.setHours(swimlaneTimes.end, 0, 0, 0);
        }

        if (now < start) {
            return `Starts in ${formatDistanceToNowStrict(start)}`;
        } else if (now >= start && now < end) {
            return `${formatDistanceToNowStrict(end)} left`;
        } else {
            return 'Finished for today';
        }
    };

    setTimeText(calculateTimeText());
    const interval = setInterval(() => setTimeText(calculateTimeText()), 60000); // update every minute

    return () => clearInterval(interval);
}, [id, settings.swimlaneTimes, boardType, isClient]);

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
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-semibold font-headline text-foreground">{title}</h2>
          {boardType === 'daily' && isClient && timeText && <span className="text-xs text-muted-foreground">{timeText}</span>}
        </div>
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
