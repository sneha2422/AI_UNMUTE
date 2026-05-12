// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'UNMUTE — AI Accessibility Platform',
  description: 'Real-time speech-to-text, sign language, and learning tools for inclusive classrooms.',
  manifest: '/manifest.json',
  themeColor: '#6C63FF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><ServiceWorkerRegistrar />{children}</body>
    </html>
  );
}
