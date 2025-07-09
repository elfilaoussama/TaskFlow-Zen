
import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { TasskoLogo } from '@/components/TasskoLogo';

const APP_NAME = "Tassko";
const APP_DESCRIPTION = "The intelligent Kanban board and task manager designed to bring clarity and focus to your day. Leverage AI to automatically categorize tasks and analyze your productivity.";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | AI-Powered Kanban & Task Manager`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: ["Kanban board", "task management", "AI productivity", "daily planner", "to-do list", "Next.js", "Tassko"],
  authors: [{ name: "The Tassko Team", url: 'https://tassko.app' }],
  creator: "The Tassko Team",
  publisher: "The Tassko Team",
  metadataBase: new URL('https://tassko.app'),
  openGraph: {
    type: "website",
    url: "https://tassko.app",
    title: `${APP_NAME} | AI-Powered Kanban & Task Manager`,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [{
      url: "/tassko-og-image.png", // Assuming you'll add an OG image
      width: 1200,
      height: 630,
      alt: `The ${APP_NAME} logo on a dark background.`,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | AI-Powered Kanban & Task Manager`,
    description: APP_DESCRIPTION,
    images: ["/tassko-og-image.png"],
  },
  icons: {
    icon: "/tassko-glass.png",
    shortcut: "/tassko-glass.png",
    apple: "/tassko-glass.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Tassko",
            "operatingSystem": "WEB",
            "applicationCategory": "ProductivityApplication",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "120"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          }) }}
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
