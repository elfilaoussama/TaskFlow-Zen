
"use client";

import type { Metadata } from 'next';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useTaskContext } from '@/contexts/TaskContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const metadata: Metadata = {
  title: 'Daily Kanban Board',
  description: 'Plan your day with laser focus. Move tasks from the general pool to your daily Morning, Midday, and Evening swimlanes.',
};

export default function DailyKanbanPage() {
  const { clearDailyTasks } = useTaskContext();

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 md:p-6 flex justify-between items-center border-b">
        <div>
            <h1 className="text-2xl font-bold font-headline">Daily Kanban</h1>
            <p className="text-muted-foreground">Your plan for today. Move tasks from the general pool.</p>
        </div>
        <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive-outline"><Trash2 className="mr-2 h-4 w-4" /> Clear Board</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will move all tasks from your daily board back to the general pool. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearDailyTasks}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <KanbanBoard boardType="daily" />
      </main>
    </div>
  );
}
