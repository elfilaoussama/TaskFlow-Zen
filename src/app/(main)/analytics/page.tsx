"use client";

import React, { useMemo, useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, ScatterChart, Scatter, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ZAxis, ReferenceLine
} from 'recharts';
import {
  eachDayOfInterval, format, parseISO, startOfWeek, endOfWeek, eachWeekOfInterval,
  getWeek, startOfMonth, endOfMonth, eachMonthOfInterval, getMonth, subDays, subWeeks, subMonths, isWithinInterval
} from 'date-fns';
import { Task } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/80 border rounded-md shadow-lg backdrop-blur-sm">
          <p className="font-bold">{label}</p>
          <p className="text-sm text-blue-500">{`Tasks: ${payload[0].value}`}</p>
          <p className="text-sm text-green-500">{`Hours: ${payload[1].value}`}</p>
        </div>
      );
    }
    return null;
  };

export default function AnalyticsPage() {
  const { tasks, settings } = useTaskContext();
  const [objectiveTimeframe, setObjectiveTimeframe] = useState('daily');

  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'completed' && t.completedAt), [tasks]);

  const objectiveProgressData = useMemo(() => {
    const now = new Date();
    let interval;
    let dataGrouper;
    let labelFormatter;

    switch(objectiveTimeframe) {
      case 'weekly':
        interval = { start: subWeeks(now, 11), end: now }; // last 12 weeks
        dataGrouper = (date: Date) => `W${getWeek(date, { weekStartsOn: 1 })}`;
        labelFormatter = (date: Date) => `Week ${getWeek(date, { weekStartsOn: 1 })}`;
        break;
      case 'monthly':
        interval = { start: subMonths(now, 11), end: now }; // last 12 months
        dataGrouper = (date: Date) => `${getMonth(date)}`;
        labelFormatter = (date: Date) => format(date, 'MMM yyyy');
        break;
      case 'daily':
      default:
        interval = { start: subDays(now, 29), end: now }; // last 30 days
        dataGrouper = (date: Date) => format(date, 'yyyy-MM-dd');
        labelFormatter = (date: Date) => format(date, 'MMM d');
    }

    const groupedData: { [key: string]: { tasks: number; hours: number } } = {};
    
    completedTasks.forEach(task => {
        const completedDate = parseISO(task.completedAt!);
        if (isWithinInterval(completedDate, interval)) {
            const groupKey = dataGrouper(completedDate);
            if (!groupedData[groupKey]) {
                groupedData[groupKey] = { tasks: 0, hours: 0 };
            }
            groupedData[groupKey].tasks += 1;
            groupedData[groupKey].hours += (task.duration || 0) / 60;
        }
    });

    let intervalPoints;
    if (objectiveTimeframe === 'weekly') {
        intervalPoints = eachWeekOfInterval(interval, { weekStartsOn: 1 });
    } else if (objectiveTimeframe === 'monthly') {
        intervalPoints = eachMonthOfInterval(interval);
    } else {
        intervalPoints = eachDayOfInterval(interval);
    }
    
    return intervalPoints.map(point => {
        const groupKey = dataGrouper(point);
        const data = groupedData[groupKey] || { tasks: 0, hours: 0 };
        return {
            name: labelFormatter(point),
            tasksCompleted: data.tasks,
            hoursCompleted: parseFloat(data.hours.toFixed(2)),
        }
    });

  }, [completedTasks, objectiveTimeframe]);
  
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
      <main className="flex-1 overflow-y-auto pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Objective Progress</CardTitle>
                <Tabs value={objectiveTimeframe} onValueChange={setObjectiveTimeframe} className="w-full pt-2">
                    <TabsList>
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={objectiveProgressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" label={{ value: 'Tasks', angle: -90, position: 'insideLeft' }} allowDecimals={false} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Hours', angle: -90, position: 'insideRight' }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <ReferenceLine yAxisId="left" y={settings.dailyObjective.tasks * (objectiveTimeframe === 'weekly' ? 7 : objectiveTimeframe === 'monthly' ? 30 : 1)} label="Task Goal" stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                        <ReferenceLine yAxisId="right" y={settings.dailyObjective.hours * (objectiveTimeframe === 'weekly' ? 7 : objectiveTimeframe === 'monthly' ? 30 : 1)} label="Hour Goal" stroke="hsl(var(--chart-2))" strokeDasharray="3 3" />
                        <Area yAxisId="left" type="monotone" dataKey="tasksCompleted" name="Tasks" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                        <Area yAxisId="right" type="monotone" dataKey="hoursCompleted" name="Hours" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        
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
      </main>
    </div>
  );
}
