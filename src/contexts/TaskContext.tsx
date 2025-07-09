"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, Settings, SwimlaneId, Category, DEFAULT_CATEGORIES, Attachment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getTaskCategory } from '@/app/actions';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, setDoc, getDoc, writeBatch, query } from 'firebase/firestore';

interface TaskContextType {
  tasks: Task[];
  settings: Settings;
  isLoading: boolean;
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'isDaily' | 'swimlane'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newSwimlane: SwimlaneId, newIndex: number) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (categoryId: string, updates: Partial<Category>) => void;
  deleteCategory: (categoryId: string) => void;
  importData: (data: string) => Promise<void>;
  exportData: () => string;
  categorizeTask: (taskId: string) => Promise<void>;
  clearDailyTasks: () => void;
  moveFromGeneralToDaily: (taskId: string) => void;
}

const defaultSettings: Settings = {
  priorityWeights: { urgency: 1, importance: 1, impact: 1, deadline: 1 },
  swimlaneTimes: {
    Morning: { start: 7, end: 12 },
    Midday: { start: 12, end: 16 },
    Evening: { start: 18, end: 24 },
  },
  categories: DEFAULT_CATEGORIES,
  tags: ['Work', 'Personal', 'Urgent'],
  timezones: [{ id: 'local', name: 'Local Time' }],
  soundEnabled: true,
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      
      const settingsRef = doc(db, 'users', user.uid);
      const settingsUnsub = onSnapshot(settingsRef, async (docSnap) => {
        if (docSnap.exists() && docSnap.data().settings) {
          setSettings(docSnap.data().settings);
        } else {
          await setDoc(settingsRef, { settings: defaultSettings }, { merge: true });
          setSettings(defaultSettings);
        }
      });
      
      const tasksQuery = query(collection(db, 'users', user.uid, 'tasks'));
      const tasksUnsub = onSnapshot(tasksQuery, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksData);
        setIsLoading(false);
      }, (error) => {
          console.error("Error fetching tasks:", error);
          setIsLoading(false);
      });

      return () => {
        settingsUnsub();
        tasksUnsub();
      };

    } else {
      // No user, clear data
      setTasks([]);
      setSettings(defaultSettings);
      setIsLoading(false);
    }
  }, [user]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'isDaily' | 'swimlane' | 'priority'> & { priority?: Partial<Task['priority']> }) => {
    if (!user) return;
    const newTask: Omit<Task, 'id'> = {
      ...taskData,
      createdAt: new Date().toISOString(),
      status: 'todo',
      isDaily: false,
      swimlane: 'Morning',
      priority: {
        urgency: taskData.priority?.urgency ?? 5,
        importance: taskData.priority?.importance ?? 5,
        impact: taskData.priority?.impact ?? 5,
      },
    };
    await addDoc(collection(db, 'users', user.uid, 'tasks'), newTask);
    toast({ title: "Task Created", description: `"${newTask.title}" has been added.` });
  }, [user, toast]);
  
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    await updateDoc(taskRef, updates);
  }, [user]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!user) return;
    const taskToDelete = tasks.find(t => t.id === taskId);
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    await deleteDoc(taskRef);
    if (taskToDelete) {
      toast({ title: "Task Deleted", description: `"${taskToDelete.title}" has been removed.`, variant: 'destructive' });
    }
  }, [user, tasks, toast]);

  const moveTask = useCallback(async (taskId: string, newSwimlane: SwimlaneId) => {
    if (!user) return;
    await updateTask(taskId, { swimlane: newSwimlane });
  }, [user, updateTask]);
  
  const moveFromGeneralToDaily = useCallback(async (taskId: string) => {
    if (!user) return;
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await updateTask(taskId, { isDaily: true, swimlane: 'Morning' });
      toast({
        title: 'Task Added to Daily Board',
        description: `"${task.title}" is now on your daily plan.`,
      });
    }
  }, [user, tasks, toast, updateTask]);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    if (!user) return;
    const newFullSettings = { ...settings, ...newSettings };
    const userSettingsRef = doc(db, 'users', user.uid);
    await setDoc(userSettingsRef, { settings: newFullSettings }, { merge: true });
    toast({ title: "Settings Updated" });
  }, [user, settings, toast]);
  
  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    if (!user) return;
    const newCategory = { ...category, id: doc(collection(db, 'tmp')).id }; // local unique id
    await updateSettings({ categories: [...settings.categories, newCategory] });
  }, [user, settings.categories, updateSettings]);

  const updateCategory = useCallback(async (categoryId: string, updates: Partial<Category>) => {
    if (!user) return;
    const newCategories = settings.categories.map(c => c.id === categoryId ? { ...c, ...updates } : c);
    await updateSettings({ categories: newCategories });
  }, [user, settings.categories, updateSettings]);
  
  const deleteCategory = useCallback(async (categoryId: string) => {
    if (!user) return;
    if (tasks.some(t => t.categoryId === categoryId)) {
      toast({ title: "Cannot Delete Category", description: "Please reassign tasks from this category before deleting it.", variant: "destructive" });
      return;
    }
    if (settings.categories.length <= 1) {
      toast({ title: "Cannot Delete Category", description: "You must have at least one category.", variant: "destructive" });
      return;
    }
    const newCategories = settings.categories.filter(c => c.id !== categoryId);
    await updateSettings({ categories: newCategories });
  }, [user, tasks, settings.categories, toast, updateSettings]);

  const importData = useCallback(async (dataString: string) => {
    if (!user) return;
    try {
      const data = JSON.parse(dataString);
      if (data.tasks && Array.isArray(data.tasks) && data.settings) {
        // This is a destructive operation.
        const batch = writeBatch(db);

        // Delete all existing tasks for the user
        tasks.forEach(task => {
            const taskRef = doc(db, 'users', user.uid, 'tasks', task.id);
            batch.delete(taskRef);
        });

        // Add all imported tasks
        data.tasks.forEach((task: any) => {
            const { id, ...taskData } = task; // Exclude ID from data
            const newTaskRef = doc(collection(db, 'users', user.uid, 'tasks'));
            batch.set(newTaskRef, taskData);
        });
        
        // Update settings
        const settingsRef = doc(db, 'users', user.uid);
        batch.set(settingsRef, { settings: data.settings }, { merge: true });
        
        await batch.commit();

        toast({ title: "Success", description: "Data imported successfully." });
      } else {
        throw new Error("Invalid data format.");
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Import Failed", description: "The provided file is not valid.", variant: "destructive" });
    }
  }, [user, toast, tasks]);

  const exportData = useCallback(() => {
    return JSON.stringify({ tasks, settings }, null, 2);
  }, [tasks, settings]);

  const categorizeTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      const result = await getTaskCategory(task.description || task.title);
      if (result.success && result.swimlane) {
        await updateTask(taskId, { swimlane: result.swimlane });
        toast({ title: "AI Categorization", description: `Task moved to ${result.swimlane}.` });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: "AI Error", description: error.message, variant: "destructive" });
    }
  }, [tasks, updateTask, toast]);

    const clearDailyTasks = useCallback(async () => {
        if (!user) return;
        const batch = writeBatch(db);
        tasks.forEach(t => {
            if (t.isDaily) {
                const taskRef = doc(db, 'users', user.uid, 'tasks', t.id);
                if (t.status === 'completed') {
                    batch.update(taskRef, { isDaily: false });
                } else {
                    batch.update(taskRef, { isDaily: false, swimlane: 'Morning' });
                }
            }
        });
        await batch.commit();
        toast({ title: 'Daily Board Cleared', description: 'All daily tasks moved back to the general pool.' });
    }, [user, tasks, toast]);

  return (
    <TaskContext.Provider value={{
      tasks, settings, isLoading, addTask, updateTask, deleteTask, moveTask,
      updateSettings, addCategory, updateCategory, deleteCategory, importData, exportData, categorizeTask, clearDailyTasks, moveFromGeneralToDaily
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
