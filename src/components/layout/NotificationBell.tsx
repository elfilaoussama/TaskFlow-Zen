
"use client";

import React from 'react';
import { Bell, CheckCheck, Trash2, Info, XCircle, CheckCircle } from 'lucide-react';
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
import { Separator } from '../ui/separator';

const NOTIFICATION_ICONS = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications, deleteNotification } = useNotification();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute top-1 right-1 flex h-2 w-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
            </div>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
            <h4 className="font-medium text-lg">Notifications</h4>
            {unreadCount > 0 ? (
                 <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <CheckCheck className="mr-2 h-4 w-4"/>
                    Mark all as read
                </Button>
            ) : notifications.length > 0 ? (
                 <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                    <Trash2 className="mr-2 h-4 w-4"/>
                    Clear all
                </Button>
            ) : null}
        </div>
        <ScrollArea className="h-96">
            {notifications.length > 0 ? (
                 <div className="flex flex-col">
                    {notifications.map((n, index) => (
                        <React.Fragment key={n.id}>
                            <div className={cn(
                                "p-4 flex items-start gap-4 group hover:bg-accent/50 transition-colors", 
                                n.read && "opacity-70"
                            )}>
                                {!n.read && <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500"></div>}
                                <div className={cn("mt-1", n.read && "ml-4")}>{NOTIFICATION_ICONS[n.type]}</div>
                                <div className="flex-1">
                                   <p className={cn("font-semibold text-sm leading-tight", !n.read && "font-bold")}>{n.message}</p>
                                   {n.description && <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>}
                                   <p className="text-xs text-muted-foreground mt-1.5">
                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                   </p>
                                </div>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.read && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(n.id)} title="Mark as read">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteNotification(n.id)} title="Delete notification">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                            {index < notifications.length - 1 && <Separator />}
                        </React.Fragment>
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
