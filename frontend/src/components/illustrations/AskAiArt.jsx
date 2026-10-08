import React from 'react';

export default function AskAiArt() {
  return (
    <svg viewBox="0 0 130 95" fill="none" xmlns="http://www.w3.org/2000/svg" className="banner-art-svg">
      {/* Background magical glow */}
      <circle cx="75" cy="48" r="38" fill="#fef08a" opacity="0.4" />
      <circle cx="90" cy="35" r="24" fill="#fed7aa" opacity="0.4" />

      {/* Sparkles / Magic Stars */}
      <path d="M22 22L24 16L26 22L32 24L26 26L24 32L22 26L16 24L22 22Z" fill="#f59e0b" />
      <path d="M102 18L103.5 13L105 18L110 19.5L105 21L103.5 26L102 21L97 19.5L102 18Z" fill="#10b981" />
      <path d="M112 55L113 51L114 55L118 56L114 57L113 61L112 57L108 56L112 55Z" fill="#f59e0b" />

      {/* Happy Puppy Face */}
      <g transform="translate(40, 16)">
        {/* Puppy Head */}
        <ellipse cx="32" cy="34" rx="24" ry="22" fill="#fbbf24" />
        
        {/* Muzzle */}
        <ellipse cx="32" cy="42" rx="16" ry="12" fill="#fef9c3" />
        
        {/* Nose */}
        <ellipse cx="32" cy="38" rx="5" ry="3.8" fill="#2d221e" />
        
        {/* Playful smiling eyes */}
        <path d="M20 28C22 25 26 25 28 28" stroke="#2d221e" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M36 28C38 25 42 25 44 28" stroke="#2d221e" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Rosy cheeks */}
        <circle cx="16" cy="36" r="3" fill="#fb7185" opacity="0.6" />
        <circle cx="48" cy="36" r="3" fill="#fb7185" opacity="0.6" />

        {/* Ears */}
        <path d="M12 22C6 30 5 44 11 48C16 50 19 44 18 35C17 26 14 20 12 22Z" fill="#d97706" />
        <path d="M52 22C58 30 59 44 53 48C48 50 45 44 46 35C47 26 50 20 52 22Z" fill="#d97706" />

        {/* Happy open tongue */}
        <path d="M29 44C31 47 33 47 35 44" stroke="#2d221e" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M30 46C31 51 33 51 34 46" fill="#f87171" />

        {/* Front cute paws */}
        <ellipse cx="20" cy="56" rx="6" ry="4.5" fill="#fbbf24" />
        <ellipse cx="44" cy="56" rx="6" ry="4.5" fill="#fbbf24" />
      </g>
    </svg>
  );
}
