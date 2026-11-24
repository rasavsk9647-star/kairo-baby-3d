import React, { useState } from 'react';

export default function StatsAddaPanel({ pullsCount }) {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setFeedback(`Kairo added ${email.trim()} to The Sunday Nap Club!`);
    setEmail('');
  };

  return (
    <aside className="hero-anim-right absolute right-7 bottom-16 z-[14] hidden w-[min(23vw,280px)] lg:block">
      <div className="mb-3.5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-sky-100 bg-white/92 p-3.5 shadow-[0_10px_28px_rgba(244,114,182,0.14)]">
        <div>
          <div className="font-display text-[clamp(22px,2.2vw,30px)] leading-none text-slate-900">
            248
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Faces drawn</div>
        </div>

        <div>
          <div className="font-display text-[clamp(22px,2.2vw,30px)] leading-none text-slate-900">
            73
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Curls tugged</div>
        </div>

        <div>
          <div className="font-display text-[clamp(22px,2.2vw,30px)] leading-none text-slate-900">
            11
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Bottles before noon</div>
        </div>

        <div>
          <div className="font-display bg-gradient-to-r from-[#FF5C9D] to-[#3B82F6] bg-clip-text text-[clamp(22px,2.2vw,30px)] leading-none text-transparent">
            {pullsCount}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Pinches, by you</div>
        </div>
      </div>

      <section className="rounded-2xl border border-pink-100 bg-white/92 p-3.5 shadow-[0_10px_28px_rgba(147,197,253,0.15)]">
        <h3 className="font-display bg-gradient-to-r from-[#FF5C9D] to-[#60A5FA] bg-clip-text text-[15px] font-extrabold text-transparent">
          The Sunday Nap Club
        </h3>
        <p className="mt-1 mb-2.5 text-[11.5px] leading-snug text-slate-600">
          One cute character study and one pastel 3D rig breakdown, every Sunday morning. Skip it
          and Kairo pouts.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex items-center rounded-full border border-pink-200/80 bg-white p-1 shadow-inner"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.com"
            aria-label="Email address"
            className="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-[#FF6EA9] to-[#60A5FA] px-3.5 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
          >
            Join
          </button>
        </form>

        {feedback && <p className="mt-1.5 text-[11px] font-semibold text-pink-600">{feedback}</p>}
      </section>
    </aside>
  );
}
