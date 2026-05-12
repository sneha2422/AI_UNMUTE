// src/app/student/page.tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  doc, onSnapshot, addDoc, collection, serverTimestamp
} from 'firebase/firestore';
import { CaptionDisplay } from '@/components/captions/CaptionDisplay';
import { StudentNav } from '@/components/StudentNav';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { classifyGesture, GESTURE_MESSAGES, GestureLabel } from '@/lib/signLanguage';

export default function StudentPage() {
  const [sessionId, setSessionId] = useState('classroom-001');
  const [joined, setJoined] = useState(false);
  const [liveCaption, setLiveCaption] = useState('');
  const [studentName, setStudentName] = useState('');
  const [question, setQuestion] = useState('');
  const [sentMsg, setSentMsg] = useState('');
  const { isOnline } = useOfflineSync();

  // Sign language
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [gestureLabel, setGestureLabel] = useState<GestureLabel>('UNKNOWN');
  const [modelLoaded, setModelLoaded] = useState(false);
  const detectorRef = useRef<any>(null);
  const animRef = useRef<number>(0);

  // Subscribe to live captions
  useEffect(() => {
    if (!joined) return;
    const ref = doc(db, 'sessions', sessionId, 'captions', 'live');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setLiveCaption(snap.data().text || '');
    });
    return unsub;
  }, [joined, sessionId]);

  // Send question
  const sendQuestion = async () => {
    if (!question.trim()) return;
    await addDoc(collection(db, 'sessions', sessionId, 'questions'), {
      text: question.trim(),
      studentName: studentName || 'Anonymous',
      type: 'text',
      ts: serverTimestamp(),
    });
    setQuestion('');
    setSentMsg('✅ Question sent!');
    setTimeout(() => setSentMsg(''), 3000);
  };

  // Send gesture as question
  const sendGesture = async (label: GestureLabel) => {
    const msg = GESTURE_MESSAGES[label];
    if (!msg) return;
    await addDoc(collection(db, 'sessions', sessionId, 'questions'), {
      text: msg,
      studentName: studentName || 'Anonymous',
      type: 'gesture',
      ts: serverTimestamp(),
    });
    setSentMsg(`✅ Gesture sent: ${msg}`);
    setTimeout(() => setSentMsg(''), 3000);
  };

  // Activate camera + sign language
  const activateCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Lazy-load TF.js + MediaPipe
      const tf = await import('@tensorflow/tfjs');
      await tf.ready();
      const handDetect = await import('@tensorflow-models/hand-pose-detection');
      const model = handDetect.SupportedModels.MediaPipeHands;
      const detector = await handDetect.createDetector(model, {
        runtime: 'tfjs',
        modelType: 'lite',
        maxHands: 1,
      });
      detectorRef.current = detector;
      setModelLoaded(true);
      console.log('Sign language model loaded!');
      runDetection();
    } catch (err) {
      console.error('Camera error:', err);
      alert('Could not access camera. Please allow camera permission.');
    }
  }, []);

  const runDetection = useCallback(async () => {
    const video = videoRef.current;
    const detector = detectorRef.current;
    if (!video || !detector || video.readyState < 2) {
      animRef.current = requestAnimationFrame(runDetection);
      return;
    }
    try {
      const hands = await detector.estimateHands(video);
      if (hands.length > 0) {
        const kp = hands[0].keypoints.map((k: any) => [k.x, k.y, k.z ?? 0]);
        const label = classifyGesture(kp);
        setGestureLabel(label);
      } else {
        setGestureLabel('UNKNOWN');
      }
    } catch (_) {}
    animRef.current = requestAnimationFrame(runDetection);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  if (!joined) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-2xl font-black text-white mb-6">Join Class</h1>
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mb-3 text-center"
          />
          <input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Class code (e.g. classroom-001)"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mb-6 text-center"
          />
          <button
            onClick={() => setJoined(true)}
            className="w-full bg-[#6C63FF] hover:bg-[#4B44CC] text-white font-bold py-3 rounded-xl transition text-lg"
          >
            Join →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <StudentNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Live Classroom</h1>
            <p className="text-gray-500 text-sm">Session: {sessionId} · {studentName || 'Anonymous'}</p>
          </div>
          {!isOnline && (
            <span className="bg-yellow-900/40 text-yellow-300 text-xs px-3 py-1 rounded-full border border-yellow-700">
              🟡 Offline Mode
            </span>
          )}
        </div>

        {/* Live captions */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Live Captions
          </h2>
          <CaptionDisplay transcript={liveCaption} isLive={true} />
        </div>

        {sentMsg && (
          <div className="bg-green-900/40 border border-green-700 text-green-300 rounded-xl p-3 mb-4 text-center text-sm">
            {sentMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Text Q&A */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">💬 Ask a Question</h2>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here…"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm resize-none mb-3 focus:border-[#6C63FF] outline-none"
            />
            <button
              onClick={sendQuestion}
              disabled={!question.trim()}
              className="w-full bg-[#6C63FF] hover:bg-[#4B44CC] disabled:opacity-40 text-white font-semibold py-2 rounded-xl transition"
            >
              Send Question
            </button>
          </div>

          {/* Sign language */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">✋ Sign Language</h2>

            {!cameraActive ? (
              <button
                onClick={activateCamera}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-xl transition text-sm font-medium"
              >
                📷 Activate Camera
              </button>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-black">
                  <video ref={videoRef} className="w-full h-36 object-cover scale-x-[-1]" muted playsInline />
                  {!modelLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs">
                      Loading AI model…
                    </div>
                  )}
                </div>

                {gestureLabel !== 'UNKNOWN' && (
                  <div className="bg-[#6C63FF]/20 border border-[#6C63FF]/40 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">{GESTURE_MESSAGES[gestureLabel].split(' ')[0]}</div>
                    <div className="text-white text-sm font-medium">{GESTURE_MESSAGES[gestureLabel]}</div>
                    <button
                      onClick={() => sendGesture(gestureLabel)}
                      className="mt-2 bg-[#6C63FF] hover:bg-[#4B44CC] text-white text-xs px-4 py-1 rounded-lg transition"
                    >
                      Send to Teacher
                    </button>
                  </div>
                )}

                <div className="text-xs text-gray-500 text-center">
                  Try: Open palm, thumbs up, peace, fist, pointing
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
