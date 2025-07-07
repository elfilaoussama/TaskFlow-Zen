"use client";

import React, { useMemo } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, ScatterChart, Scatter, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ZAxis
} from 'recharts';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { SWIMLANES, Task } from '@/lib/types';

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

  const completionByDay = useMemo(() => {
    const counts: { [key: string]: number } = {};
    if (completedTasks.length === 0) return [];
    
    const dates = completedTasks.map(t => parseISO(t.completedAt!));
    const interval = eachDayOfInterval({ start: dates.sort()[0], end: new Date() });

    interval.forEach(day => counts[format(day, 'yyyy-MM-dd')] = 0);
    completedTasks.forEach(task => {
      const day = format(parseISO(task.completedAt!), 'yyyy-MM-dd');
      if(counts[day] !== undefined) counts[day]++;
    });

    return Object.entries(counts).map(([date, count]) => ({ date, count })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [completedTasks]);

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

  const swimlaneDistribution = useMemo(() => {
    return SWIMLANES.map(lane => ({
        name: lane,
        count: tasks.filter(t => t.swimlane === lane).length
    }))
  }, [tasks]);

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <header className="pb-4 border-b">
        <h1 className="text-2xl font-bold font-headline">Analytics</h1>
        <p className="text-muted-foreground">Insights into your productivity.</p>
      </header>
      <main className="flex-1 overflow-y-auto pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle>Task Completion Over Time</CardTitle></CardHeader>
            <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={completionByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" name="Completed Tasks" stroke="hsl(var(--primary))" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Swimlane Distribution</CardTitle></CardHeader>
            <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={swimlaneDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Task Count">
                            <Cell fill="hsl(var(--chart-1))" />
                            <Cell fill="hsl(var(--chart-2))" />
                            <Cell fill="hsl(var(--chart-3))" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Priority vs. Completion Time (hours)</CardTitle></CardHeader>
            <CardContent className="h-96">
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
      </main>
    </div>
  );
}
