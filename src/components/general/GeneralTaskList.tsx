"use client";

import React, { useMemo } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TaskCard } from '../kanban/TaskCard';

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

const CategorySection = ({ category, tasks }: { category: { id: string; name: string; color: string; }, tasks: Task[] }) => {
    if (tasks.length === 0) return null;
    return (
        <AccordionItem value={category.id}>
            <AccordionTrigger>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">{tasks.length}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                 <div className="space-y-2 pt-2">
                    {tasks.map(task => <TaskCard key={task.id} task={task} boardType="general" />)}
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

export function GeneralTaskList() {
  const { tasks, settings, isLoading } = useTaskContext();

  const { activeTasks, completedTasks } = useMemo(() => {
    const generalTasks = tasks.filter(task => !task.isDaily);
    const active = generalTasks.filter(task => task.status === 'todo');
    const completed = generalTasks.filter(task => task.status === 'completed');
    
    const sortFn = (a: Task, b: Task) => calculatePriorityScore(b, settings.priorityWeights) - calculatePriorityScore(a, settings.priorityWeights);
    
    active.sort(sortFn);
    completed.sort(sortFn);

    return { activeTasks: active, completedTasks: completed };
  }, [tasks, settings.priorityWeights]);


  const tasksByCategory = useMemo(() => {
    return settings.categories.map(category => ({
      ...category,
      tasks: activeTasks.filter(task => task.categoryId === category.id)
    }));
  }, [activeTasks, settings.categories]);

  const defaultAccordionOpen = useMemo(() => {
    const open = tasksByCategory.filter(cat => cat.tasks.length > 0).map(cat => cat.id);
    if (completedTasks.length > 0) {
      open.push('completed');
    }
    return open;
  }, [tasksByCategory, completedTasks.length]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1,2,3].map(i => (
            <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
        <Accordion type="multiple" defaultValue={defaultAccordionOpen} className="w-full">
            {tasksByCategory.map(cat => (
                <CategorySection key={cat.id} category={cat} tasks={cat.tasks} />
            ))}

            {completedTasks.length > 0 && (
                <AccordionItem value="completed">
                    <AccordionTrigger>
                        <h3 className="text-xl font-semibold">Finished Tasks ({completedTasks.length})</h3>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-2">
                         {completedTasks.map(task => <TaskCard key={task.id} task={task} boardType="general" />)}
                    </AccordionContent>
                </AccordionItem>
            )}
        </Accordion>

        {activeTasks.length === 0 && completedTasks.length === 0 && (
            <div className="text-center py-16">
                <h2 className="text-xl font-semibold">No tasks yet!</h2>
                <p className="text-muted-foreground">Click "Add Task" to get started.</p>
            </div>
        )}
    </div>
  );
}
