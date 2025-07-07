"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '../ui/skeleton';

export function Dashboard() {
  const { tasks, isLoading } = useTaskContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const stats = useMemo(() => {
    const todoInPool = tasks.filter(t => !t.isDaily && t.status === 'todo').length;
    const dailyTasks = tasks.filter(t => t.isDaily && t.status === 'todo').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    
    return {
      todoInPool,
      dailyTasks,
      completedTasks,
      totalTasks: tasks.length
    };
  }, [tasks]);

  const chartData = useMemo(() => {
    return [
      { name: 'In Pool', value: stats.todoInPool, fill: 'hsl(var(--chart-1))' },
      { name: 'For Today', value: stats.dailyTasks, fill: 'hsl(var(--chart-2))' },
      { name: 'Completed', value: stats.completedTasks, fill: 'hsl(var(--chart-3))' },
    ].filter(d => d.value > 0);
  }, [stats]);

  if (isLoading) {
    return (
        <div className="px-4 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
                {[1,2,3].map(i => <Skeleton key={i} className="h-10" />)}
            </div>
            <div className="h-28 flex justify-center items-center">
                <Skeleton className="h-24 w-24 rounded-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="px-4 space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
            <div>
                <p className="text-2xl font-bold">{stats.todoInPool}</p>
                <p className="text-xs text-muted-foreground">In Pool</p>
            </div>
            <div>
                <p className="text-2xl font-bold">{stats.dailyTasks}</p>
                <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <div>
                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                <p className="text-xs text-muted-foreground">Done</p>
            </div>
        </div>
        <div className="h-28">
            {isClient && (
              <ResponsiveContainer width="100%" height="100%">
                  {stats.totalTasks > 0 ? (
                      <PieChart>
                          <Pie 
                              data={chartData} 
                              dataKey="value" 
                              nameKey="name" 
                              cx="50%" 
                              cy="50%" 
                              innerRadius={30} 
                              outerRadius={45} 
                              paddingAngle={chartData.length > 1 ? 5 : 0} 
                              stroke="hsl(var(--background))"
                              strokeWidth={2}
                          >
                          {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                          </Pie>
                          <Tooltip
                              contentStyle={{
                                  background: "hsl(var(--background))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "var(--radius)",
                                  fontSize: '12px',
                                  padding: '4px 8px',
                              }}
                          />
                      </PieChart>
                  ) : (
                      <div className="flex items-center justify-center h-full text-center text-xs text-muted-foreground">
                          No tasks yet.
                      </div>
                  )}
              </ResponsiveContainer>
            )}
        </div>
    </div>
  );
}
