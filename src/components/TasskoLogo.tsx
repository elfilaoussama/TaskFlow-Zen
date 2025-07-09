
import type React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// This component wraps the Next.js Image component to use the tassko.png from the public folder.
// The parent element MUST provide the size for the logo (e.g., by setting h-12 w-12).
export const TasskoLogo = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("relative", className)} {...props}>
    <Image
      src="/tassko-glass.png"
      alt="Tassko Logo"
      fill
      className="object-contain"
    />
  </div>
);
