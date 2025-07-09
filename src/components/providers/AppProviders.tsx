
"use client";

import { ThemeProvider } from 'next-themes';
import { TaskProvider } from '@/contexts/TaskContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

export function AppProviders({ children }: { children: React.Node }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <NotificationProvider>
            <TaskProvider>{children}</TaskProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
