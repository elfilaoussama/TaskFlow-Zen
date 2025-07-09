
"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogOut, Settings } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { useRouter } from "next/navigation";
import { NotificationBell } from "./NotificationBell";

export function UserNav() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return <ThemeToggle />;

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getInitials = (email: string) => {
    return email?.[0]?.toUpperCase() ?? 'U';
  }

  return (
    <div className="flex w-full items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
              <AvatarFallback>{getInitials(user.email!)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName ?? 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
         <NotificationBell />
         <ThemeToggle />
      </div>
    </div>
  )
}
