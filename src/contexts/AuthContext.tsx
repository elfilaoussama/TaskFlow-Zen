"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FirebaseNotConfigured = () => (
    <div className="flex items-center justify-center h-screen w-screen bg-background p-8">
        <Alert variant="destructive" className="max-w-2xl">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Firebase Not Configured</AlertTitle>
            <AlertDescription>
                <p className="mb-4">Your application is missing the required Firebase environment variables. Please create a <code>.env</code> file in the root of your project and add your Firebase project credentials.</p>
                <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
                    <code>
                        {`
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
                        `.trim()}
                    </code>
                </pre>
                <p className="mt-4">You can find these values in your Firebase project console settings.</p>
            </AlertDescription>
        </Alert>
    </div>
)


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
        setIsLoading(false);
    }
  }, []);
  
  if (!isFirebaseConfigured) {
    return <FirebaseNotConfigured />;
  }

  const value = { user, isLoading };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
         <div className="flex items-center justify-center h-screen w-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <p className="text-xl font-semibold text-primary">Tassko</p>
                <Skeleton className="h-12 w-12 rounded-full" />
                <p className="text-muted-foreground">Loading your workspace...</p>
            </div>
         </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
