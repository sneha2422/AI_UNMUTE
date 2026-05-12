// src/app/teacher/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, onSnapshot, query, orderBy, limit,
  serverTimestamp, doc, setDoc, deleteDoc, getDocs
} from 'firebase/firestore';
import { useSpeechCaption } from '@/hooks/useSpeechCaption';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { saveCaption, saveNotes } from '@/lib/offlineStorage';
import { TeacherNav } from '@/components/TeacherNav';

interface Question {
  id: string;
  text: string;
  studentName: string;
  type: 'text' | 'gesture';
  ts: any;
}

export default function TeacherPage() {
  const [sessionId, setSessionId] = useState('classroom-001');
  const [sessionActive, setSessionActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);

  const { transcript, isListening, fullNotes, startListening, stopListening } = useSpeechCaption();
  const { isOnline } = useOfflineSync();

  // Broadcast captions to Firebase
  useEffect(() => {
    if (!sessionActive || !transcript) return;
    const ref = doc(db, 'sessions', sessionId, 'captions', 'live');
    setDoc(ref, { text: transcript, ts: serverTimestamp() });

    if (!isOnline) saveCaption(sessionId, transcript);
  }, [transcript, sessionActive, sessionId, isOnline]);

  // Listen for student questions
  useEffect(() => {
    if (!sessionActive) return;
    const q = query(
      collection(db, 'sessions', sessionId, 'questions'),
      orderBy('ts', 'desc'),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      setQuestions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question)));
    });
    return unsub;
  }, [sessionActive, sessionId]);

  // Check for Web Speech API support on mount
  useEffect(() => {
    const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setIsBrowserSupported(supported);
  }, []);

  const startSession = () => {
    setSessionActive(true);
    startListening();
  };

  const endSession = async () => {
    stopListening();
    // Save notes to Firebase
    if (fullNotes.length > 0) {
      await setDoc(doc(db, 'sessions', sessionId, 'notes', 'lecture'), {
        lines: fullNotes,
        ts: serverTimestamp(),
        teacherName,
      });
      await saveNotes(sessionId, fullNotes);
    }
    // Clear live caption
    await deleteDoc(doc(db, 'sessions', sessionId, 'captions', 'live')).catch(() => {});
    setSessionActive(false);
    setSavedMsg(`✅ Notes saved! ${fullNotes.length} lines.`);
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const dismissQuestion = async (qId: string) => {
    await deleteDoc(doc(db, 'sessions', sessionId, 'questions', qId));
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {!isBrowserSupported && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
          <div className="bg-gray-900 border border-yellow-600 rounded-2xl max-w-lg w-full p-8 text-center">
            <h2 className="text-2xl font-bold text-yellow-300 mb-3">Browser Not Supported</h2>
            <p className="text-gray-300">
              The live captioning feature uses the Web Speech API, which is not available in your current browser.
            </p>
            <p className="text-gray-300 mt-4">
              For this feature to work, please use the latest version of{' '}
              <strong className="text-white">Google Chrome</strong> on a desktop computer.
            </p>
          </div>
        </div>
      )}

      <TeacherNav />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header row */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Teacher Dashboard</h1>
            <p className="text-gray-400 text-sm">Broadcast your voice. See student questions in real time.</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <input
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="Your name"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-32"
            />
            <input
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Class code"
              disabled={sessionActive}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-36 disabled:opacity-50"
            />
            {!sessionActive ? (
              <button
                onClick={startSession}
                className="bg-[#6C63FF] hover:bg-[#4B44CC] text-white font-bold px-6 py-2 rounded-xl transition"
              >
                ▶ Start Class
              </button>
            ) : (
              <button
                onClick={endSession}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-xl transition"
              >
                ⏹ End & Save
              </button>
            )}
          </div>
        </div>

        {savedMsg && (
          <div className="bg-green-900/40 border border-green-700 text-green-300 rounded-xl p-4 mb-6 text-center font-semibold">
            {savedMsg}
          </div>
        )}

        {!isOnline && sessionActive && (
          <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-300 rounded-xl p-3 mb-6 text-sm text-center">
            🟡 You are offline. Captions saved locally and will sync when internet returns.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live mic panel */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 pulse-ring' : 'bg-gray-600'}`} />
              <h2 className="font-bold text-lg text-white">
                {isListening ? 'Broadcasting…' : 'Microphone Off'}
              </h2>
              <span className="ml-auto text-xs text-gray-500">Session: {sessionId}</span>
            </div>

            <div className="bg-black/30 rounded-xl p-4 min-h-[100px] mb-4">
              {transcript ? (
                <p className="text-white text-lg">{transcript}</p>
              ) : (
                <p className="text-gray-500">
                  {sessionActive ? 'Speak into your microphone…' : 'Press "Start Class" to begin captioning.'}
                </p>
              )}
            </div>

            <div className="text-sm text-gray-400">
              <span className="font-semibold text-[#6C63FF]">{fullNotes.length}</span> sentences captured
            </div>
          </div>

          {/* Notes preview */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold text-lg text-white mb-4">📝 Live Notes</h2>
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {fullNotes.length === 0 ? (
                <p className="text-gray-600 text-sm">Notes appear here as you speak…</p>
              ) : (
                fullNotes.slice(-10).map((line, i) => (
                  <p key={i} className="text-gray-300 text-sm leading-relaxed border-l-2 border-[#6C63FF]/40 pl-3">
                    {line}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Student questions */}
        <div className="mt-6 glass rounded-2xl p-6">
          <h2 className="font-bold text-xl text-white mb-4">
            💬 Student Questions
            {questions.length > 0 && (
              <span className="ml-2 bg-[#6C63FF] text-white text-xs px-2 py-0.5 rounded-full">
                {questions.length}
              </span>
            )}
          </h2>

          {questions.length === 0 ? (
            <p className="text-gray-600">No questions yet. Students can type or use sign language.</p>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id} className="bg-gray-800/60 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl">{q.type === 'gesture' ? '✋' : '💬'}</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">{q.studentName || 'Anonymous'}</div>
                    <div className="text-white">{q.text}</div>
                  </div>
                  <button
                    onClick={() => dismissQuestion(q.id)}
                    className="text-gray-600 hover:text-red-400 text-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
