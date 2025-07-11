
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { GoogleIcon } from '@/components/auth/GoogleIcon';
import { useNotification } from '@/hooks/use-notification';
import { TasskoLogo } from '@/components/TasskoLogo';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, setFocus } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      if (!userCredential.user.emailVerified) {
        // This handles users who exist but haven't verified their email.
        await auth.signOut();
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        toast({
          title: 'Email Not Verified',
          description: 'Please check your email and verify your account before logging in.',
          variant: 'destructive',
        });
        addNotification({ message: 'Email Not Verified', description: 'Please verify your account first.', type: 'error' });
        return;
      }
      
      router.push('/');
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please try again or sign up.';
      }
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      addNotification({ message: 'Login Failed', description: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    try {
      // Use a temporary popup to get the user's email without signing them in yet
      const tempResult = await signInWithPopup(auth, provider);
      const email = tempResult.user.email;
      
      if (!email) {
          throw new Error("Could not retrieve email from Google account.");
      }
      
      // IMPORTANT: Sign out the temporary user immediately
      await auth.signOut();

      // Now, check the methods associated with the email
      const methods = await fetchSignInMethodsForEmail(auth, email);
      
      if (methods.length === 0) {
        // No account exists for this email
        toast({
          title: 'Account Not Found',
          description: 'No account found with this Google account. Please sign up first.',
          variant: 'destructive',
        });
        addNotification({ message: 'Account Not Found', description: 'Please sign up first.', type: 'error' });
        router.push('/signup');
        return;
      }

      if (methods.includes('password')) {
        // Account exists with a password. Guide user to log in with password.
        toast({
          title: 'Account Exists with Password',
          description: "This email is registered with a password. Please sign in below.",
          variant: 'destructive',
        });
        addNotification({ message: 'Account Exists', description: 'Please use your password to sign in.', type: 'error' });
        setValue('email', email);
        setFocus('password');
        return;
      }

      if (methods.includes('google.com')) {
        // Correct method, now perform the actual sign-in.
        await signInWithPopup(auth, provider);
        router.push('/');
      }
      
    } catch (error: any) {
        let title = 'Google Sign-In Failed';
        let description = 'An unexpected error occurred. Please try again.';

        if (error.code === 'auth/popup-closed-by-user') {
            title = 'Sign-In Cancelled';
            description = 'The sign-in window was closed before completion.';
        }
        
        toast({
            title: title,
            description: description,
            variant: 'destructive',
        });
        addNotification({ message: title, description: description, type: 'error' });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <TasskoLogo className="mx-auto h-12 w-12" />
        <CardTitle className="text-2xl">Welcome Back to Tassko</CardTitle>
        <CardDescription>Sign in to continue to your workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" {...register('email')} disabled={isLoading || isGoogleLoading} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} disabled={isLoading || isGoogleLoading} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <Separator className="my-6" />

        <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
              {isGoogleLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-current"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  Continue with Google
                </>
              )}
            </Button>
        </div>

        <div className="mt-6 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="underline text-primary">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
