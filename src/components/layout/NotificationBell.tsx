
"use client";

import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotification } from '@/hooks/use-notification';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

export function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotification();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount}
            </div>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
            <h4 className="font-medium">Notifications</h4>
            {unreadCount > 0 && (
                 <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <CheckCheck className="mr-2 h-4 w-4"/>
                    Mark all as read
                </Button>
            )}
        </div>
        <ScrollArea className="h-96">
            {notifications.length > 0 ? (
                 <div className="divide-y">
                    {notifications.map(n => (
                        <div key={n.id} className={cn("p-3", !n.read && "bg-accent/50")}>
                           <p className="font-semibold text-sm">{n.message}</p>
                           {n.description && <p className="text-xs text-muted-foreground">{n.description}</p>}
                           <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                           </p>
                        </div>
                    ))}
                 </div>
            ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                    You have no new notifications.
                </div>
            )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
