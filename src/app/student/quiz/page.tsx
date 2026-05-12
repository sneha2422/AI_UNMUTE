// src/app/student/quiz/page.tsx
'use client';
import { useState } from 'react';
import { StudentNav } from '@/components/StudentNav';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const QUIZ_QUESTIONS = [
  {
    q: 'What does the UNMUTE app primarily help with?',
    options: ['Entertainment', 'Communication accessibility', 'Social media', 'Gaming'],
    correct: 1,
  },
  {
    q: 'Which AI technology is used for sign language detection?',
    options: ['GPT-4', 'TensorFlow.js + MediaPipe', 'Stable Diffusion', 'BERT'],
    correct: 1,
  },
  {
    q: 'What is the main benefit of offline-first design?',
    options: ['Faster UI', 'Works without internet in rural schools', 'Better graphics', 'Lower cost'],
    correct: 1,
  },
  {
    q: 'Which browser is required for speech recognition?',
    options: ['Firefox', 'Safari', 'Google Chrome', 'Edge'],
    correct: 2,
  },
  {
    q: 'Where is student lecture data stored?',
    options: ['MongoDB', 'MySQL', 'Firebase Firestore', 'PostgreSQL'],
    correct: 2,
  },
];

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [studentName] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('unmute-name') || 'Student' : 'Student'
  );

  const q = QUIZ_QUESTIONS[current];
  const score = answers.filter(Boolean).length;

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
  };

  const next = async () => {
    const correct = selected === q.correct;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);

    if (current + 1 >= QUIZ_QUESTIONS.length) {
      setFinished(true);
      // Save to Firebase
      try {
        await addDoc(collection(db, 'quizResults'), {
          studentName,
          score: newAnswers.filter(Boolean).length,
          total: QUIZ_QUESTIONS.length,
          ts: serverTimestamp(),
        });
      } catch (_) {}
    } else {
      setCurrent(current + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <StudentNav />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-white mb-2">✍️ Quick Quiz</h1>
        <p className="text-gray-400 mb-8">Test your understanding of today's lesson.</p>

        {finished ? (
          <div className="glass rounded-2xl p-10 text-center">
            <div className="text-6xl mb-4">{score >= 4 ? '🎉' : score >= 3 ? '👍' : '📖'}</div>
            <h2 className="text-3xl font-black text-white mb-2">
              {score} / {QUIZ_QUESTIONS.length}
            </h2>
            <p className="text-gray-400 mb-2">
              {score >= 4 ? 'Excellent work!' : score >= 3 ? 'Good job!' : 'Keep practicing!'}
            </p>
            <div className="w-full bg-gray-800 rounded-full h-3 mb-6">
              <div
                className="h-3 rounded-full bg-[#6C63FF] transition-all"
                style={{ width: `${(score / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
            <button
              onClick={restart}
              className="bg-[#6C63FF] hover:bg-[#4B44CC] text-white font-bold px-8 py-3 rounded-xl transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-400 text-sm">
                Question {current + 1} of {QUIZ_QUESTIONS.length}
              </span>
              <div className="flex gap-1">
                {QUIZ_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i < current ? 'bg-[#6C63FF]' : i === current ? 'bg-white' : 'bg-gray-700'}`}
                  />
                ))}
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-6">{q.q}</h2>

            <div className="space-y-3 mb-6">
              {q.options.map((opt, i) => {
                let cls = 'bg-gray-800 border-gray-700 text-gray-200 hover:border-[#6C63FF]/50 cursor-pointer';
                if (selected !== null) {
                  if (i === q.correct) cls = 'bg-green-900/40 border-green-500 text-green-300';
                  else if (i === selected && i !== q.correct) cls = 'bg-red-900/40 border-red-500 text-red-300';
                  else cls = 'bg-gray-800 border-gray-700 text-gray-500 cursor-default';
                }
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    className={`w-full text-left border rounded-xl px-5 py-3 text-sm transition ${cls}`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <button
                onClick={next}
                className="w-full bg-[#6C63FF] hover:bg-[#4B44CC] text-white font-bold py-3 rounded-xl transition"
              >
                {current + 1 < QUIZ_QUESTIONS.length ? 'Next →' : 'See Results'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
