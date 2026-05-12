// src/app/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'quizResults'), orderBy('ts', 'desc'), limit(20));
        const snap = await getDocs(q);
        setQuizResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const stats = [
    { label: 'Active Sessions', value: '3', icon: '📡', color: 'text-green-400' },
    { label: 'Total Students', value: '47', icon: '🎓', color: 'text-blue-400' },
    { label: 'Quiz Results', value: quizResults.length.toString(), icon: '✏️', color: 'text-purple-400' },
    { label: 'Offline Saves', value: '12', icon: '💾', color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <nav className="bg-[#0f0f1a] border-b border-gray-800 px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.push('/')} className="text-gray-500 hover:text-white text-sm">← Home</button>
        <h1 className="text-white font-bold">⚙️ Admin Panel</h1>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-white mb-2">Admin Overview</h1>
        <p className="text-gray-400 mb-8">System-wide stats and session management.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: '🎤 Teacher View', href: '/teacher', color: 'bg-green-700 hover:bg-green-600' },
            { label: '🎓 Student View', href: '/student', color: 'bg-[#6C63FF] hover:bg-[#4B44CC]' },
            { label: '📊 Analytics', href: '/teacher/analytics', color: 'bg-purple-700 hover:bg-purple-600' },
          ].map((l) => (
            <button
              key={l.href}
              onClick={() => router.push(l.href)}
              className={`${l.color} text-white font-bold py-3 rounded-xl transition`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Quiz results table */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white text-xl mb-4">Recent Quiz Results</h2>
          {loading ? (
            <p className="text-gray-400">Loading…</p>
          ) : quizResults.length === 0 ? (
            <p className="text-gray-600">No quiz results yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left pb-3">Student</th>
                    <th className="text-left pb-3">Score</th>
                    <th className="text-left pb-3">%</th>
                    <th className="text-left pb-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {quizResults.map((r) => (
                    <tr key={r.id} className="text-gray-300">
                      <td className="py-3">{r.studentName}</td>
                      <td className="py-3">{r.score}/{r.total}</td>
                      <td className="py-3">
                        <span className={`font-bold ${r.score / r.total >= 0.8 ? 'text-green-400' : r.score / r.total >= 0.6 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {Math.round((r.score / r.total) * 100)}%
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">
                        {r.ts?.toDate ? r.ts.toDate().toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
