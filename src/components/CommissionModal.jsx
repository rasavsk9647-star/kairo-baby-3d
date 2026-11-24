import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CommissionModal({ open, onClose }) {
  const [name, setName] = useState('');
  const [vibe, setVibe] = useState('');
  const [email, setEmail] = useState('');
  const [sentMsg, setSentMsg] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSentMsg('Brief received! Kairo will sketch back right after his nap.');
    setName('');
    setVibe('');
    setEmail('');
  };

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-slate-900/35 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="commission-modal-title"
        className="relative w-full max-w-[420px] rounded-3xl border border-pink-100 bg-white/95 p-7 text-slate-900 shadow-[0_28px_70px_rgba(148,163,184,0.35)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-pink-50 hover:text-slate-700 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="font-mono-label text-[10px] font-semibold tracking-[0.18em] text-pink-500">
          KAIRO STUDIO
        </span>
        <h2 id="commission-modal-title" className="font-display mt-1.5 text-2xl font-extrabold text-slate-900">
          Commission a 3D Face
        </h2>
        <p className="mt-1.5 mb-4 text-[13px] leading-relaxed text-slate-500">
          Want a super-soft Pixar-style interactive mascot or playful 3D hero like Baby Kairo?
          Send a quick brief.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="grid gap-1 text-[11.5px] font-semibold text-slate-600">
            <span>Your name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aarav Sen"
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-pink-400 focus:bg-white"
            />
          </label>

          <label className="grid gap-1 text-[11.5px] font-semibold text-slate-600">
            <span>Character vibe</span>
            <input
              type="text"
              required
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="Cute sleepy baby mascot / playful cub"
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-pink-400 focus:bg-white"
            />
          </label>

          <label className="grid gap-1 text-[11.5px] font-semibold text-slate-600">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav@brand.in"
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-pink-400 focus:bg-white"
            />
          </label>

          <button
            type="submit"
            className="mt-1 w-full rounded-full bg-gradient-to-r from-[#FF6EA9] to-[#60A5FA] py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(244,114,182,0.3)] transition-transform hover:-translate-y-0.5 cursor-pointer"
          >
            Send Brief to Kairo
          </button>
        </form>

        {sentMsg && (
          <p className="mt-3 text-center text-xs font-semibold text-pink-600">{sentMsg}</p>
        )}
      </div>
    </div>
  );
}
