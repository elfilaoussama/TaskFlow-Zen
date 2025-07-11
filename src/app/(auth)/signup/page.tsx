
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { GoogleIcon } from '@/components/auth/GoogleIcon';
import { useNotification } from '@/hooks/use-notification';
import { TasskoLogo } from '@/components/TasskoLogo';
import { doc, setDoc } from 'firebase/firestore';


const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email: string, code: string, name: string): Promise<void> => {
  console.log(`Sending verification code to ${email} for ${name}.`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`Verification Code: ${code}`);
  }
  // In a real app, you would have an API endpoint to send the email.
  // For this project, we'll log it to the console.
};

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, data.email);
      if (methods.length > 0) {
        toast({
          title: 'Account Exists',
          description: 'An account with this email already exists. Please log in instead.',
          variant: 'destructive',
        });
        addNotification({ message: 'Account Exists', description: 'Please log in instead.', type: 'error' });
        router.push('/login');
        return;
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.name });
      
      const verificationCode = generateVerificationCode();
      const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: data.email,
          name: data.name,
          emailVerified: false,
          verificationCode: verificationCode,
          verificationCodeExpires: expirationTime,
          createdAt: new Date(),
          authProvider: 'email',
      });

      await sendVerificationEmail(data.email, verificationCode, data.name);
      
      await auth.signOut();
      
      toast({
          title: 'Account Created',
          description: 'A verification code has been sent to your inbox.'
      });
      addNotification({ message: 'Verification Code Sent', description: 'Check your inbox to continue.', type: 'info' });

      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);

    } catch (error: any) {
      const errorMessage = 'An unexpected error occurred during sign-up. Please try again.';
      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      addNotification({ message: 'Sign Up Failed', description: errorMessage, type: 'error' });
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
      const userId = tempResult.user.uid;
      const displayName = tempResult.user.displayName;

      if (!email) {
          throw new Error("Could not retrieve email from Google account.");
      }
      
      // IMPORTANT: Sign out the temporary user immediately
      await auth.signOut();

      // Now, check if an account already exists with this email.
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.length > 0) {
          // Account already exists.
          toast({
              title: 'Account Exists',
              description: "An account with this email already exists. Please sign in.",
              variant: 'destructive',
          });
          addNotification({ message: 'Account Exists', description: 'Please use the sign-in page.', type: 'error' });
          router.push('/login');
          return;
      }
      
      // Email is new, now we can safely perform the sign-up.
      const finalResult = await signInWithPopup(auth, provider);
      
      await setDoc(doc(db, 'users', finalResult.user.uid), {
          uid: finalResult.user.uid,
          email: finalResult.user.email,
          name: finalResult.user.displayName || 'Tassko User',
          emailVerified: true, // Google accounts are considered verified
          createdAt: new Date(),
          authProvider: 'google',
      });

      // The user is already logged in.
      router.push('/');

    } catch (error: any) {
        let title = `Google Sign-Up Failed`;
        let description = 'An unexpected error occurred. Please try again.';

        if (error.code === 'auth/popup-closed-by-user') {
            title = 'Sign-Up Cancelled';
            description = 'The sign-up window was closed before completion.';
        } else if (error.code === 'auth/account-exists-with-different-credential') {
             title = 'Account Exists';
             description = "An account with this email already exists. Please sign in using your original method.";
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
        <CardTitle className="text-2xl">Create a Tassko Account</CardTitle>
        <CardDescription>Start managing your tasks with ease.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" placeholder="Your Name" {...register('name')} disabled={isLoading || isGoogleLoading} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <Separator className="my-6" />

        <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                {isGoogleLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-current"></div>
                    <span>Continuing...</span>
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
          Already have an account?{' '}
          <Link href="/login" className="underline text-primary">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
