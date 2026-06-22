import React from 'react';
import { motion } from 'motion/react';

interface WaterBottleProps {
  logged: number; // current intake
  target: number; // daily goal
}

export default function WaterBottle({ logged, target }: WaterBottleProps) {
  // Ensure percentage calculation. Minimum 0, max 100%
  const pct = target > 0 ? Math.min((logged / target) * 100, 100) : 0;
  
  // Real percentage (can exceed 100% for badges)
  const realPct = target > 0 ? Math.round((logged / target) * 100) : 0;

  // Let's create an animated SVG double wave representing the liquid container.
  // The liquid level Y coordinate is from 100 (empty) down to 15 (full)
  const liquidY = 110 - (pct / 100) * 85; 

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Container holding the bottle */}
      <div className="relative w-52 h-72 flex items-center justify-center">
        {/* Glow behind the bottle depending on fullness */}
        <div 
          className="absolute w-32 h-56 rounded-full filter blur-3xl opacity-25 transition-all duration-1000 -z-10"
          style={{
            background: pct >= 100 
              ? 'radial-gradient(circle, #bbf7d0 0%, #bfdbfe 100%)' 
              : `radial-gradient(circle, #93c5fd ${pct}%, #f8fafc 100%)`
          }}
        />

        {/* The Vector Water Bottle SVG */}
        <svg 
          viewBox="0 0 100 130" 
          className="w-full h-full drop-shadow-[0_10px_25px_rgba(30,41,59,0.06)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINITIONS FOR GRADIENTS AND WATER CLIPPING */}
          <defs>
            {/* Liquid Linear Gradient */}
            <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="35%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* Overachiever / Golden / Green Celebration Gradient */}
            <linearGradient id="celebrationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="40%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            {/* Bottle Inner Shadow Gradient for realistic glass look */}
            <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
              <stop offset="20%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="80%" stopColor="rgba(255,255,255,0.0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
            </linearGradient>

            {/* CLIP-PATH OF THE BOTTLE INNER CONTENT (so liquid stays perfectly inside) */}
            <clipPath id="bottleClip">
              <path 
                d="M 38,15 
                   C 38,15 37,24 35,26 
                   C 33,28 26,30 24,35
                   C 22,40 22,110 22,112
                   C 22,117 26,120 50,120
                   C 74,120 78,117 78,112
                   C 78,110 78,40 76,35
                   C 74,30 67,28 65,26
                   C 63,24 62,15 62,15
                   Z" 
              />
            </clipPath>
          </defs>

          {/* BOTTLE CAP & BRIM (Not clipped, drawn outside) */}
          {/* Cap thread ring */}
          <rect x="39" y="10" width="22" height="2" rx="1" fill="#94a3b8" />
          {/* Cap lid */}
          <rect x="36" y="5" width="28" height="6" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="0.5" />
          <line x1="42" y1="5" x2="42" y2="11" stroke="#334155" strokeWidth="1" />
          <line x1="50" y1="5" x2="50" y2="11" stroke="#334155" strokeWidth="1" />
          <line x1="58" y1="5" x2="58" y2="11" stroke="#334155" strokeWidth="1" />

          {/* BACKGROUND BOTTLE INSIDE SHADOW */}
          <path 
            d="M 38,15 C 38,15 37,24 35,26 C 33,28 26,30 24,35 C 22,40 22,110 22,112 C 22,117 26,120 50,120 C 74,120 78,117 78,112 C 78,110 78,40 76,35 C 74,30 67,28 65,26 C 63,24 62,15 62,15 Z" 
            fill="#f1f5f9" 
            fillOpacity="0.8" 
            stroke="#cbd5e1" 
            strokeWidth="1.2" 
          />

          {/* LIQUID WAVE MASKED CONTAINER (Only rendered inside clip) */}
          <g clipPath="url(#bottleClip)">
            {/* Water Wave Fill */}
            {pct > 0 && (
              <motion.g
                initial={{ y: 110 }}
                animate={{ y: liquidY }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                {/* Wave Vector Shape. We animate x shift to simulate flowing ripples */}
                <svg x="-100" width="300" height="130" viewBox="0 0 300 130">
                  {/* Back Wave (slower, darker tint) */}
                  <path 
                    d="M 0,20 C 50,12 100,28 150,20 C 200,12 250,28 300,20 L 300,150 L 0,150 Z" 
                    fill={realPct >= 100 ? '#166534' : '#2563eb'} 
                    opacity="0.3"
                    className="animate-wave-slow"
                  />
                  {/* Front main Wave */}
                  <path 
                    d="M 0,20 C 40,28 90,12 140,20 C 190,28 240,12 300,20 L 300,150 L 0,150 Z" 
                    fill={`url(${realPct >= 100 ? '#celebrationGrad' : '#liquidGrad'})`} 
                    className="animate-wave-fast"
                  />
                </svg>
              </motion.g>
            )}

            {/* Measurement Graduations / Tick Marks inside the bottle */}
            <g stroke="#475569" strokeOpacity="0.15" strokeWidth="0.8">
              <line x1="26" y1="45" x2="34" y2="45" />
              <line x1="26" y1="65" x2="38" y2="65" />
              <line x1="26" y1="85" x2="34" y2="85" />
              <line x1="26" y1="105" x2="38" y2="105" />
              <text x="43" y="67" fill="#475569" fillOpacity="0.25" fontSize="6.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">50%</text>
            </g>
          </g>

          {/* GLASS GLOSS & HIGHLIGHTS ON TOP OUTSIDE FOR REALISTIC DEPTH */}
          <path 
            d="M 38,15 C 38,15 37,24 35,26 C 33,28 26,30 24,35 C 22,40 22,110 22,112 C 22,117 26,120 50,120 C 74,120 78,117 78,112 C 78,110 78,40 76,35 C 74,30 67,28 65,26 C 63,24 62,15 62,15 Z" 
            fill="url(#glassReflection)" 
            pointerEvents="none" 
            stroke="#ffffff" 
            strokeOpacity="0.4" 
            strokeWidth="0.5" 
          />

          {/* Side Curved Highlights */}
          <path 
            d="M 25,48 C 25,48 24,70 24,80 C 24,90 25,108 25,108" 
            stroke="#ffffff" 
            strokeOpacity="0.6" 
            strokeWidth="1.2" 
            strokeLinecap="round" 
            fill="none" 
          />

          <path 
            d="M 75,48 C 75,48 76,70 76,80" 
            stroke="#ffffff" 
            strokeOpacity="0.3" 
            strokeWidth="1" 
            strokeLinecap="round" 
            fill="none" 
          />
        </svg>

        {/* Floating Percentage Indicator Label Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={realPct}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
          >
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-sans">
              Logged
            </span>
            <span className="text-xl font-mono font-black text-slate-900 leading-none my-0.5">
              {logged} <span className="text-xs font-sans text-slate-400 font-normal">ml</span>
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${realPct >= 100 ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
              <span className={`text-[10px] font-sans font-bold ${realPct >= 100 ? 'text-green-600 bg-green-50 px-1 py-0.5 rounded' : 'text-blue-600 bg-blue-50 px-1 py-0.5 rounded'}`}>
                {realPct}%
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Styled inline Keyframe Animations for liquid wave effects */}
      <style>{`
        @keyframes waveShift {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100px); }
        }
        @keyframes waveShiftRev {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(0); }
        }
        .animate-wave-slow {
          animation: waveShift 5s linear infinite;
        }
        .animate-wave-fast {
          animation: waveShiftRev 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
