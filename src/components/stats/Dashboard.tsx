"use client";

import React, { useMemo } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function Dashboard() {
  const { tasks, isLoading } = useTaskContext();

  const stats = useMemo(() => {
    const generalTasks = tasks.filter(t => !t.isDaily);
    const dailyTasks = tasks.filter(t => t.isDaily);
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
    
    return {
      totalTasks: generalTasks.length,
      dailyTasks: dailyTasks.length,
      completionRate: completionRate.toFixed(0),
    };
  }, [tasks]);

  const chartData = useMemo(() => {
    return [
      { name: 'Total', value: stats.totalTasks, fill: 'var(--color-chart-1)' },
      { name: 'Daily', value: stats.dailyTasks, fill: 'var(--color-chart-2)' },
      { name: 'Done %', value: parseFloat(stats.completionRate), fill: 'var(--color-chart-3)' },
    ];
  }, [stats]);

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading stats...</div>
  }

  return (
    <div className="px-4 space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
            <div>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
                <p className="text-xs text-muted-foreground">In Pool</p>
            </div>
            <div>
                <p className="text-2xl font-bold">{stats.dailyTasks}</p>
                <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <div>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">Done</p>
            </div>
        </div>
        <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                       {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                       ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
}
