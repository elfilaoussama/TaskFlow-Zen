"use client";

import React, { useState, useMemo } from 'react';
import { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Calendar, CheckCircle2, Bot, PlusCircle, Undo2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTaskContext } from '@/contexts/TaskContext';
import { AddTaskDialog } from './AddTaskDialog';
import { useSound } from '@/hooks/use-sound';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  boardType: 'general' | 'daily';
}

export function TaskCard({ task, boardType }: TaskCardProps) {
  const { settings, updateTask, categorizeTask, moveFromGeneralToDaily } = useTaskContext();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const playSound = useSound();

  const category = useMemo(() => settings.categories.find(c => c.id === task.categoryId), [task.categoryId, settings.categories]);

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
        <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
          {task.description && <p className="truncate mb-3">{task.description}</p>}
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex gap-1 flex-wrap">
            {category && <Badge variant="secondary" style={{ backgroundColor: `${category.color}20`, color: category.color }}>{category.name}</Badge>}
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
