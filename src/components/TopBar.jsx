import React from 'react';
import { Sparkles } from 'lucide-react';

export default function TopBar({ moodLabel, autoDemo, onToggleDemo, onOpenCommission }) {
  return (
    <header className="hero-anim-top relative z-20  flex items-center gap-3 px-6 pt-4  justify-between pb-2 text-xs">
      <div className="inline-flex items-center gap-2 text-slate-600 font-medium">
        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-pink-400 to-sky-400 shadow-[0_0_10px_rgba(244,114,182,0.75)]" />
        <span className="hidden sm:inline">
          Kairo Studio. Two adorable commissions open for December.
        </span>
      </div>


      <div className="justify-self-end inline-flex items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleDemo}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-semibold transition-all cursor-pointer ${autoDemo
            ? 'border-sky-400 bg-gradient-to-r from-sky-50 to-pink-50 text-sky-700 shadow-sm'
            : 'border-slate-200/90 bg-white/80 text-slate-700 hover:border-pink-300 hover:bg-pink-50/60'
            }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-pink-500" />
          <span>{autoDemo ? 'Stop demo' : 'Auto demo'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenCommission}
          className="rounded-full bg-gradient-to-r from-[#FF6EA9] to-[#60A5FA] px-4 py-2 font-bold text-white shadow-[0_8px_20px_rgba(244,114,182,0.3)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(96,165,250,0.35)] cursor-pointer"
        >
          Commission a face
        </button>
      </div>
    </header>
  );
}
