"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, Settings, SwimlaneId } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { getTaskCategory } from '@/app/actions';

interface TaskContextType {
  tasks: Task[];
  settings: Settings;
  isLoading: boolean;
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'isDaily'>, board: 'general' | 'daily') => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newSwimlane: SwimlaneId, newIndex: number) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  importData: (data: string) => void;
  exportData: () => string;
  categorizeTask: (taskId: string) => Promise<void>;
  clearDailyTasks: () => void;
  moveFromGeneralToDaily: (taskId: string) => void;
}

const defaultSettings: Settings = {
  priorityWeights: { urgency: 1, importance: 1, impact: 1, deadline: 1 },
  tags: ['Work', 'Personal', 'Urgent'],
  timezones: [{ id: 'local', name: 'Local Time' }],
  soundEnabled: true,
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      const storedSettings = localStorage.getItem('settings');
      const lastResetDate = localStorage.getItem('lastDailyReset');
      const today = new Date().toISOString().split('T')[0];
      
      let loadedTasks = storedTasks ? JSON.parse(storedTasks) : [];
      if (lastResetDate !== today) {
        loadedTasks = loadedTasks.filter((t: Task) => !t.isDaily);
        localStorage.setItem('lastDailyReset', today);
      }

      setTasks(loadedTasks);
      if (storedSettings) setSettings(JSON.parse(storedSettings));

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({ title: "Error", description: "Could not load your data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('settings', JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'isDaily'>, board: 'general' | 'daily') => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      status: 'todo',
      isDaily: board === 'daily',
    };
    setTasks(prev => [...prev, newTask]);
    toast({ title: "Task Created", description: `"${newTask.title}" has been added.` });
  }, [toast]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (taskToDelete) {
      toast({ title: "Task Deleted", description: `"${taskToDelete.title}" has been removed.`, variant: 'destructive' });
    }
  }, [tasks, toast]);

  const moveTask = useCallback((taskId: string, newSwimlane: SwimlaneId, newIndex: number) => {
    setTasks(prevTasks => {
      const task = prevTasks.find(t => t.id === taskId);
      if (!task) return prevTasks;

      const filteredTasks = prevTasks.filter(t => t.id !== taskId);
      const tasksInNewSwimlane = filteredTasks.filter(t => t.swimlane === newSwimlane && t.isDaily === task.isDaily);
      
      const newTasks = [...filteredTasks];
      newTasks.splice(newIndex, 0, { ...task, swimlane: newSwimlane });
      return newTasks;
    });
  }, []);
  
  const moveFromGeneralToDaily = useCallback((taskId: string) => {
    setTasks(prevTasks => {
        const task = prevTasks.find(t => t.id === taskId && !t.isDaily);
        if (!task) {
            toast({ title: "Error", description: "Task not found in General board.", variant: "destructive" });
            return prevTasks;
        }

        const dailyTaskExists = prevTasks.some(t => t.id === taskId && t.isDaily);
        if (dailyTaskExists) {
            toast({ title: "Info", description: "Task is already on the Daily board." });
            return prevTasks;
        }

        const newDailyTask: Task = { ...task, isDaily: true };
        toast({ title: "Task Added to Daily Board", description: `"${task.title}" is now on your daily plan.` });
        return [...prevTasks, newDailyTask];
    });
}, [toast]);


  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    toast({ title: "Settings Updated" });
  }, [toast]);

  const importData = useCallback((dataString: string) => {
    try {
      const data = JSON.parse(dataString);
      if (data.tasks && data.settings) {
        setTasks(data.tasks);
        setSettings(data.settings);
        toast({ title: "Success", description: "Data imported successfully." });
      } else {
        throw new Error("Invalid data format.");
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Import Failed", description: "The provided file is not valid.", variant: "destructive" });
    }
  }, [toast]);

  const exportData = useCallback(() => {
    return JSON.stringify({ tasks, settings }, null, 2);
  }, [tasks, settings]);

  const categorizeTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      const result = await getTaskCategory(task.description);
      if (result.success && result.swimlane) {
        updateTask(taskId, { swimlane: result.swimlane });
        toast({ title: "AI Categorization", description: `Task moved to ${result.swimlane}.` });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: "AI Error", description: error.message, variant: "destructive" });
    }
  }, [tasks, updateTask, toast]);

    const clearDailyTasks = useCallback(() => {
        setTasks(prev => prev.filter(t => !t.isDaily));
        toast({ title: 'Daily Board Cleared', description: 'Ready for a new day!' });
    }, [toast]);

  return (
    <TaskContext.Provider value={{
      tasks, settings, isLoading, addTask, updateTask, deleteTask, moveTask,
      updateSettings, importData, exportData, categorizeTask, clearDailyTasks, moveFromGeneralToDaily
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
