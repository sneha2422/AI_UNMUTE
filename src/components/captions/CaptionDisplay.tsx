// src/components/captions/CaptionDisplay.tsx
'use client';

interface Props {
  transcript: string;
  isLive?: boolean;
}

export function CaptionDisplay({ transcript, isLive }: Props) {
  return (
    <div className="glass rounded-2xl p-6 min-h-[120px] flex items-center justify-center relative overflow-hidden">
      {isLive && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-xs text-red-400">
          <span className="w-2 h-2 bg-red-500 rounded-full pulse-ring inline-block" />
          LIVE
        </span>
      )}
      {transcript ? (
        <p className="caption-text text-white text-center leading-relaxed">{transcript}</p>
      ) : (
        <p className="text-gray-600 text-lg">
          {isLive ? 'Waiting for teacher to speak…' : 'No captions yet'}
        </p>
      )}
    </div>
  );
}
