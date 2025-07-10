
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
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const isEmailUser = user.providerData.some(p => p.providerId === 'password');
    if (isEmailUser && !user.emailVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(user.email!)}`);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
              <TasskoLogo className="h-16 w-16 animate-pulse" />
              <p className="text-muted-foreground">Verifying session...</p>
          </div>
       </div>
    );
  }

  // Final check to prevent flicker for unverified users
  const isEmailUser = user.providerData.some(p => p.providerId === 'password');
  if (isEmailUser && !user.emailVerified) {
     return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
              <TasskoLogo className="h-16 w-16 animate-pulse" />
              <p className="text-muted-foreground">Redirecting to verification...</p>
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
