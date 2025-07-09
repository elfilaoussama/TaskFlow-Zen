"use client";

import { ThemeProvider } from 'next-themes';
import { TaskProvider } from '@/contexts/TaskContext';
import { AuthProvider } from '@/contexts/AuthContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TaskProvider>{children}</TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
