# 🔇→🔊 UNMUTE — AI Accessibility Platform

**Real-time speech-to-text captioning, sign language detection, and learning analytics for inclusive classrooms.**

**LIVE DEMO : ai-unmute.vercel.app**

Team INSYNC · HopeWorks × AI4India Hackathon

---

# UNMUTE — AI-Powered Real-Time Accessibility Communication System

UNMUTE is an AI-powered Progressive Web App designed to reduce communication barriers for students with hearing and speech disabilities in classroom environments.

The system provides real-time speech-to-text captioning, student-to-teacher communication, basic sign-language gesture recognition, auto-generated lecture notes, quiz support, learning analytics, and offline-first functionality. It is built as a web-based prototype that can run on laptops, tablets, and mobile devices.

## Key Features

- Real-time speech-to-text classroom captions
- Teacher dashboard for live sessions
- Student interface for captions and questions
- Student Q&A system
- Basic sign-language gesture recognition
- Auto-generated lecture notes
- Quiz module for learning review
- Analytics dashboard for engagement tracking
- Offline-first PWA support
- Firebase integration for real-time data sync

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Firebase
- Firestore
- TensorFlow.js
- MediaPipe Hands
- IndexedDB
- PWA Service Worker

## 🚀 Quick Start (5 Steps)

### Step 1 — Clone / unzip this project
```bash
cd Desktop
# If using the zip, unzip and cd into the folder
cd unmute
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Set up Firebase
1. Go to https://console.firebase.google.com → Create project named `unmute-prototype`
2. Click **Web** (`</>`) → register app → copy config
3. Enable **Firestore** (test mode) and **Authentication** (Email/Password + Google)
4. Copy `.env.example` → `.env.local` and paste your config values

### Step 4 — Run locally
```bash
npm run dev
# Open http://localhost:3000
```

### Step 5 — Deploy to Vercel (free hosting)
```bash
git init && git add . && git commit -m "UNMUTE v1"
# Push to GitHub, then import at https://vercel.com
# Add all NEXT_PUBLIC_FIREBASE_* env vars in Vercel → Settings → Environment Variables
```

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx                 ← Home / role selector
│   ├── teacher/
│   │   ├── page.tsx             ← Teacher classroom (mic + questions)
│   │   └── analytics/page.tsx  ← Analytics dashboard
│   ├── student/
│   │   ├── page.tsx             ← Live captions + sign language + Q&A
│   │   ├── notes/page.tsx       ← View saved lecture notes
│   │   └── quiz/page.tsx        ← Self-assessment quiz
│   └── admin/
│       └── page.tsx             ← Admin overview + quiz results
├── components/
│   ├── StudentNav.tsx
│   ├── TeacherNav.tsx
│   ├── ServiceWorkerRegistrar.tsx
│   └── captions/CaptionDisplay.tsx
├── hooks/
│   ├── useSpeechCaption.ts      ← Web Speech API hook
│   └── useOfflineSync.ts        ← Online/offline detector
└── lib/
    ├── firebase.ts              ← Firebase init
    ├── signLanguage.ts          ← Gesture classifier (TF.js)
    └── offlineStorage.ts        ← IndexedDB helpers
```

---

## ✅ Features

| Feature | How It Works |
|---------|-------------|
| **Live Speech Captions** | Teacher speaks → Web Speech API → Firebase Firestore → Student sees in real-time |
| **Sign Language** | Student webcam → TF.js + MediaPipe Hands → gesture classified → sent to teacher |
| **Student Q&A** | Student types question → Firebase → appears on teacher dashboard instantly |
| **Lecture Notes** | All spoken sentences saved; students can view + download after class |
| **Quiz Module** | 5-question quiz; score saved to Firebase for admin analytics |
| **Offline Mode** | IndexedDB caches data locally; service worker caches pages; syncs on reconnect |
| **PWA** | Installable on Android/iOS from browser; works like a native app |
| **Analytics** | Recharts dashboards showing engagement, quiz scores, question volume |

---

## 🎮 Demo Flow

**Two devices on the same WiFi:**
1. Open `/teacher` on Laptop A → Start Class (same class code)
2. Open `/student` on Laptop B or Phone → Join with same code
3. Laptop A speaks → Laptop B sees captions in 1-2 seconds
4. Phone student types a question → appears on teacher dashboard
5. Student shows open palm to webcam → "I need help" sent to teacher
6. Teacher ends class → notes saved → student views at `/student/notes`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Firebase Firestore (real-time) |
| Auth | Firebase Authentication |
| Speech AI | Web Speech API (Chrome built-in) |
| Sign Language | TensorFlow.js + MediaPipe Hands |
| Charts | Recharts |
| Offline Storage | IndexedDB via `idb` library |
| PWA | Manifest + Service Worker |
| Hosting | Vercel (free) |

---

## ⚠️ Important Notes

- **Use Google Chrome** — Web Speech API doesn't work in Safari/Firefox
- **Firebase rules** — Keep in test mode for the prototype; harden before production
- **Sign language** — Detects 5 gestures: open palm, thumbs up, peace, fist, pointing
- **Camera** — Must be served over HTTPS (localhost works; Vercel provides HTTPS)

---

## Project Goal

The goal of UNMUTE is to make classroom communication more accessible, inclusive, and affordable by using AI-powered tools that help students participate actively without depending fully on human interpreters.
