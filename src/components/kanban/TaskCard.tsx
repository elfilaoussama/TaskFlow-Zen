"use client";

import React, { useState, useMemo } from 'react';
import { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Calendar, CheckCircle2, Bot, PlusCircle, Undo2, Star, Clock, Paperclip } from 'lucide-react';
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
    return urgency * weights.urgency + importance * weights.importance + impact * weights.impact + deadlineFactor * weights.deadline;
};

export function TaskCard({ task, boardType }: TaskCardProps) {
  const { settings, updateTask, categorizeTask, moveFromGeneralToDaily } = useTaskContext();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const playSound = useSound();

  const category = useMemo(() => settings.categories.find(c => c.id === task.categoryId), [task.categoryId, settings.categories]);
  const priorityScore = useMemo(() => calculatePriorityScore(task, settings.priorityWeights), [task, settings.priorityWeights]);


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    playSound('drag');
  };

  const handleComplete = () => {
    updateTask(task.id, { status: 'completed', completedAt: new Date().toISOString() });
    playSound('complete');
  };
  
  const handleRevert = () => {
    updateTask(task.id, { status: 'todo', completedAt: undefined });
    playSound('add');
  };

  const handleAiCategorize = async () => {
    setIsCategorizing(true);
    await categorizeTask(task.id);
    setIsCategorizing(false);
  };
  
  const openEditDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  }

  return (
    <>
      <Card
        draggable={boardType === 'daily'}
        onDragStart={handleDragStart}
        className={cn(
            "mb-2 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg hover:bg-card/90 transition-all duration-200 border-l-4",
            task.status === 'completed' ? 'opacity-60' : '',
            boardType === 'daily' && 'cursor-grab active:cursor-grabbing'
        )}
        style={{ borderLeftColor: category?.color || 'hsl(var(--border))' }}
        onClick={openEditDialog}
      >
        <CardHeader className="p-4 flex flex-row items-start justify-between">
          <CardTitle className="text-base font-medium">{task.title}</CardTitle>
          {boardType === 'daily' && <GripVertical className="h-5 w-5 text-muted-foreground" />}
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm text-muted-foreground space-y-2">
            {task.description && <p className="truncate mb-1">{task.description}</p>}
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5" title={`Deadline: ${new Date(task.deadline).toLocaleDateString()}`}>
                    <Calendar className="h-3 w-3" /> 
                    <span>{formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}</span>
                </div>
                {task.duration && (
                    <div className="flex items-center gap-1.5" title="Estimated duration">
                        <Clock className="h-3 w-3" /> 
                        <span>{task.duration} min</span>
                    </div>
                )}
                {task.attachments && task.attachments.length > 0 && (
                    <div className="flex items-center gap-1.5" title={`${task.attachments.length} attachments`}>
                        <Paperclip className="h-3 w-3" />
                        <span>{task.attachments.length}</span>
                    </div>
                )}
            </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex gap-1 flex-wrap items-center">
            {category && <Badge variant="secondary" style={{ backgroundColor: `${category.color}20`, color: category.color }}>{category.name}</Badge>}
            <Badge variant="outline" className="flex items-center gap-1 text-xs" title="Priority Score">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                {priorityScore.toFixed(0)}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
             {boardType === 'general' && task.status === 'todo' && (
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); moveFromGeneralToDaily(task.id); playSound('add'); }} title="Add to Daily Board">
                <PlusCircle className="h-4 w-4 text-primary" />
              </Button>
            )}
            
            {boardType === 'daily' && task.status === 'todo' && (
              <>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleAiCategorize(); }} title="Categorize with AI" disabled={isCategorizing}>
                    <Bot className={cn("h-4 w-4 text-blue-500", isCategorizing && "animate-spin")} />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleComplete(); }} title="Complete Task">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                </Button>
              </>
            )}
            {(boardType === 'daily' || task.status === 'completed') && task.status === 'completed' && (
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleRevert(); }} title="Mark as To-Do">
                    <Undo2 className="h-4 w-4 text-orange-500" />
                </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      <AddTaskDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        taskToEdit={task}
      />
    </>
  );
}
