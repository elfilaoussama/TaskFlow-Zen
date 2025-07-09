
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Calendar, LayoutDashboard } from 'lucide-react';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Dashboard } from '@/components/stats/Dashboard';
import { UserNav } from './UserNav';
import { TasskoLogo } from '../TasskoLogo';

// This inner component can safely use the useSidebar hook
function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 transition-all duration-300">
                <TasskoLogo className="flex-shrink-0 h-8 w-8" />
                <h1 className="text-xl font-semibold font-headline whitespace-nowrap">Tassko</h1>
              </div>
              {/* This is the trigger for desktop, hidden on mobile */}
              <SidebarTrigger className="hidden md:flex" />
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
      <SidebarInset>
        {/* This header is only visible on mobile */}
        {isMobile && (
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
            <div className="flex items-center gap-2">
              <TasskoLogo className="h-8 w-8" />
              <h1 className="text-lg font-semibold font-headline">Tassko</h1>
            </div>
            {/* This is the trigger for mobile */}
            <SidebarTrigger />
          </header>
        )}
        {children}
      </SidebarInset>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellLayout>{children}</AppShellLayout>
    </SidebarProvider>
  );
}
