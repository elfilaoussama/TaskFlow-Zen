
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { sendEmailVerification, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TasskoLogo } from '@/components/TasskoLogo';
import { MailCheck } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    
    // Check auth state to find the user to send verification email to.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if(user) {
            setCurrentUser(user);
            // If user is already verified (e.g. they verified then came back to this page)
            if(user.emailVerified) {
                router.push('/');
            }
        }
    });

    return () => unsubscribe();
  }, [searchParams, router]);

  const handleResendEmail = async () => {
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'Could not find user to send verification to. Please log in again.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    setIsResending(true);
    try {
      await sendEmailVerification(currentUser);
      toast({
        title: 'Verification Email Resent',
        description: `A new verification email has been sent to ${email}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error Sending Email',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = async () => {
      if(currentUser) {
        await signOut(auth);
      }
      router.push('/login');
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <MailCheck className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="text-2xl mt-4">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification link to{' '}
          <strong className="text-foreground">{email}</strong>. Please check your
          inbox and click the link to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Didn't receive the email? Check your spam folder or click below to resend.
        </p>
        <Button
          onClick={handleResendEmail}
          className="w-full"
          disabled={isResending}
        >
          {isResending ? 'Resending...' : 'Resend Verification Email'}
        </Button>
        <div className="text-center text-sm">
            <Button variant="link" onClick={handleGoToLogin}>
              Back to Login
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}
