import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const STATUS_LINES = [
  'Waking up Kairo…',
  'Fluffing chubby cheeks…',
  'Curling the top swirl…',
  'Ready for snack duty!'
];

export default function CuteLoader({ assetsReady, onComplete }) {
  const wrapRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const progressRef = useRef(0);
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: 92,
      duration: 1.15,
      ease: 'power2.out',
      onUpdate: () => {
        const pct = Math.round(obj.val);
        progressRef.current = pct;
        setProgress(pct);
        if (pct > 65) setStatusIndex(2);
        else if (pct > 30) setStatusIndex(1);
      }
    });

    return () => tween.kill();
  }, []);

  useEffect(() => {
    if (!assetsReady || finishedRef.current) return;
    finishedRef.current = true;

    const obj = { val: progressRef.current };
    gsap.to(obj, {
      val: 100,
      duration: 0.42,
      ease: 'power2.out',
      onUpdate: () => {
        const pct = Math.round(obj.val);
        progressRef.current = pct;
        setProgress(pct);
      },
      onComplete: () => {
        setStatusIndex(3);
        gsap.to(wrapRef.current, {
          yPercent: -100,
          opacity: 0,
          duration: 0.65,
          delay: 0.2,
          ease: 'power3.inOut',
          onComplete: () => onCompleteRef.current?.()
        });
      }
    });
  }, [assetsReady]);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF6FA] via-[#FFFFFF] to-[#EBF5FF] px-6 text-center"
    >
      {/* Cute floating pastel emblem */}
      <div className="animate-loader-float relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB6D5] via-[#FFD8E8] to-[#93C5FD] shadow-[0_20px_50px_rgba(244,114,182,0.28)]">
        <div className="h-16 w-16 rounded-full bg-white/90 shadow-inner flex items-center justify-center">
          <svg viewBox="0 0 64 64" width="44" height="44" fill="none" aria-hidden="true">
            <circle cx="32" cy="35" r="18" fill="#FFE2D6" />
            {/* Top swirl curl */}
            <path
              d="M32 17c0-7 7-9 9-4 2 4-3 7-6 4"
              stroke="#8B5E3C"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Cute eyes */}
            <circle cx="25" cy="34" r="2.7" fill="#1E293B" />
            <circle cx="39" cy="34" r="2.7" fill="#1E293B" />
            {/* Rosy cheeks */}
            <ellipse cx="20" cy="39" rx="3.8" ry="2.4" fill="#FF8DA1" opacity="0.7" />
            <ellipse cx="44" cy="39" rx="3.8" ry="2.4" fill="#FF8DA1" opacity="0.7" />
            {/* Sweet baby smile */}
            <path
              d="M27.5 41.5c2 2.5 7 2.5 9 0"
              stroke="#C96A5E"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div className="font-kairo mb-2 bg-gradient-to-r from-[#5BA4FF] via-[#A78BFA] to-[#FF6EA9] bg-clip-text text-5xl font-bold tracking-tight text-transparent">
        KAIRO
      </div>

      <p className="mb-5 text-xs font-semibold tracking-wide text-slate-500">
        {STATUS_LINES[statusIndex]}
      </p>

      {/* Smooth Pink-Blue Progress Pill */}
      <div className="h-2.5 w-56 overflow-hidden rounded-full border border-pink-100 bg-white p-0.5 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#60A5FA] via-[#A78BFA] to-[#FF6EA9] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="font-mono-label mt-2 text-[11px] font-semibold text-slate-400">
        {progress}%
      </span>
    </div>
  );
}
