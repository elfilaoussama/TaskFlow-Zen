
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import type { Metadata } from 'next';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, ScatterChart, Scatter, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ZAxis
} from 'recharts';
import { 
    parseISO, 
    format, 
    isToday, 
    isThisWeek, 
    isThisMonth, 
    getHours, 
    getDay, 
    getDate,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval
} from 'date-fns';
import { Task } from '@/lib/types';
import { calculatePriorityScore } from '@/lib/priority';

// This metadata would typically be in a `layout.tsx` or `page.tsx` at the root of the route segment
// but we place it here for simplicity in this file structure.
export const metadata: Metadata = {
  title: 'Productivity Analytics',
  description: 'Analyze your task completion trends, category distribution, and productivity patterns with detailed charts and graphs in TaskFlow Zen.',
};


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
    if (!isClient) return [];
    return settings.categories.map(cat => ({
        name: cat.name,
        count: tasks.filter(t => t.categoryId === cat.id).length,
        fill: cat.color
    }))
  }, [tasks, settings.categories, isClient]);

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
    if (!isClient) return [];
    
    let dataPoints: {date: string, 'Tasks Completed': number, 'Hours Worked': number}[] = [];

    const tasksInPeriod = completedTasks.filter(task => {
        const completedDate = parseISO(task.completedAt!);
        if (timeRange === 'daily') return isToday(completedDate);
        if (timeRange === 'weekly') return isThisWeek(completedDate, { weekStartsOn: 1 });
        if (timeRange === 'monthly') return isThisMonth(completedDate);
        return false;
    });

    switch(timeRange) {
        case 'daily': {
            const hourlyData = tasksInPeriod.reduce((acc, task) => {
                const hour = getHours(parseISO(task.completedAt!));
                if (!acc[hour]) acc[hour] = { tasks: 0, hours: 0 };
                acc[hour].tasks += 1;
                acc[hour].hours += (task.duration || 0) / 60;
                return acc;
            }, {} as Record<number, { tasks: number; hours: number }>);

            dataPoints = Array.from({ length: 24 }, (_, i) => {
                const data = hourlyData[i] || { tasks: 0, hours: 0 };
                return {
                    date: `${i}:00`,
                    'Tasks Completed': data.tasks,
                    'Hours Worked': parseFloat(data.hours.toFixed(2)),
                };
            });
            break;
        }
        case 'weekly': {
            const dailyData = tasksInPeriod.reduce((acc, task) => {
                const day = getDay(parseISO(task.completedAt!)); // 0 = Sun
                if (!acc[day]) acc[day] = { tasks: 0, hours: 0 };
                acc[day].tasks += 1;
                acc[day].hours += (task.duration || 0) / 60;
                return acc;
            }, {} as Record<number, { tasks: number; hours: number }>);
            
            const weekStart = startOfWeek(now, { weekStartsOn: 1 });
            dataPoints = eachDayOfInterval({ start: weekStart, end: endOfWeek(now, { weekStartsOn: 1 }) }).map(day => {
                const data = dailyData[getDay(day)] || { tasks: 0, hours: 0 };
                return {
                    date: format(day, 'E'),
                    'Tasks Completed': data.tasks,
                    'Hours Worked': parseFloat(data.hours.toFixed(2)),
                };
            });
            break;
        }
        case 'monthly': {
            const dailyData = tasksInPeriod.reduce((acc, task) => {
                const day = getDate(parseISO(task.completedAt!)); // 1-31
                if (!acc[day]) acc[day] = { tasks: 0, hours: 0 };
                acc[day].tasks += 1;
                acc[day].hours += (task.duration || 0) / 60;
                return acc;
            }, {} as Record<number, { tasks: number; hours: number }>);

            dataPoints = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) }).map(day => {
                const data = dailyData[getDate(day)] || { tasks: 0, hours: 0 };
                return {
                    date: format(day, 'd'),
                    'Tasks Completed': data.tasks,
                    'Hours Worked': parseFloat(data.hours.toFixed(2)),
                };
            });
            break;
        }
    }
    return dataPoints;

  }, [completedTasks, timeRange, isClient]);


  return (
    <main className="flex flex-col h-full p-4 md:p-6">
      <header className="pb-4 border-b">
        <h1 className="text-2xl font-bold font-headline">Analytics</h1>
        <p className="text-muted-foreground">Insights into your productivity.</p>
      </header>
      <div className="flex-1 overflow-y-auto pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            <Button variant={timeRange === 'daily' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTimeRange('daily')} className="h-7 px-3">Today</Button>
                            <Button variant={timeRange === 'weekly' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTimeRange('weekly')} className="h-7 px-3">This Week</Button>
                            <Button variant={timeRange === 'monthly' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTimeRange('monthly')} className="h-7 px-3">This Month</Button>
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
      </div>
    </main>
  );
}
