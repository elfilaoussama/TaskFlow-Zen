
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { OnboardingGuide } from "@/components/layout/OnboardingGuide";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TasskoLogo } from "@/components/TasskoLogo";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, showOnboarding } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    // This loading state is shown while auth state is being checked.
    // The main app loader is in AuthProvider for the initial load.
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
              <TasskoLogo className="h-16 w-16 animate-pulse" />
              <p className="text-muted-foreground">Verifying session...</p>
          </div>
       </div>
    );
  }

  return (
    <AppShell>
      {children}
      {showOnboarding && <OnboardingGuide />}
    </AppShell>
  );
}
