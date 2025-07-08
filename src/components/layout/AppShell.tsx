"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Calendar, LayoutDashboard, Settings, Upload, Download, BrainCircuit } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTaskContext } from '@/contexts/TaskContext';
import { Separator } from '@/components/ui/separator';
import { Dashboard } from '@/components/stats/Dashboard';
import { useSound } from '@/hooks/use-sound';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { importData, exportData } = useTaskContext();
  const playSound = useSound();

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taskflow-zen-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          const content = event.target?.result as string;
          importData(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarRail />
        <SidebarHeader>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 transition-all duration-300">
                <BrainCircuit className="text-primary flex-shrink-0" />
                <h1 className="text-xl font-semibold font-headline whitespace-nowrap">TaskFlow Zen</h1>
              </div>
              <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/">
                <SidebarMenuButton isActive={pathname === '/'} tooltip="General Tasks">
                  <LayoutDashboard />
                  General Tasks
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/daily">
                <SidebarMenuButton isActive={pathname === '/daily'} tooltip="Daily Kanban">
                  <Calendar />
                  Daily Kanban
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/analytics">
                <SidebarMenuButton isActive={pathname === '/analytics'} tooltip="Analytics">
                  <BarChart2 />
                  Analytics
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/settings">
                <SidebarMenuButton isActive={pathname === '/settings'} tooltip="Settings">
                  <Settings />
                  Settings
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>

          <Separator className="my-4" />
          
          <div className="px-4 text-sm font-medium text-muted-foreground mb-2 group-data-[collapsible=icon]:hidden">Dashboard</div>
          <div className="group-data-[collapsible=icon]:hidden">
            <Dashboard />
          </div>

        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col">
            <Button variant="outline" size="sm" onClick={handleImport} className="w-full"><Download className="mr-2 h-4 w-4" /> <span className="group-data-[collapsible=icon]:hidden">Import</span></Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="w-full"><Upload className="mr-2 h-4 w-4" /> <span className="group-data-[collapsible=icon]:hidden">Export</span></Button>
          </div>
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
