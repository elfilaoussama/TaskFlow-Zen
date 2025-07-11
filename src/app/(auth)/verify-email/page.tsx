
"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, getDoc, updateDoc, query, where, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotification } from '@/hooks/use-notification';
import { MailCheck, RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';

const verificationSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d{6}$/, 'Code must only contain numbers'),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email: string, code: string, name: string): Promise<void> => {
  console.log(`Sending verification code to ${email} for ${name}.`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`Verification Code: ${code}`);
  }
};

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { addNotification } = useNotification();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const email = searchParams.get('email') || '';
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
  });
  const codeValue = watch('code');

  useEffect(() => {
    const timer = countdown > 0 && setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => {
      if(timer) clearTimeout(timer);
    };
  }, [countdown]);
  
  const findUserByEmail = async (emailToFind: string) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", emailToFind));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, data: userDoc.data() };
    }
    return null;
  };

  const onSubmit = async (data: VerificationFormValues) => {
    if (!email) return;

    setIsLoading(true);
    try {
      const user = await findUserByEmail(email);
      if (!user) throw new Error("User not found.");

      const userData = user.data;
      if (userData.verificationCode !== data.code) {
        toast({ title: 'Invalid Code', description: 'The verification code is incorrect.', variant: 'destructive' });
        return;
      }
      
      const expirationTime = userData.verificationCodeExpires?.toDate();
      if (!expirationTime || new Date() > expirationTime) {
        toast({ title: 'Code Expired', description: 'Please request a new code.', variant: 'destructive' });
        return;
      }

      await updateDoc(doc(db, 'users', user.id), {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
        verifiedAt: new Date(),
      });

      toast({ title: 'Email Verified!', description: 'You can now sign in.' });
      router.push('/login');

    } catch (error: any) {
      toast({ title: 'Verification Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || countdown > 0) return;

    setIsResending(true);
    try {
      const user = await findUserByEmail(email);
      if (!user) throw new Error("User not found.");

      const newCode = generateVerificationCode();
      const newExpiration = new Date(Date.now() + 10 * 60 * 1000);

      await updateDoc(doc(db, 'users', user.id), {
        verificationCode: newCode,
        verificationCodeExpires: newExpiration,
      });

      await sendVerificationEmail(email, newCode, user.data.name);

      toast({ title: 'Code Resent', description: 'A new code has been sent to your email.' });
      setCountdown(60);

    } catch (error: any) {
      toast({ title: 'Failed to Resend', description: error.message, variant: 'destructive' });
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <CardTitle className="text-2xl mt-4">Invalid Request</CardTitle>
                <CardDescription>
                    No email address was provided for verification.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => router.push('/signup')} className="w-full">
                    Return to Sign Up
                </Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <MailCheck className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="text-2xl mt-4">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a 6-digit code to{' '}
          <strong className="text-foreground">{email}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            {...register('code')}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="text-center text-2xl tracking-widest"
          />
          {errors.code && <p className="text-xs text-center text-destructive">{errors.code.message}</p>}
          <Button type="submit" className="w-full" disabled={isLoading || codeValue?.length !== 6}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
            Didn't receive it? Check spam or{' '}
             <Button
                variant="link"
                className="p-0 h-auto"
                onClick={handleResendCode}
                disabled={isResending || countdown > 0}
            >
                {isResending ? 'Resending...' : (countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code')}
            </Button>
        </div>
        <div className="mt-4 text-center">
            <Link href="/login" className="text-sm underline">Back to Login</Link>
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
