// src/app/student/notes/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { StudentNav } from '@/components/StudentNav';
import { getNotes } from '@/lib/offlineStorage';

export default function NotesPage() {
  const [sessionId, setSessionId] = useState('classroom-001');
  const [notes, setNotes] = useState<string[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [loading, setLoading] = useState(false);

  const loadNotes = async () => {
    setLoading(true);
    // Try Firebase first
    const ref = doc(db, 'sessions', sessionId, 'notes', 'lecture');
    const unsub = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setNotes(data.lines || []);
        setTeacherName(data.teacherName || '');
      } else {
        // Fallback to offline
        const offline = await getNotes(sessionId);
        if (offline) setNotes(offline.notes || []);
      }
      setLoading(false);
    });
    return unsub;
  };

  useEffect(() => { loadNotes(); }, [sessionId]);

  const downloadNotes = () => {
    const text = notes.map((n, i) => `${i + 1}. ${n}`).join('\n');
    const blob = new Blob([`UNMUTE Lecture Notes\nSession: ${sessionId}\n\n${text}`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `notes-${sessionId}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <StudentNav />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white">📚 Lecture Notes</h1>
            {teacherName && <p className="text-gray-400 text-sm">by {teacherName}</p>}
          </div>
          <div className="flex gap-3">
            <input
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Class code"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-40"
            />
            {notes.length > 0 && (
              <button
                onClick={downloadNotes}
                className="bg-[#6C63FF] hover:bg-[#4B44CC] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                ⬇ Download
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="glass rounded-2xl p-8 text-center text-gray-400">Loading notes…</div>
        ) : notes.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-400">No notes found for this session yet.</p>
            <p className="text-gray-600 text-sm mt-2">Notes are saved when the teacher ends the class.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 space-y-3">
            {notes.map((line, i) => (
              <div key={i} className="flex gap-3 border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                <span className="text-[#6C63FF] font-bold text-sm w-6 shrink-0">{i + 1}</span>
                <p className="text-gray-200 text-sm leading-relaxed">{line}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
