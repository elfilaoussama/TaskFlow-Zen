
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { OnboardingGuide } from "@/components/layout/OnboardingGuide";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TasskoLogo } from "@/components/TasskoLogo";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, showOnboarding } = useAuth();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }
    
    const checkVerification = async (currentUser: User) => {
        setIsVerifying(true);
        // For Google users, email is considered verified.
        const isGoogleUser = currentUser.providerData.some(p => p.providerId === 'google.com');
        if (isGoogleUser) {
            setIsVerified(true);
            setIsVerifying(false);
            return;
        }

        // For email users, check our custom Firestore flag.
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().emailVerified) {
            setIsVerified(true);
        } else {
            setIsVerified(false);
            router.push(`/verify-email?email=${encodeURIComponent(currentUser.email!)}`);
        }
        setIsVerifying(false);
    }
    
    checkVerification(user);

  }, [user, isLoading, router]);
  
  const showLoadingState = isLoading || isVerifying || (user && !isVerified);

  if (showLoadingState) {
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
