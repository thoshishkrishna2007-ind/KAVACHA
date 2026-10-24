import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, ChevronRight, Activity } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  // Phase 1 (0-1s), Phase 2 (1-2.5s), Phase 3 (2-3.5s), Phase 4 (3.5-4.5s), Phase 5 (4.5-5.5s)
  const [phase, setPhase] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const quickTimer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(onComplete, 400);
      }, 1000);
      return () => clearTimeout(quickTimer);
    }

    const t1 = setTimeout(() => setPhase(2), 1000);
    const t2 = setTimeout(() => setPhase(3), 2200);
    const t3 = setTimeout(() => setPhase(4), 3400);
    const t4 = setTimeout(() => {
      setPhase(5);
      setIsFadingOut(true);
    }, 4500);
    const t5 = setTimeout(() => {
      onComplete();
    }, 5400);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 350);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="KAVACHA Introduction"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#071410] text-white overflow-hidden transition-all duration-700 ease-out select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #0d2a23 0%, #081a15 45%, #040d0a 100%)',
      }}
    >
      {/* Background Ambience & Delicate Light Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 220, 232, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 220, 232, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Atmospheric Luminous Orbs */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#267A68]/15 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute w-[320px] h-[320px] rounded-full bg-[#63DCE8]/10 blur-[90px] pointer-events-none" />

      {/* Skip Intro Button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#63DCE8]"
      >
        <span>Skip Intro</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#63DCE8]" />
      </button>

      {/* Main Cinematic Visual Stage */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xl">
        
        {/* Phase 1 & 2: Center Halo Ring & Shield Emblem */}
        <div className="relative flex items-center justify-center w-36 h-36 mb-6">
          
          {/* Phase 1: Luminous Circular Outline */}
          <div
            className={`absolute inset-0 rounded-full border border-[#63DCE8]/40 transition-all duration-1000 ${
              phase >= 1
                ? 'opacity-100 scale-100 shadow-[0_0_30px_rgba(99,220,232,0.25)]'
                : 'opacity-0 scale-50'
            }`}
          />
          
          {/* Concentric subtle ring */}
          <div
            className={`absolute inset-3 rounded-full border border-[#C6A15B]/30 transition-all duration-1000 delay-200 ${
              phase >= 2 ? 'opacity-80 scale-100' : 'opacity-0 scale-75'
            }`}
          />

          {/* Phase 2: KAVACHA Shield Emblem Formation */}
          <div
            className={`relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-b from-[#267A68]/80 to-[#123B32]/90 border border-[#63DCE8]/60 backdrop-blur-md shadow-[0_0_40px_rgba(38,122,104,0.4)] transition-all duration-1000 ${
              phase >= 2
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-75 translate-y-3'
            }`}
          >
            {/* Elegant SVG Shield Symbol with Protective Cross & Cardiac Rhythm Pulse */}
            <svg
              viewBox="0 0 100 100"
              className="w-16 h-16 text-[#63DCE8]"
              fill="none"
              stroke="currentColor"
            >
              {/* Outer Shield Outline */}
              <path
                d="M 50,15 L 80,26 C 80,62 50,85 50,85 C 50,85 20,62 20,26 Z"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-[#63DCE8] drop-shadow-[0_0_8px_rgba(99,220,232,0.6)]"
              />
              {/* Inner Champagne-Gold Accent Line */}
              <path
                d="M 50,22 L 73,31 C 73,59 50,77 50,77 C 50,77 27,59 27,31 Z"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                className="stroke-[#C6A15B] opacity-80"
              />
              {/* Center Clinical Vital Pulse Motif */}
              <path
                d="M 33,52 L 42,52 L 46,42 L 52,62 L 57,48 L 60,52 L 67,52"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-[#FAF8F1] drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
              />
              {/* Center node */}
              <circle cx="50" cy="50" r="2" fill="#63DCE8" />
            </svg>

            {/* Subtle optical node beacon */}
            <div className="absolute -top-1 w-2 h-2 rounded-full bg-[#63DCE8] optical-pulse" />
          </div>
        </div>

        {/* Phase 3: Brand Name & Subtitle Reveal */}
        <div
          className={`transition-all duration-1000 transform ${
            phase >= 3
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#C6A15B]" />
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#C6A15B] uppercase font-bold">
              Clinical Guard Protocol
            </span>
            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#C6A15B]" />
          </div>

          <h1
            className="text-4xl sm:text-5xl font-extrabold font-display tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-b from-[#FAF8F1] via-[#e2f1eb] to-[#86d5c0] drop-shadow-[0_4px_16px_rgba(99,220,232,0.35)]"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            KAVACHA
          </h1>

          <p className="text-xs sm:text-sm font-medium text-[#b6ffea]/90 tracking-wide mt-2 max-w-md mx-auto leading-relaxed">
            Intelligent Clinical Care Transition & Patient Safety Platform
          </p>
        </div>

        {/* Phase 4: Welcome Message & Precision Handoff Motto */}
        <div
          className={`mt-6 pt-5 transition-all duration-1000 transform ${
            phase >= 4
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          {/* Illuminated Accent Line */}
          <div className="w-48 h-[1.5px] mx-auto bg-gradient-to-r from-transparent via-[#63DCE8] to-transparent mb-4" />

          <div className="text-sm sm:text-base font-bold font-display uppercase tracking-widest text-[#FAF8F1]">
            Welcome to KAVACHA
          </div>

          <div className="text-xs italic text-[#bec9c4] mt-1 font-sans">
            Precision in every transition · Safety in every handoff
          </div>
        </div>

        {/* Phase 5: Initializing Status Indicator */}
        <div
          className={`mt-8 flex items-center gap-2 text-[11px] font-mono text-[#86d5c0] transition-opacity duration-700 ${
            phase >= 4 ? 'opacity-90' : 'opacity-0'
          }`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#63DCE8] optical-pulse" />
          <span>Synchronizing patient telemetry & clinical safety gates...</span>
        </div>

      </div>

      {/* Bottom Technical Assurance */}
      <div className="absolute bottom-5 text-center text-[10px] font-mono text-white/40 tracking-wider">
        KAVACHA HEALTHCARE INVARIANT ENGINE · NODE ALPHA
      </div>
    </div>
  );
};
