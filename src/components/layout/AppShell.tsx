"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Calendar, LayoutDashboard, Settings, BrainCircuit } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Dashboard } from '@/components/stats/Dashboard';
import { UserNav } from './UserNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarRail />
        <SidebarHeader>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 transition-all duration-300">
                <BrainCircuit className="text-primary flex-shrink-0" />
                <h1 className="text-xl font-semibold font-headline whitespace-nowrap">Tassko</h1>
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
          <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
