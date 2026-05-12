// src/components/StudentNav.tsx
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useOfflineSync } from '@/hooks/useOfflineSync';

const links = [
  { href: '/student', label: '📡 Live Captions' },
  { href: '/student/notes', label: '📚 My Notes' },
  { href: '/student/quiz', label: '✍️ Quiz' },
];

export function StudentNav() {
  const path = usePathname();
  const router = useRouter();
  const { isOnline } = useOfflineSync();

  return (
    <nav className="bg-[#0f0f1a] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
      <div className="flex gap-2">
        <button onClick={() => router.push('/')} className="text-gray-500 hover:text-white mr-4 text-sm">← Home</button>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${path === link.href ? 'bg-[#6C63FF] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className={`text-xs px-3 py-1 rounded-full ${isOnline ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>
        {isOnline ? '🟢 Online' : '🟡 Offline'}
      </div>
    </nav>
  );
}
