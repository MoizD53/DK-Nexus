"use client";

import { useState } from "react";

interface VideoPlayerProps {
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  title?: string;
}

export function VideoPlayer({ videoUrl, thumbnailUrl, title }: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false);

  if (!videoUrl) {
    return (
      <div className="w-full h-full min-h-[240px] bg-stone-950 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={thumbnailUrl} 
            alt={title || "Exercise thumbnail"} 
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        ) : null}
        <div className="relative z-10 flex flex-col items-center">
          <svg className="w-12 h-12 mb-3 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium uppercase tracking-widest text-stone-500">Video Coming Soon</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full min-h-[240px] bg-stone-950 flex flex-col items-center justify-center text-center p-6">
        <svg className="w-10 h-10 mb-3 text-red-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium text-stone-400">Video unavailable</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black flex items-center justify-center relative">
      <video
        className="w-full h-full object-contain"
        controls
        playsInline
        preload="metadata"
        poster={thumbnailUrl || undefined}
        onError={() => setHasError(true)}
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        {/* Fallback for browsers that don't support HTML5 video */}
        <p className="text-stone-400 text-sm">Your browser does not support the video tag.</p>
      </video>
    </div>
  );
}
