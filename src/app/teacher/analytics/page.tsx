// src/app/teacher/analytics/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { TeacherNav } from '@/components/TeacherNav';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6C63FF', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock analytics for demo — in real app pull from Firebase
  const mockData = {
    weeklyQuestions: [
      { day: 'Mon', questions: 12, gestures: 4 },
      { day: 'Tue', questions: 8, gestures: 6 },
      { day: 'Wed', questions: 15, gestures: 9 },
      { day: 'Thu', questions: 6, gestures: 3 },
      { day: 'Fri', questions: 20, gestures: 11 },
    ],
    engagement: [
      { name: 'Text Questions', value: 61 },
      { name: 'Sign Gestures', value: 33 },
      { name: 'Quiz Attempts', value: 6 },
    ],
    quizScores: [
      { week: 'W1', avg: 62 },
      { week: 'W2', avg: 71 },
      { week: 'W3', avg: 68 },
      { week: 'W4', avg: 79 },
      { week: 'W5', avg: 84 },
    ],
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  const stats = [
    { label: 'Total Sessions', value: '28', icon: '📅' },
    { label: 'Questions Answered', value: '247', icon: '💬' },
    { label: 'Avg Quiz Score', value: '73%', icon: '✏️' },
    { label: 'Sign Gestures', value: '89', icon: '✋' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <TeacherNav />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-white mb-2">📊 Learning Analytics</h1>
        <p className="text-gray-400 mb-8">Track student engagement and progress across sessions.</p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-black text-white">{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Questions per day */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Questions This Week</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockData.weeklyQuestions}>
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} />
                <Bar dataKey="questions" fill="#6C63FF" radius={[4, 4, 0, 0]} name="Text" />
                <Bar dataKey="gestures" fill="#22c55e" radius={[4, 4, 0, 0]} name="Gestures" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement breakdown */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Engagement Breakdown</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={mockData.engagement} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {mockData.engagement.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Quiz trend */}
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <h2 className="font-bold text-white mb-4">Average Quiz Score Over Time</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockData.quizScores}>
                <XAxis dataKey="week" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[50, 100]} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8 }} />
                <Line type="monotone" dataKey="avg" stroke="#6C63FF" strokeWidth={3} dot={{ fill: '#6C63FF', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
