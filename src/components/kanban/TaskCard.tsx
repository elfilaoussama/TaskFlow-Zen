"use client";

import React, { useState, useMemo } from 'react';
import { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Tag, Calendar, CheckCircle2, Bot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTaskContext } from '@/contexts/TaskContext';
import { AddTaskDialog } from './AddTaskDialog';
import { useSound } from '@/hooks/use-sound';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  boardType: 'general' | 'daily';
}

const calculatePriorityScore = (task: Task, weights: any) => {
  const { urgency, importance, impact } = task.priority;
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  const daysUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24);

  let deadlineFactor = 1;
  if (daysUntilDeadline < 1) deadlineFactor = 10;
  else if (daysUntilDeadline < 3) deadlineFactor = 7;
  else if (daysUntilDeadline < 7) deadlineFactor = 4;

  const score =
    urgency * weights.urgency +
    importance * weights.importance +
    impact * weights.impact +
    deadlineFactor * weights.deadline;
  
  return score;
};

const getPriorityStyle = (score: number) => {
  if (score > 60) return 'border-red-500';
  if (score > 40) return 'border-orange-500';
  if (score > 20) return 'border-yellow-500';
  return 'border-blue-500';
};


export function TaskCard({ task, boardType }: TaskCardProps) {
  const { updateTask, settings, categorizeTask, moveFromGeneralToDaily } = useTaskContext();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const playSound = useSound();

  const priorityScore = useMemo(() => calculatePriorityScore(task, settings.priorityWeights), [task, settings.priorityWeights]);
  const priorityStyle = useMemo(() => getPriorityStyle(priorityScore), [priorityScore]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    playSound('drag');
  };

  const handleComplete = () => {
    updateTask(task.id, { status: 'completed', completedAt: new Date().toISOString() });
    playSound('complete');
  };

  const handleAiCategorize = async () => {
    setIsCategorizing(true);
    await categorizeTask(task.id);
    setIsCategorizing(false);
  };
  
  return (
    <>
      <Card
        draggable
        onDragStart={handleDragStart}
        className={cn(
            "mb-4 cursor-grab active:cursor-grabbing bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 border-l-4",
            task.status === 'completed' ? 'opacity-60 line-through' : '',
            priorityStyle
        )}
        onClick={() => setIsEditDialogOpen(true)}
      >
        <CardHeader className="p-4 flex flex-row items-start justify-between">
          <CardTitle className="text-base font-medium">{task.title}</CardTitle>
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
          <p className="truncate">{task.description}</p>
          <div className="flex items-center gap-2 mt-3 text-xs">
            <Calendar className="h-4 w-4" />
            <span>Deadline: {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex gap-1 flex-wrap">
            {task.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-1">
             {task.status === 'todo' && boardType === 'general' && !task.isDaily && (
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); moveFromGeneralToDaily(task.id); }} title="Add to Daily Board">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </Button>
            )}
             {task.status === 'todo' && (
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleAiCategorize(); }} title="Categorize with AI" disabled={isCategorizing}>
                    <Bot className={cn("h-4 w-4 text-blue-500", isCategorizing && "animate-spin")} />
                </Button>
            )}
            {task.status === 'todo' && (
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleComplete(); }} title="Complete Task">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      <AddTaskDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        taskToEdit={task}
        boardType={boardType}
      />
    </>
  );
}
