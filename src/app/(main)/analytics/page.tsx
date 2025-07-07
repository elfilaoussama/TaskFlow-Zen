"use client";

import React, { useMemo, useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, ScatterChart, Scatter, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ZAxis, Area, AreaChart
} from 'recharts';
import { parseISO, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subDays, isWithinInterval, startOfDay } from 'date-fns';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

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

type ViewMode = 'daily' | 'weekly' | 'monthly';

const ObjectiveProgressChart = () => {
  const { tasks, settings } = useTaskContext();
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  const progressData = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed' && t.completedAt);
    const today = startOfDay(new Date());

    let interval: { start: Date, end: Date };
    switch (viewMode) {
      case 'weekly':
        interval = { start: startOfWeek(today), end: endOfWeek(today) };
        break;
      case 'monthly':
        interval = { start: startOfMonth(today), end: endOfMonth(today) };
        break;
      case 'daily':
      default:
        interval = { start: subDays(today, 6), end: today };
        break;
    }

    const days = eachDayOfInterval(interval);

    return days.map(day => {
      const dayStr = format(day, 'MMM d');
      const tasksOnDay = completed.filter(t => {
        if (!t.completedAt) return false;
        const completedDate = startOfDay(parseISO(t.completedAt));
        return completedDate.getTime() === day.getTime();
      });
      
      const completedTasks = tasksOnDay.length;
      const completedHours = tasksOnDay.reduce((sum, task) => sum + (task.duration || 0), 0) / 60; // in hours

      return {
        date: dayStr,
        'Tasks Completed': completedTasks,
        'Hours Completed': parseFloat(completedHours.toFixed(2)),
        'Task Objective': settings.dailyObjectives.tasks,
        'Hours Objective': settings.dailyObjectives.hours,
      };
    });
  }, [tasks, settings.dailyObjectives, viewMode]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Objective Progress</CardTitle>
                <CardDescription>Your performance against your daily goals.</CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                <Button size="sm" variant={viewMode === 'daily' ? "secondary" : "ghost"} className="h-7" onClick={() => setViewMode('daily')}>Daily</Button>
                <Button size="sm" variant={viewMode === 'weekly' ? "secondary" : "ghost"} className="h-7" onClick={() => setViewMode('weekly')}>Weekly</Button>
                <Button size="sm" variant={viewMode === 'monthly' ? "secondary" : "ghost"} className="h-7" onClick={() => setViewMode('monthly')}>Monthly</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={progressData}>
            <defs>
              <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" stroke="hsl(var(--chart-1))" allowDecimals={false} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="Tasks Completed" yAxisId="left" stroke="hsl(var(--chart-1))" fill="url(#colorTasks)" />
            <Line type="monotone" dataKey="Task Objective" yAxisId="left" stroke="hsl(var(--chart-1))" strokeDasharray="5 5" dot={false} />
            <Area type="monotone" dataKey="Hours Completed" yAxisId="right" stroke="hsl(var(--chart-2))" fill="url(#colorHours)" />
            <Line type="monotone" dataKey="Hours Objective" yAxisId="right" stroke="hsl(var(--chart-2))" strokeDasharray="5 5" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const { tasks, settings } = useTaskContext();

  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'completed' && t.completedAt), [tasks]);
  
  const categoryDistribution = useMemo(() => {
    return settings.categories.map(cat => ({
        name: cat.name,
        count: tasks.filter(t => t.categoryId === cat.id).length,
        fill: cat.color
    }))
  }, [tasks, settings.categories]);

  const priorityVsDuration = useMemo(() => {
    return completedTasks.map(task => {
        const duration = (parseISO(task.completedAt!).getTime() - parseISO(task.createdAt).getTime()) / (1000 * 3600); // in hours
        return {
            priority: calculatePriorityScore(task, settings.priorityWeights),
            duration: parseFloat(duration.toFixed(2)),
            swimlane: task.swimlane
        }
    })
  }, [completedTasks, settings.priorityWeights]);


  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <header className="pb-4 border-b">
        <h1 className="text-2xl font-bold font-headline">Analytics</h1>
        <p className="text-muted-foreground">Insights into your productivity.</p>
      </header>
      <main className="flex-1 overflow-y-auto pt-6 grid grid-cols-1 gap-6">
        <ObjectiveProgressChart />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader><CardTitle>Category Distribution</CardTitle></CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" name="Task Count">
                                {categoryDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Priority vs. Completion Time (hours)</CardTitle></CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                            <CartesianGrid />
                            <XAxis type="number" dataKey="priority" name="Priority Score" />
                            <YAxis type="number" dataKey="duration" name="Duration (hrs)" />
                            <ZAxis type="category" dataKey="swimlane" name="Swimlane" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Legend />
                            <Scatter name="Morning" data={priorityVsDuration.filter(d => d.swimlane === 'Morning')} fill="hsl(var(--chart-1))" />
                            <Scatter name="Midday" data={priorityVsDuration.filter(d => d.swimlane === 'Midday')} fill="hsl(var(--chart-2))" />
                            <Scatter name="Evening" data={priorityVsDuration.filter(d => d.swimlane === 'Evening')} fill="hsl(var(--chart-3))" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
