"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/lib/types';
import { useSound } from '@/hooks/use-sound';
import { Slider } from '@/components/ui/slider';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  deadline: z.date(),
  priority: z.object({
    urgency: z.coerce.number().min(1).max(10),
    importance: z.coerce.number().min(1).max(10),
    impact: z.coerce.number().min(1).max(10),
  }),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface AddTaskDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  taskToEdit?: Task;
}

export function AddTaskDialog({ isOpen, setIsOpen, taskToEdit }: AddTaskDialogProps) {
  const { addTask, updateTask, deleteTask, settings } = useTaskContext();
  const playSound = useSound();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: settings.categories[0]?.id || '',
      tags: [],
      deadline: new Date(),
      priority: { urgency: 5, importance: 5, impact: 5 },
    },
  });

  useEffect(() => {
    if (taskToEdit) {
      form.reset({
        title: taskToEdit.title,
        description: taskToEdit.description,
        categoryId: taskToEdit.categoryId,
        tags: taskToEdit.tags,
        deadline: new Date(taskToEdit.deadline),
        priority: taskToEdit.priority,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        categoryId: settings.categories[0]?.id,
        tags: [],
        deadline: new Date(new Date().setHours(23, 59, 59, 999)), // Default to end of today
        priority: { urgency: 5, importance: 5, impact: 5 },
      });
    }
  }, [taskToEdit, form, isOpen, settings.categories]);

  const onSubmit = (data: TaskFormValues) => {
    const taskData = {
      ...data,
      deadline: data.deadline.toISOString(),
    };
    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
      playSound('add');
    }
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (taskToEdit) {
      deleteTask(taskToEdit.id);
      playSound('delete');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{taskToEdit ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Design new landing page" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add more details about the task" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {settings.categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date => date < new Date(new Date().setDate(new Date().getDate() -1))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-2">
                <FormLabel>Priority</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg">
                    <FormField control={form.control} name="priority.urgency" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm">Urgency ({field.value})</FormLabel>
                            <FormControl>
                                <Slider
                                    min={1} max={10} step={1}
                                    value={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                />
                            </FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="priority.importance" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm">Importance ({field.value})</FormLabel>
                             <FormControl>
                                <Slider
                                    min={1} max={10} step={1}
                                    value={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                />
                            </FormControl>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="priority.impact" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm">Impact ({field.value})</FormLabel>
                             <FormControl>
                                <Slider
                                    min={1} max={10} step={1}
                                    value={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                />
                            </FormControl>
                        </FormItem>
                    )} />
                </div>
            </div>

            <DialogFooter className="sm:justify-between pt-4">
              <div>
                {taskToEdit && (
                  <Button type="button" variant="destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">{taskToEdit ? 'Save Changes' : 'Create Task'}</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
