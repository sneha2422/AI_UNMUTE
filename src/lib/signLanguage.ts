// src/lib/signLanguage.ts
// Detects simple hand gestures using MediaPipe Hands via TF.js
// Returns a string label for recognized gestures

export type GestureLabel =
  | 'OPEN_PALM'
  | 'THUMBS_UP'
  | 'PEACE'
  | 'FIST'
  | 'POINTING'
  | 'UNKNOWN';

export const GESTURE_MESSAGES: Record<GestureLabel, string> = {
  OPEN_PALM: '✋ I need help',
  THUMBS_UP: '👍 I understand',
  PEACE: '✌️ I have a question',
  FIST: '✊ Please repeat',
  POINTING: '☝️ I want to answer',
  UNKNOWN: '',
};

function distance(a: number[], b: number[]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function isFingerExtended(tip: number[], pip: number[], wrist: number[]) {
  return distance(tip, wrist) > distance(pip, wrist);
}

export function classifyGesture(landmarks: number[][]): GestureLabel {
  if (!landmarks || landmarks.length < 21) return 'UNKNOWN';

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const indexPip = landmarks[6];
  const middlePip = landmarks[10];
  const ringPip = landmarks[14];
  const pinkyPip = landmarks[18];
  const thumbIp = landmarks[3];

  const indexUp = isFingerExtended(indexTip, indexPip, wrist);
  const middleUp = isFingerExtended(middleTip, middlePip, wrist);
  const ringUp = isFingerExtended(ringTip, ringPip, wrist);
  const pinkyUp = isFingerExtended(pinkyTip, pinkyPip, wrist);
  const thumbUp = isFingerExtended(thumbTip, thumbIp, wrist);

  const allUp = indexUp && middleUp && ringUp && pinkyUp;
  const noneUp = !indexUp && !middleUp && !ringUp && !pinkyUp;

  if (allUp && thumbUp) return 'OPEN_PALM';
  if (noneUp && thumbUp) return 'THUMBS_UP';
  if (indexUp && middleUp && !ringUp && !pinkyUp) return 'PEACE';
  if (noneUp && !thumbUp) return 'FIST';
  if (indexUp && !middleUp && !ringUp && !pinkyUp) return 'POINTING';

  return 'UNKNOWN';
}
