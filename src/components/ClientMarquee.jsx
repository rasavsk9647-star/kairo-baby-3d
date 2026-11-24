import React from 'react';
import { MARQUEE_CLIENTS } from '../data/bapiDaConfig';

export default function ClientMarquee() {
  const repeated = [...MARQUEE_CLIENTS, ...MARQUEE_CLIENTS];

  return (
    <footer className="hero-anim-bottom absolute right-0 bottom-0 left-0 z-[18] grid h-11 grid-cols-[auto_1fr] items-center gap-4 bg-gradient-to-r from-[#FF7EB3] via-[#FDA4AF] to-[#60A5FA] px-5 text-white shadow-[0_-4px_24px_rgba(244,114,182,0.18)]">
      <div className="font-mono-label inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-white backdrop-blur-sm">
        <span>RASAVSK 9647</span>
      </div>

      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
        <div className="animate-marquee font-display inline-flex items-center gap-4 whitespace-nowrap text-[14px] text-white">
          {repeated.map((client, index) => (
            <React.Fragment key={`${client}-${index}`}>
              <span>{client}</span>
              <span className="opacity-75">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </footer>
  );
}
