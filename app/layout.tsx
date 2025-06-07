import { Navbar } from '@/components/navbar';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/lib/theme-provider';
import { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Metadachi - Never Forget What You Never Read',
  description:
    'AI-powered knowledge management that helps you extract, organize, and leverage insights from your content. Stop pretending you read that whole thing.',
  keywords: [
    'AI',
    'knowledge management',
    'content organization',
    'research tool',
    'productivity',
    'learning',
  ],
  authors: [{ name: 'Metadachi' }],
  openGraph: {
    title: 'Metadachi - Never Forget What You Never Read',
    description:
      'AI-powered knowledge management that helps you extract, organize, and leverage insights from your content.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Metadachi - Never Forget What You Never Read',
    description:
      'AI-powered knowledge management that helps you extract, organize, and leverage insights from your content.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
