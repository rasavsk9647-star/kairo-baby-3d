import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import CuteLoader from './components/CuteLoader';
import TopBar from './components/TopBar';
import HeroBackdrop from './components/HeroBackdrop';
import BabyStage3D from './components/BabyStage3D';
import BioMoodPanel from './components/BioMoodPanel';
import StatsAddaPanel from './components/StatsAddaPanel';
import PatienceMeter from './components/PatienceMeter';
import ClientMarquee from './components/ClientMarquee';
import CommissionModal from './components/CommissionModal';
import {
  CALM_DOWN_LINES,
  INTERACTION_STEPS,
  MOOD_META
} from './data/bapiDaConfig';

export default function App() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  const [mood, setMood] = useState('neutral');
  const [patience, setPatience] = useState(100);
  const [pullsCount, setPullsCount] = useState(0);
  const [speech, setSpeech] = useState('');
  const [autoDemo, setAutoDemo] = useState(false);
  const [commissionOpen, setCommissionOpen] = useState(false);

  const shellRef = useRef(null);
  const speechTimerRef = useRef(null);
  const cooldownTimerRef = useRef(null);
  const isCoolingDownRef = useRef(false);

  const showSpeech = useCallback((text, ms = 2400) => {
    setSpeech(text);
    clearTimeout(speechTimerRef.current);
    if (ms > 0) {
      speechTimerRef.current = setTimeout(() => setSpeech(''), ms);
    }
  }, []);

  // Smooth GSAP entrance choreography for all screen text & panels once loader completes
  useEffect(() => {
    if (!loaderDone) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-anim-top', {
        y: -24,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out'
      });

      gsap.from('.hero-anim-left', {
        x: -36,
        opacity: 0,
        duration: 0.75,
        delay: 0.12,
        ease: 'power3.out'
      });

      gsap.from('.hero-anim-right', {
        x: 36,
        opacity: 0,
        duration: 0.75,
        delay: 0.16,
        ease: 'power3.out'
      });

      gsap.from('.hero-anim-bottom', {
        y: 28,
        opacity: 0,
        duration: 0.7,
        delay: 0.22,
        stagger: 0.08,
        ease: 'power3.out'
      });
    }, shellRef);

    const welcomeId = setTimeout(() => {
      showSpeech('Hii! Kairo reporting for snack duty!', 2600);
    }, 650);

    return () => {
      ctx.revert();
      clearTimeout(welcomeId);
    };
  }, [loaderDone, showSpeech]);

  const handlePinchComplete = useCallback(() => {
    if (isCoolingDownRef.current) return;

    setPullsCount((prevCount) => {
      const nextCount = prevCount + 1;
      const stepIdx = Math.min(
        INTERACTION_STEPS.length - 1,
        (nextCount - 1) % INTERACTION_STEPS.length
      );

      setPatience((prevPatience) => {
        const nextPatience = Math.max(0, prevPatience - 20);
        if (nextPatience === 0) {
          isCoolingDownRef.current = true;
          setMood('tantrum');
          showSpeech(INTERACTION_STEPS[4].line, 2100);

          clearTimeout(cooldownTimerRef.current);
          cooldownTimerRef.current = setTimeout(() => {
            isCoolingDownRef.current = false;
            setMood('neutral');
            setPatience(100);
            const calmLine = CALM_DOWN_LINES[Math.floor(Math.random() * CALM_DOWN_LINES.length)];
            showSpeech(calmLine, 2400);
          }, 2200);
        } else {
          const reaction = INTERACTION_STEPS[stepIdx];
          setMood(reaction.mood);
          showSpeech(reaction.line, 2300);
        }
        return nextPatience;
      });

      return nextCount;
    });
  }, [showSpeech]);

  const handleSelectMood = useCallback(
    (nextMood) => {
      if (isCoolingDownRef.current) {
        isCoolingDownRef.current = false;
        clearTimeout(cooldownTimerRef.current);
        setPatience(100);
      }
      setMood(nextMood);
      showSpeech(MOOD_META[nextMood]?.sampleLine ?? 'Goo!', 2200);
    },
    [showSpeech]
  );

  // Auto demo loop
  useEffect(() => {
    if (!autoDemo || !loaderDone) return undefined;

    const id = setInterval(() => {
      handlePinchComplete();
    }, 2000);

    return () => clearInterval(id);
  }, [autoDemo, loaderDone, handlePinchComplete]);

  useEffect(() => {
    return () => {
      clearTimeout(speechTimerRef.current);
      clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  const moodLabel = MOOD_META[mood]?.label ?? 'Neutral';

  return (
    <div
      ref={shellRef}
      className={`relative h-screen w-screen overflow-hidden transition-colors duration-500 ${mood === 'tantrum'
          ? 'bg-gradient-to-br from-[#FFF0F6] via-[#FFE4EE] to-[#E6F2FF]'
          : 'bg-gradient-to-br from-[#FFF8FC] via-[#FFFFFF] to-[#EBF5FF]'
        }`}
    >
      {!loaderDone && (
        <CuteLoader
          assetsReady={assetsLoaded}
          onComplete={() => setLoaderDone(true)}
        />
      )}

      <TopBar
        moodLabel={moodLabel}
        autoDemo={autoDemo}
        onToggleDemo={() => setAutoDemo((v) => !v)}
        onOpenCommission={() => setCommissionOpen(true)}
      />

      <HeroBackdrop mood={mood} isReady={loaderDone} />

      <main className="relative z-[8] h-full w-full">
        <BabyStage3D
          mood={mood}
          isReady={loaderDone}
          onAssetsLoaded={() => setAssetsLoaded(true)}
          onPinchComplete={handlePinchComplete}
        />

        {/* Cute Floating Zzz indicator when Sleepy */}
        {mood === 'sleepy' && loaderDone && (
          <div className="pointer-events-none absolute top-[24%] left-[calc(50%+min(10vw,125px))] z-[13] flex gap-1.5 font-kairo text-xl font-bold text-sky-400">
            <span className="animate-bounce">Z</span>
            <span className="animate-bounce text-base [animation-delay:150ms]">z</span>
            <span className="animate-bounce text-xs [animation-delay:300ms]">z</span>
          </div>
        )}

        {speech && loaderDone && (
          <div
            className={`pointer-events-none absolute top-[21%] left-[calc(50%+min(12vw,145px))] z-[15] max-w-[230px] rounded-2xl px-4 py-3 text-[13.5px] leading-snug font-extrabold shadow-[0_12px_28px_rgba(147,197,253,0.28)] transition-all ${mood === 'tantrum'
                ? 'border border-pink-300 bg-gradient-to-r from-[#FF5C9D] to-[#60A5FA] text-white'
                : 'border border-pink-100 bg-white/95 text-slate-800'
              }`}
          >
            <span>{speech}</span>
          </div>
        )}
      </main>

      <BioMoodPanel mood={mood} onSelectMood={handleSelectMood} />

      <StatsAddaPanel pullsCount={pullsCount} />

      <PatienceMeter patience={patience} />

      <ClientMarquee />

      <CommissionModal open={commissionOpen} onClose={() => setCommissionOpen(false)} />
    </div>
  );
}
