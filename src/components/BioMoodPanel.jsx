import React from 'react';
import { MOOD_META } from '../data/bapiDaConfig';

export default function BioMoodPanel({ mood, onSelectMood }) {
  const moods = Object.values(MOOD_META);

  return (
    <aside className="hero-anim-left absolute bottom-16 left-7 z-[14] hidden w-[min(25vw,300px)] lg:block">
      <h2 className="font-display mb-2.5 text-[clamp(19px,1.8vw,25px)] leading-[1.15] font-extrabold tracking-[-0.02em] text-slate-900">
        I pull faces grown-ups argue with at nap time.
      </h2>
      <p className="mb-2 text-[12px] leading-relaxed text-slate-600">
        Mascots, cereal-box stars, and the tiny boss of the playpen. Fourteen months on the job
        from a pastel studio crib where warm milk never runs dry.
      </p>
      <p className="text-[12px] leading-relaxed text-slate-600">
        This is baby <strong className="text-slate-800">Kairo</strong>. Extra-chubby cheeks and a
        bouncy top swirl. Pinch a cheek—everybody tries once.
      </p>

      <div className="mt-3 rounded-2xl border border-pink-100 bg-white/92 p-3 shadow-[0_10px_28px_rgba(147,197,253,0.16)]">
        <span className="font-mono-label mb-2 block text-[9.5px] tracking-[0.15em] text-slate-400">
          MODEL SHEET EXPRESSIONS
        </span>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Test Kairo expressions">
          {moods.map((item) => {
            const active = mood === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectMood(item.key)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${active
                  ? 'bg-gradient-to-r from-[#FF6EA9] to-[#60A5FA] text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-pink-300 hover:bg-pink-50/60'
                  }`}
              >
                {item.chipLabel}
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-[11px] text-slate-500">
          Tip: Drag either chubby cheek (auto-snaps back!) or tug his top swirl.
        </p>
      </div>
    </aside>
  );
}
