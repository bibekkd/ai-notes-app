import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ThemeProvider } from "@/lib/providers/theme-provider"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Notes',
  description: 'A modern note-taking app with AI summarization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
        <QueryProvider>
          {children}
        </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}