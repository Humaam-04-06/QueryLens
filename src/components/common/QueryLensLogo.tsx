import React from 'react';

interface QueryLensLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  sm: { icon: 28, text: 'text-base', sub: 'text-[10px]' },
  md: { icon: 36, text: 'text-lg', sub: 'text-[11px]' },
  lg: { icon: 44, text: 'text-xl', sub: 'text-xs' },
  xl: { icon: 56, text: 'text-2xl', sub: 'text-sm' },
};

export const QueryLensLogo: React.FC<QueryLensLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  animate = false,
}) => {
  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* SVG Icon Mark */}
      <div 
        className={`relative flex items-center justify-center shrink-0 rounded-xl transition-all duration-300 ${
          animate ? 'hover:scale-105 hover:shadow-glow-cyan' : ''
        }`}
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="qlBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#090d16" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="qlBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="qlDbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>

            <linearGradient id="qlLensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="40%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            <linearGradient id="qlGlassGrad" x1="20%" y1="20%" x2="80%" y2="80%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.25" />
            </linearGradient>

            <filter id="qlCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Squircle */}
          <rect
            x="2"
            y="2"
            width="60"
            height="60"
            rx="14"
            fill="url(#qlBgGrad)"
            stroke="url(#qlBorderGrad)"
            strokeWidth="1.5"
          />

          {/* Database Disk Stack */}
          <g opacity="0.85">
            {/* Bottom Disk */}
            <path
              d="M12 39 C12 43.5 22 45 28 45 C34 45 44 43.5 44 39 V42 C44 46.5 34 48 28 48 C22 48 12 46.5 12 42 Z"
              fill="url(#qlDbGrad)"
              opacity="0.6"
            />
            <ellipse cx="28" cy="39" rx="16" ry="4.5" fill="#1e293b" stroke="url(#qlDbGrad)" strokeWidth="1" />

            {/* Middle Disk */}
            <path
              d="M12 30 C12 34.5 22 36 28 36 C34 36 44 34.5 44 30 V33 C44 37.5 34 39 28 39 C22 39 12 37.5 12 33 Z"
              fill="url(#qlDbGrad)"
              opacity="0.75"
            />
            <ellipse cx="28" cy="30" rx="16" ry="4.5" fill="#0f172a" stroke="url(#qlDbGrad)" strokeWidth="1" />

            {/* Top Disk */}
            <path
              d="M12 21 C12 25.5 22 27 28 27 C34 27 44 25.5 44 21 V24 C44 28.5 34 30 28 30 C22 30 12 28.5 12 24 Z"
              fill="url(#qlDbGrad)"
              opacity="0.9"
            />
            <ellipse cx="28" cy="21" rx="16" ry="4.5" fill="#1e1b4b" stroke="url(#qlDbGrad)" strokeWidth="1.2" />
          </g>

          {/* Magnifying Focus Lens */}
          <g filter="url(#qlCyanGlow)">
            <circle cx="36" cy="31" r="14.5" fill="url(#qlGlassGrad)" />
            <path
              d="M26 23 A12 12 0 0 1 44 23"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.6"
            />
            <circle cx="36" cy="31" r="14.5" stroke="url(#qlLensGrad)" strokeWidth="3" />
            <path d="M46.5 41.5 L55 50" stroke="url(#qlLensGrad)" strokeWidth="4" strokeLinecap="round" />
            <path
              d="M46.5 41.5 L55 50"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.5"
            />

            {/* Reticle Focus Indicator */}
            <circle cx="36" cy="31" r="2.5" fill="#38bdf8" />
            <path
              d="M36 25 V28 M36 34 V37 M30 31 H33 M39 31 H42"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="36" cy="31" r="1" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Optional Brand Wordmark */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent ${currentSize.text}`}
            >
              QueryLens
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded uppercase tracking-wider">
              Optimizer
            </span>
          </div>
          <span className={`text-slate-400 hidden sm:block ${currentSize.sub}`}>
            Database Query Static Analysis &amp; Plan Visualizer
          </span>
        </div>
      )}
    </div>
  );
};
