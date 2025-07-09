import type React from 'react';

export const TasskoLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 128 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="128" height="128" rx="32" fill="currentColor" />
    <path d="M32 48H96" stroke="hsl(var(--primary-foreground))" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M64 48V96" stroke="hsl(var(--primary-foreground))" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
