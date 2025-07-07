"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddTaskDialog } from '@/components/kanban/AddTaskDialog';
import { GeneralTaskList } from '@/components/general/GeneralTaskList';

export default function GeneralTasksPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 md:p-6 flex justify-between items-center border-b">
        <div>
            <h1 className="text-2xl font-bold font-headline">General Task Pool</h1>
            <p className="text-muted-foreground">All your tasks, organized by category.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <GeneralTaskList />
      </main>
      <AddTaskDialog isOpen={isAddDialogOpen} setIsOpen={setIsAddDialogOpen} />
    </div>
  );
}
