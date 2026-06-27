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

  // The liquid level Y coordinate mapping:
  // Wave SVG top is at y=20.
  // Bottle bottom is at y=125, so for 0%, liquidY = 125 - 20 = 105.
  // Bottle top is at y=25, so for 100%, liquidY = 25 - 20 = 5.
  const liquidY = 105 - (pct / 100) * 100; 

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
          viewBox="0 0 100 135" 
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

            {/* Bottle Inner Shadow Gradient for realistic glass/steel look */}
            <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
              <stop offset="20%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="80%" stopColor="rgba(255,255,255,0.0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
            </linearGradient>

            {/* CLIP-PATH OF THE BOTTLE INNER CONTENT (so liquid stays perfectly inside) */}
            <clipPath id="bottleClip">
              <path 
                d="M 32,25 
                   L 32,32 
                   C 32,38 22,42 22,50 
                   L 22,115 
                   C 22,123 28,125 50,125 
                   C 72,125 78,123 78,115 
                   L 78,50 
                   C 78,42 68,38 68,32 
                   L 68,25 
                   Z" 
              />
            </clipPath>
          </defs>

          {/* BOTTLE CAP & BRIM (Not clipped, drawn outside) */}
          {/* Flexible Strap Handle */}
          <path d="M 35,10 C 35,0 65,0 65,10" fill="none" stroke="#0f172a" strokeWidth="5" />
          {/* Modern wide cap lid */}
          <rect x="29" y="8" width="42" height="17" rx="3" fill="#0f172a" />
          {/* Cap ridges / texture line */}
          <rect x="31" y="19" width="38" height="2" fill="#334155" />

          {/* BACKGROUND BOTTLE INSIDE SHADOW (Steel/matte look) */}
          <path 
            d="M 32,25 L 32,32 C 32,38 22,42 22,50 L 22,115 C 22,123 28,125 50,125 C 72,125 78,123 78,115 L 78,50 C 78,42 68,38 68,32 L 68,25 Z" 
            fill="#f1f5f9" 
            fillOpacity="0.85" 
            stroke="#e2e8f0" 
            strokeWidth="1.5" 
          />

          {/* LIQUID WAVE MASKED CONTAINER (Only rendered inside clip) */}
          <g clipPath="url(#bottleClip)">
            {/* Water Wave Fill */}
            {pct > 0 && (
              <motion.g
                initial={{ y: 105 }}
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
            <g stroke="#94a3b8" strokeOpacity="0.35" strokeWidth="1.5">
              <line x1="24" y1="50" x2="32" y2="50" />
              <line x1="24" y1="75" x2="38" y2="75" />
              <line x1="24" y1="100" x2="32" y2="100" />
              <text x="45" y="77.5" fill="#64748b" fillOpacity="0.5" fontSize="6.5" textAnchor="middle" fontFamily="monospace" fontWeight="bold">50%</text>
            </g>
          </g>

          {/* GLASS GLOSS & HIGHLIGHTS ON TOP OUTSIDE FOR REALISTIC DEPTH */}
          <path 
            d="M 32,25 L 32,32 C 32,38 22,42 22,50 L 22,115 C 22,123 28,125 50,125 C 72,125 78,123 78,115 L 78,50 C 78,42 68,38 68,32 L 68,25 Z" 
            fill="url(#glassReflection)" 
            pointerEvents="none" 
            stroke="#ffffff" 
            strokeOpacity="0.6" 
            strokeWidth="1" 
          />

          {/* Side Highlights (straight lines with soft caps) */}
          <path 
            d="M 26,52 L 26,110" 
            stroke="#ffffff" 
            strokeOpacity="0.9" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            fill="none" 
            filter="blur(0.5px)"
          />

          <path 
            d="M 74,52 L 74,110" 
            stroke="#ffffff" 
            strokeOpacity="0.3" 
            strokeWidth="1.5" 
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
