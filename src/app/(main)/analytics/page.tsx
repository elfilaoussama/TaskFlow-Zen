"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, ScatterChart, Scatter, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ZAxis
} from 'recharts';
import { parseISO, subDays, format, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Task } from '@/lib/types';
import { calculatePriorityScore } from '@/lib/priority';

type TimeRange = 'daily' | 'weekly' | 'monthly';

export default function AnalyticsPage() {
  const { tasks, settings } = useTaskContext();
  const [isClient, setIsClient] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'completed' && t.completedAt), [tasks]);
  
  const categoryDistribution = useMemo(() => {
    return settings.categories.map(cat => ({
        name: cat.name,
        count: tasks.filter(t => t.categoryId === cat.id).length,
        fill: cat.color
    }))
  }, [tasks, settings.categories]);

  const priorityVsDuration = useMemo(() => {
    if (!isClient) return [];
    return completedTasks.map(task => {
        const duration = (parseISO(task.completedAt!).getTime() - parseISO(task.createdAt).getTime()) / (1000 * 3600); // in hours
        return {
            priority: calculatePriorityScore(task, settings.priorityWeights),
            duration: parseFloat(duration.toFixed(2)),
            swimlane: task.swimlane
        }
    })
  }, [completedTasks, settings.priorityWeights, isClient]);

  const progressData = useMemo(() => {
    const now = new Date();
    let interval;

    switch(timeRange) {
        case 'monthly':
            interval = { start: subDays(now, 365), end: now };
            break;
        case 'weekly':
            interval = { start: subDays(now, 90), end: now };
            break;
        case 'daily':
        default:
            interval = { start: subDays(now, 29), end: now };
            break;
    }

    const tasksInInterval = completedTasks.filter(task => {
        const completedDate = parseISO(task.completedAt!);
        return completedDate >= interval.start && completedDate <= interval.end;
    });

    const groupedData = tasksInInterval.reduce((acc, task) => {
        const completedDate = parseISO(task.completedAt!);
        let key = '';

        if (timeRange === 'daily') {
            key = format(completedDate, 'yyyy-MM-dd');
        } else if (timeRange === 'weekly') {
            key = format(startOfWeek(completedDate), 'yyyy-MM-dd');
        } else { // monthly
            key = format(startOfMonth(completedDate), 'yyyy-MM');
        }
        
        if (!acc[key]) {
            acc[key] = {
                'Tasks Completed': 0,
                'Hours Worked': 0,
            };
        }
        acc[key]['Tasks Completed'] += 1;
        acc[key]['Hours Worked'] += (task.duration || 0) / 60;

        return acc;
    }, {} as Record<string, { 'Tasks Completed': number; 'Hours Worked': number }>);
    
    return Object.entries(groupedData).map(([date, data]) => ({
        date: timeRange === 'monthly' ? format(parseISO(date), 'MMM yy') : format(parseISO(date), 'MMM d'),
        'Tasks Completed': data['Tasks Completed'],
        'Hours Worked': parseFloat(data['Hours Worked'].toFixed(2)),
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  }, [completedTasks, timeRange]);


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
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Progress</CardTitle>
                            <CardDescription>Your productivity over time.</CardDescription>
                        </div>
                        <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                            <Button variant={timeRange === 'daily' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTimeRange('daily')} className="h-7 px-3">Daily</Button>
                            <Button variant={timeRange === 'weekly' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTimeRange('weekly')} className="h-7 px-3">Weekly</Button>
                            <Button variant={timeRange === 'monthly' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTimeRange('monthly')} className="h-7 px-3">Monthly</Button>
                        </div>
                    </div>
                </CardHeader>
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
