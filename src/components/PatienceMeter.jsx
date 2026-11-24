import React from 'react';

export default function PatienceMeter({ patience }) {
  const filledCount = Math.ceil((patience / 100) * 10);

  return (
    <div
      className="hero-anim-bottom absolute bottom-14 left-1/2 z-[16] inline-flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-pink-200/80 bg-white/90 px-3.5 py-1.5 shadow-[0_10px_28px_rgba(147,197,253,0.28)] backdrop-blur-md"
      aria-live="polite"
    >
      <span className="text-[11.5px] font-bold text-slate-700">Patience</span>

      <div className="inline-flex gap-1" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, idx) => {
          const active = idx < filledCount;
          let colorClass = 'bg-slate-200/80';
          if (active) {
            if (patience > 50) colorClass = 'bg-gradient-to-t from-sky-400 to-pink-400';
            else if (patience > 20) colorClass = 'bg-gradient-to-t from-amber-400 to-pink-400';
            else colorClass = 'bg-rose-500';
          }
          return (
            <span
              key={idx}
              className={`h-3 w-2.5 rounded-[3px] transition-colors duration-200 ${colorClass}`}
            />
          );
        })}
      </div>

      <span className="font-mono-label min-w-[34px] text-right text-[11px] font-semibold text-slate-700">
        {patience}%
      </span>
    </div>
  );
}
