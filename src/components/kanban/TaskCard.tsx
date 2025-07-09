
"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskContext } from '@/contexts/TaskContext';
import { useSound } from '@/hooks/use-sound';
import { Attachment, Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Bot, Calendar, CheckCircle2, Clock, GripVertical, Paperclip, PlusCircle, Star, Undo2 } from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import { AddTaskDialog } from './AddTaskDialog';
import { calculatePriorityScore } from '@/lib/priority';
import { AttachmentViewerModal } from './AttachmentViewerModal';

interface TaskCardProps {
  task: Task;
  boardType: 'general' | 'daily';
}

export function TaskCard({ task, boardType }: TaskCardProps) {
  const { settings, updateTask, categorizeTask, moveFromGeneralToDaily } = useTaskContext();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const playSound = useSound();
  const [isClient, setIsClient] = useState(false);
  const [isAttachmentViewerOpen, setIsAttachmentViewerOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const category = useMemo(() => settings.categories.find(c => c.id === task.categoryId), [task.categoryId, settings.categories]);
  
  const priorityScore = useMemo(() => {
    if (!isClient) return 0;
    return calculatePriorityScore(task, settings.priorityWeights);
  }, [task, settings.priorityWeights, isClient]);


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    playSound('drag');
  };

  const handleComplete = () => {
    updateTask(task.id, { status: 'completed', completedAt: new Date().toISOString() });
  };
  
  const handleRevert = () => {
    updateTask(task.id, { status: 'todo', completedAt: undefined });
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

  const openAttachment = (e: React.MouseEvent, attachment: Attachment) => {
      e.stopPropagation();
      if (attachment.type === 'file') {
        setSelectedAttachment(attachment);
        setIsAttachmentViewerOpen(true);
      } else {
          window.open(attachment.url, '_blank', 'noopener,noreferrer');
      }
  }

  return (
    <>
      <Card
        draggable={boardType === 'daily'}
        onDragStart={handleDragStart}
        className={cn(
            "mb-2 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg hover:bg-card/90 transition-all duration-200 border-l-4 cursor-pointer",
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
            {task.description && (
              <p className="line-clamp-2 mb-1 text-sm max-w-full">{task.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5" title={`Deadline: ${new Date(task.deadline).toLocaleDateString()}`}>
                    <Calendar className="h-3 w-3" /> 
                    <span>{isClient ? formatDistanceToNow(new Date(task.deadline), { addSuffix: true }) : '...'}</span>
                </div>
                {task.duration && (
                    <div className="flex items-center gap-1.5" title="Estimated duration">
                        <Clock className="h-3 w-3" /> 
                        <span>{task.duration} min</span>
                    </div>
                )}
                {task.attachments && task.attachments.length > 0 && (
                     <div className="flex items-center gap-1.5" title={`${task.attachments.length} attachments`} onClick={(e) => openAttachment(e, task.attachments![0])}>
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
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); moveFromGeneralToDaily(task.id); }} title="Add to Daily Board">
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
      {selectedAttachment && (
        <AttachmentViewerModal
            isOpen={isAttachmentViewerOpen}
            setIsOpen={setIsAttachmentViewerOpen}
            attachment={selectedAttachment}
        />
      )}
    </>
  );
}
