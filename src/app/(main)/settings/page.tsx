"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTaskContext } from '@/contexts/TaskContext';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useSound } from '@/hooks/use-sound';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { HexColorPicker } from 'react-colorful';
import { Category, SwimlaneId, SWIMLANES } from '@/lib/types';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Invalid color format'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const CategoryDialog = ({
  isOpen,
  setIsOpen,
  categoryToEdit,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  categoryToEdit?: Category;
}) => {
  const { addCategory, updateCategory } = useTaskContext();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: categoryToEdit || { name: '', color: '#3b82f6' },
  });

  React.useEffect(() => {
    if (categoryToEdit) {
      form.reset(categoryToEdit);
    } else {
      form.reset({ name: '', color: '#3b82f6' });
    }
  }, [categoryToEdit, form, isOpen]);

  const onSubmit = (data: CategoryFormValues) => {
    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, data);
    } else {
      addCategory(data);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{categoryToEdit ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Marketing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Color</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center gap-4">
                      <HexColorPicker color={field.value} onChange={field.onChange} />
                      <Input value={field.value} onChange={field.onChange} className="w-32 text-center" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">{categoryToEdit ? 'Save Changes' : 'Create Category'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default function SettingsPage() {
  const { settings, updateSettings, deleteCategory } = useTaskContext();
  const playSound = useSound();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>(undefined);

  const handleWeightChange = (name: string, value: number[]) => {
    updateSettings({
      priorityWeights: { ...settings.priorityWeights, [name]: value[0] },
    });
  };
  
  const handleObjectiveChange = (name: 'tasks' | 'hours', value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
        updateSettings({
            dailyObjectives: { ...settings.dailyObjectives, [name]: numValue }
        })
    }
  }

  const handleSoundToggle = (enabled: boolean) => {
    updateSettings({ soundEnabled: enabled });
    if(enabled) playSound('add');
  };

  const handleAddNewCategory = () => {
    setCategoryToEdit(undefined);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    setIsCategoryDialogOpen(true);
  }

  const handleTimeChange = (swimlane: SwimlaneId, period: 'start' | 'end', value: string) => {
    const hour = parseInt(value, 10);
    if (isNaN(hour) || hour < 0 || hour > 24) return;

    updateSettings({
      swimlaneTimes: {
        ...settings.swimlaneTimes,
        [swimlane]: {
          ...settings.swimlaneTimes[swimlane],
          [period]: hour,
        },
      },
    });
  };

  return (
    <>
      <div className="flex flex-col h-full p-4 md:p-6">
        <header className="pb-4 border-b">
          <h1 className="text-2xl font-bold font-headline">Settings</h1>
          <p className="text-muted-foreground">Customize your TaskFlow Zen experience.</p>
        </header>
        <main className="flex-1 overflow-y-auto pt-6 space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Categories</CardTitle>
                            <CardDescription>Manage your task categories.</CardDescription>
                        </div>
                        <Button onClick={handleAddNewCategory}><PlusCircle /> Add New</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {settings.categories.map(category => (
                        <div key={category.id} className="flex items-center justify-between p-2 rounded-md border">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                                <span className="font-medium">{category.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCategory(category)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCategory(category.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Separator />
            
             <Card>
                <CardHeader>
                    <CardTitle>Daily Objectives</CardTitle>
                    <CardDescription>Set your daily goals to track in analytics.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="daily-tasks" className="w-40">Tasks to Complete</Label>
                        <Input id="daily-tasks" type="number" min="0"
                            value={settings.dailyObjectives.tasks}
                            onChange={(e) => handleObjectiveChange('tasks', e.target.value)}
                            className="w-24"
                        />
                    </div>
                     <div className="flex items-center gap-4">
                        <Label htmlFor="daily-hours" className="w-40">Hours of Work</Label>
                        <Input id="daily-hours" type="number" min="0"
                            value={settings.dailyObjectives.hours}
                            onChange={(e) => handleObjectiveChange('hours', e.target.value)}
                            className="w-24"
                        />
                    </div>
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Priority Weights</CardTitle>
                    <CardDescription>Adjust how task priority scores are calculated.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                    <div>
                        <Label htmlFor="urgency-slider">Urgency ({settings.priorityWeights.urgency})</Label>
                        <Slider id="urgency-slider" defaultValue={[settings.priorityWeights.urgency]} max={10} step={1} onValueChange={(v) => handleWeightChange('urgency', v)} />
                    </div>
                    <div>
                        <Label htmlFor="importance-slider">Importance ({settings.priorityWeights.importance})</Label>
                        <Slider id="importance-slider" defaultValue={[settings.priorityWeights.importance]} max={10} step={1} onValueChange={(v) => handleWeightChange('importance', v)} />
                    </div>
                    <div>
                        <Label htmlFor="impact-slider">Impact ({settings.priorityWeights.impact})</Label>
                        <Slider id="impact-slider" defaultValue={[settings.priorityWeights.impact]} max={10} step={1} onValueChange={(v) => handleWeightChange('impact', v)} />
                    </div>
                    <div>
                        <Label htmlFor="deadline-slider">Deadline Pressure ({settings.priorityWeights.deadline})</Label>
                        <Slider id="deadline-slider" defaultValue={[settings.priorityWeights.deadline]} max={10} step={1} onValueChange={(v) => handleWeightChange('deadline', v)} />
                    </div>
                </CardContent>
            </Card>
            
            <Separator />

             <Card>
                <CardHeader>
                    <CardTitle>Swimlane Timings</CardTitle>
                    <CardDescription>Set the start and end hours for your daily swimlanes (0-24h format).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(SWIMLANES).map(swimlane => (
                        <div key={swimlane} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                            <Label className="font-medium">{swimlane}</Label>
                            <div className="flex items-center gap-2">
                                <Label htmlFor={`${swimlane}-start`} className="text-sm">Start</Label>
                                <Input id={`${swimlane}-start`} type="number" min="0" max="24"
                                    value={settings.swimlaneTimes[swimlane].start}
                                    onChange={(e) => handleTimeChange(swimlane, 'start', e.target.value)}
                                    className="w-20"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor={`${swimlane}-end`} className="text-sm">End</Label>
                                <Input id={`${swimlane}-end`} type="number" min="0" max="24"
                                    value={settings.swimlaneTimes[swimlane].end}
                                    onChange={(e) => handleTimeChange(swimlane, 'end', e.target.value)}
                                    className="w-20"
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            
            <Separator />

             <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="sound-toggle" className="font-medium">Sound Effects</Label>
                        <Switch id="sound-toggle" checked={settings.soundEnabled} onCheckedChange={handleSoundToggle} />
                    </div>
                </CardContent>
            </Card>
        </main>
      </div>
      <CategoryDialog isOpen={isCategoryDialogOpen} setIsOpen={setIsCategoryDialogOpen} categoryToEdit={categoryToEdit} />
    </>
  );
}
