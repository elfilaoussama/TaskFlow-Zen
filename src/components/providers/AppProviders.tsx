"use client";

import { ThemeProvider } from 'next-themes';
import { TaskProvider } from '@/contexts/TaskContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TaskProvider>{children}</TaskProvider>
    </ThemeProvider>
  );
}
