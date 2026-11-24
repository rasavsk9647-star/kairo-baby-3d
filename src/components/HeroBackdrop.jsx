import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const TITLE_LETTERS = ['K', 'A', 'I', 'R', 'O'];

export default function HeroBackdrop({ mood, isReady }) {
  const lettersRef = useRef([]);
  const isTantrum = mood === 'tantrum';

  useEffect(() => {
    if (!isReady) return;

    const els = lettersRef.current.filter(Boolean);
    gsap.fromTo(
      els,
      { y: 72, opacity: 0, scale: 0.78, rotate: -6 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.85,
        stagger: 0.065,
        ease: 'back.out(1.65)',
        onComplete: () => {
          // Gentle continuous wave float on KAIRO letters
          els.forEach((el, i) => {
            gsap.to(el, {
              y: -7,
              duration: 2.0,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: i * 0.16
            });
          });
        }
      }
    );

    return () => {
      gsap.killTweensOf(els);
    };
  }, [isReady]);

  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden="true">
      {/* Lightweight ambient pastel glow */}
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-pink-200/35 blur-2xl" />
      <div className="absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-sky-200/35 blur-2xl" />

      {/* Animated KAIRO Display Typography */}
      <h1
        aria-label="KAIRO"
        className="font-kairo absolute top-11 left-1/2 flex w-full -translate-x-1/2 items-center justify-center gap-[0.04em] leading-[0.86] tracking-[-0.02em] select-none"
        style={{ fontSize: 'clamp(74px, 14vw, 194px)' }}
      >
        {TITLE_LETTERS.map((char, idx) => (
          <span
            key={char}
            ref={(el) => {
              lettersRef.current[idx] = el;
            }}
            className={`inline-block bg-clip-text text-transparent transition-colors duration-500 ${isTantrum
                ? 'bg-gradient-to-b from-rose-500 via-pink-500 to-sky-400'
                : 'bg-gradient-to-b from-[#60A5FA] via-[#A78BFA] to-[#FF6EA9]'
              }`}
            style={{ opacity: 0 }}
          >
            {char}
          </span>
        ))}
      </h1>

      <div className="font-mono-label absolute top-20 right-5 text-[10px] tracking-[0.18em] text-slate-400 [writing-mode:vertical-rl]">
        SELF-PORTRAIT, AS A TINY BOSS
      </div>

      {/* Center Pastel Spotlight & Blueprint Reticle */}
      <div className="absolute inset-0 grid place-items-center">
        <div
          className={`absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${isTantrum
              ? 'scale-105 bg-gradient-to-br from-[#FF5C8D] via-[#FF85A1] to-[#60A5FA] shadow-[0_24px_70px_rgba(255,92,141,0.3)]'
              : 'bg-gradient-to-br from-[#FFB6D5] via-[#FFD8E8] to-[#93C5FD] shadow-[0_22px_65px_rgba(147,197,253,0.3)]'
            }`}
          style={{ width: 'min(39vw, 430px)', height: 'min(39vw, 430px)' }}
        />

        <div
          className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-white/85"
          style={{ width: 'min(32vw, 355px)', height: 'min(35vw, 385px)' }}
        />

        <div className="hidden lg:block absolute top-[41%] right-[29%] left-[29%] h-px border-t border-dotted border-slate-400/35">
          <span className="font-mono-label absolute -top-4 left-0 text-[9px] tracking-[0.14em] text-slate-400">
            EYE LINE
          </span>
        </div>

        <div className="hidden lg:block absolute top-[53%] right-[29%] left-[29%] h-px border-t border-dotted border-slate-400/35">
          <span className="font-mono-label absolute -top-4 right-0 text-[9px] tracking-[0.14em] text-slate-400">
            CHUBBY CHEEK
          </span>
        </div>
      </div>
    </div>
  );
}
