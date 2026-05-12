// src/app/page.tsx
'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e] px-4">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl">🔇→🔊</span>
        </div>
        <h1 className="text-6xl font-black tracking-tight mb-3">
          <span className="text-white">UN</span>
          <span className="text-[#6C63FF]">MUTE</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-lg">
          AI-powered real-time communication for students with hearing and speech disabilities.
        </p>
        <div className="flex gap-3 justify-center mt-4 text-sm text-gray-500">
          <span className="glass px-3 py-1 rounded-full">🎤 Speech-to-Text</span>
          <span className="glass px-3 py-1 rounded-full">✋ Sign Language</span>
          <span className="glass px-3 py-1 rounded-full">📡 Offline-First</span>
        </div>
      </div>

      {/* Role selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-2xl">
        <button
          onClick={() => router.push('/student')}
          className="group glass hover:bg-[#6C63FF]/20 hover:border-[#6C63FF]/50 transition-all duration-200 rounded-2xl p-8 text-center cursor-pointer"
        >
          <div className="text-5xl mb-3">🎓</div>
          <div className="text-xl font-bold text-white mb-1">Student</div>
          <div className="text-sm text-gray-400">See live captions, send questions, use sign language</div>
        </button>

        <button
          onClick={() => router.push('/teacher')}
          className="group glass hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-200 rounded-2xl p-8 text-center cursor-pointer"
        >
          <div className="text-5xl mb-3">👩‍🏫</div>
          <div className="text-xl font-bold text-white mb-1">Teacher</div>
          <div className="text-sm text-gray-400">Broadcast voice, view student questions, save notes</div>
        </button>

        <button
          onClick={() => router.push('/admin')}
          className="group glass hover:bg-purple-500/20 hover:border-purple-500/50 transition-all duration-200 rounded-2xl p-8 text-center cursor-pointer"
        >
          <div className="text-5xl mb-3">⚙️</div>
          <div className="text-xl font-bold text-white mb-1">Admin</div>
          <div className="text-sm text-gray-400">Analytics, session management, user overview</div>
        </button>
      </div>

      <p className="mt-10 text-gray-600 text-sm">
        Team INSYNC • HopeWorks × AI4India Hackathon
      </p>
    </div>
  );
}
