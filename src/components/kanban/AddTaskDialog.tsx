"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
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
import { CalendarIcon, Trash2, Link, X, Paperclip, File as FileIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task, Attachment } from '@/lib/types';
import { useSound } from '@/hooks/use-sound';
import { Slider } from '@/components/ui/slider';

const attachmentSchema = z.union([
  z.object({
    id: z.string(),
    name: z.string().min(1, 'Name is required'),
    type: z.literal('link'),
    url: z.string().url('Must be a valid URL'),
  }),
  z.object({
    id: z.string(),
    name: z.string().min(1, 'Name is required'),
    type: z.literal('file'),
    dataUri: z.string(),
    fileType: z.string(),
  })
]);

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),
  deadline: z.date(),
  priority: z.object({
    urgency: z.coerce.number().min(1).max(10),
    importance: z.coerce.number().min(1).max(10),
    impact: z.coerce.number().min(1).max(10),
  }),
  duration: z.coerce.number().int().min(0, "Duration must be positive.").optional(),
  attachments: z.array(attachmentSchema).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface AddTaskDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  taskToEdit?: Task;
}

const AddLinkPopover = ({ onAddLink }: { onAddLink: (name: string, url: string) => void }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleAdd = () => {
        if (name && url) {
            onAddLink(name, url);
            setName('');
            setUrl('');
            setIsOpen(false);
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild><Button type="button" variant="outline" size="sm">
                    <Link className="mr-2 h-4 w-4" /> Add Link
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Add a Link</h4>
                        <p className="text-sm text-muted-foreground">Provide a name and URL for your attachment.</p>
                    </div>
                    <div className="grid gap-2">
                        <Input placeholder="Link Name" value={name} onChange={(e) => setName(e.target.value)} />
                        <Input placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
                    </div>
                    <Button onClick={handleAdd}>Add</Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export function AddTaskDialog({ isOpen, setIsOpen, taskToEdit }: AddTaskDialogProps) {
  const { addTask, updateTask, deleteTask, settings } = useTaskContext();
  const playSound = useSound();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '', description: '', categoryId: '', tags: [],
      deadline: new Date(), priority: { urgency: 5, importance: 5, impact: 5 },
      attachments: [],
      duration: undefined,
    },
  });
  
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "attachments" });
  
  const fileAttachments = fields.filter(field => field.type === 'file');
  const linkAttachments = fields.filter(field => field.type === 'link');

  useEffect(() => {
    if (taskToEdit) {
      form.reset({
        title: taskToEdit.title,
        description: taskToEdit.description,
        categoryId: taskToEdit.categoryId,
        tags: taskToEdit.tags,
        deadline: new Date(taskToEdit.deadline),
        priority: taskToEdit.priority,
        duration: taskToEdit.duration,
        attachments: taskToEdit.attachments,
      });
    } else {
      form.reset({
        title: '', description: '', categoryId: settings.categories[0]?.id,
        tags: [], deadline: new Date(new Date().setHours(23, 59, 59, 999)),
        priority: { urgency: 5, importance: 5, impact: 5 },
        duration: undefined,
        attachments: [],
      });
    }
  }, [taskToEdit, form, isOpen, settings.categories]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        append({
          id: uuidv4(),
          type: 'file',
          name: file.name,
          fileType: file.type,
          dataUri,
        });
      };
      reader.readAsDataURL(file);
    });
  }

  const onSubmit = (data: TaskFormValues) => {
    const taskData = { ...data, deadline: data.deadline.toISOString() };
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
  
  const handleAddLink = (name: string, url: string) => {
      append({ id: uuidv4(), name, url, type: 'link' });
  }
  
  const handleRemoveAttachment = (id: string) => {
    const index = fields.findIndex(field => field.id === id);
    if (index > -1) {
        remove(index);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{taskToEdit ? 'Edit Task' : 'Add New Task'}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Title</FormLabel> <FormControl> <Input placeholder="e.g., Design new landing page" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Textarea placeholder="Add more details about the task" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="categoryId" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}> <FormControl> <SelectTrigger> <span>{field.value ? settings.categories.find(c => c.id === field.value)?.name : "Select a category"}</span> </SelectTrigger> </FormControl> <SelectContent> {settings.categories.map(cat => ( <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="deadline" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Deadline</FormLabel> <Popover> <PopoverTrigger asChild><FormControl>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground' )}>
                    <div className="flex items-center justify-between w-full">
                        <span>{field.value ? format(field.value, 'PPP') : 'Pick a date'}</span>
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
              </FormControl></PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={date => date < new Date(new Date().setDate(new Date().getDate() -1))} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
            </div>
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 60"
                      type="text"
                      inputMode="numeric"
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const parsed = parseInt(value, 10);
                        if (value === '') {
                          field.onChange(undefined);
                        } else if (!isNaN(parsed) && parsed >= 0) {
                          field.onChange(parsed);
                        }
                      }}
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
                <FormLabel>Priority</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg">
                    <FormField control={form.control} name="priority.urgency" render={({ field }) => ( <FormItem> <FormLabel className="text-sm">Urgency ({field.value})</FormLabel> <FormControl> <Slider min={1} max={10} step={1} value={[field.value]} onValueChange={(value) => field.onChange(value[0])} /> </FormControl> </FormItem> )}/>
                    <FormField control={form.control} name="priority.importance" render={({ field }) => ( <FormItem> <FormLabel className="text-sm">Importance ({field.value})</FormLabel> <FormControl> <Slider min={1} max={10} step={1} value={[field.value]} onValueChange={(value) => field.onChange(value[0])} /> </FormControl> </FormItem> )}/>
                    <FormField control={form.control} name="priority.impact" render={({ field }) => ( <FormItem> <FormLabel className="text-sm">Impact ({field.value})</FormLabel> <FormControl> <Slider min={1} max={10} step={1} value={[field.value]} onValueChange={(value) => field.onChange(value[0])} /> </FormControl> </FormItem> )}/>
                </div>
            </div>
            
            <div className="space-y-2">
              <FormLabel>Attachments</FormLabel>
              
              {fileAttachments.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {fileAttachments.map((field) => (
                    <div key={field.id} className="relative group aspect-square border rounded-md flex items-center justify-center">
                       <button type="button" onClick={() => handleRemoveAttachment(field.id)} className="absolute -top-2 -right-2 z-10 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80 p-1 opacity-50 group-hover:opacity-100 transition-opacity">
                         <X className="h-3 w-3" />
                       </button>
                       {field.type === 'file' && field.fileType.startsWith('image/') ? (
                         <Image src={field.dataUri} alt={field.name} fill className="object-cover rounded-md" />
                       ) : (
                         <div className="flex flex-col items-center text-center p-1">
                           <FileIcon className="h-6 w-6 text-muted-foreground" />
                           <span className="text-xs text-muted-foreground mt-1 truncate">{field.name}</span>
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              )}

              {linkAttachments.length > 0 && (
                <div className="space-y-2 pt-2">
                    {linkAttachments.map((field) => (
                         <div key={field.id} className="flex items-center justify-between p-2 text-sm border rounded-md">
                           <a href={field.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline truncate">
                               <Link className="h-4 w-4 flex-shrink-0" />
                               <span className="truncate">{field.name}</span>
                           </a>
                           <button type="button" onClick={() => handleRemoveAttachment(field.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                               <X className="h-4 w-4" />
                           </button>
                         </div>
                    ))}
                </div>
              )}

              <div className="flex gap-2">
                <AddLinkPopover onAddLink={handleAddLink} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="mr-2 h-4 w-4" /> Upload File
                </Button>
                <Input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>
            </div>

            <DialogFooter className="sm:justify-between pt-4">
              <div>{taskToEdit && <Button type="button" variant="destructive" onClick={handleDelete}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}</div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit">{taskToEdit ? 'Save Changes' : 'Create Task'}</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
