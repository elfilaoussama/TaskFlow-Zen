"use client";

import React, { useMemo } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, ScatterChart, Scatter, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ZAxis
} from 'recharts';
import { parseISO, subDays, format, eachDayOfInterval, isSameDay } from 'date-fns';
import { Task } from '@/lib/types';

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

  const progressData = useMemo(() => {
    const last30Days = eachDayOfInterval({
        start: subDays(new Date(), 29),
        end: new Date()
    });
    
    return last30Days.map(day => {
        const tasksOnDay = completedTasks.filter(task => isSameDay(parseISO(task.completedAt!), day));
        const totalDuration = tasksOnDay.reduce((sum, task) => sum + (task.duration || 0), 0);
        return {
            date: format(day, 'MMM d'),
            'Tasks Completed': tasksOnDay.length,
            'Hours Worked': parseFloat((totalDuration / 60).toFixed(2)),
        }
    })
  }, [completedTasks]);


  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <header className="pb-4 border-b">
        <h1 className="text-2xl font-bold font-headline">Analytics</h1>
        <p className="text-muted-foreground">Insights into your productivity.</p>
      </header>
      <main className="flex-1 overflow-y-auto pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Progress (Last 30 Days)</CardTitle></CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" allowDecimals={false} />
                            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                            <Tooltip />
                            <Legend />
                            <Area yAxisId="left" type="monotone" dataKey="Tasks Completed" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
                            <Area yAxisId="right" type="monotone" dataKey="Hours Worked" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
      </main>
    </div>
  );
}
