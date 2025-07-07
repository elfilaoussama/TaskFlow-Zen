"use client";

import { useState } from 'react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddTaskDialog } from '@/components/kanban/AddTaskDialog';

export default function GeneralKanbanPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 md:p-6 flex justify-between items-center border-b">
        <div>
            <h1 className="text-2xl font-bold font-headline">General Kanban</h1>
            <p className="text-muted-foreground">Your persistent task pool.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </header>
      <main className="flex-1 overflow-y-auto">
        <KanbanBoard boardType="general" />
      </main>
      <AddTaskDialog isOpen={isAddDialogOpen} setIsOpen={setIsAddDialogOpen} boardType="general" />
    </div>
  );
}
