import React from 'react';

export default function ReportBannerArt() {
  return (
    <svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="banner-art-svg">
      {/* Background soft sun glow */}
      <circle cx="80" cy="50" r="42" fill="#fed7aa" opacity="0.35" />
      <circle cx="95" cy="35" r="22" fill="#fde68a" opacity="0.5" />

      {/* Decorative leaf shapes */}
      <path d="M10 100C15 65 35 60 45 100" fill="#a7d7b5" opacity="0.7" />
      <path d="M120 100C115 60 95 65 85 100" fill="#8ec59f" opacity="0.6" />

      {/* Little Golden Puppy Peeking */}
      <g transform="translate(42, 18)">
        {/* Puppy Head */}
        <ellipse cx="36" cy="36" rx="26" ry="25" fill="#f59e0b" />
        
        {/* Lighter muzzle area */}
        <ellipse cx="36" cy="45" rx="18" ry="14" fill="#fef3c7" />
        
        {/* Cute dark nose */}
        <ellipse cx="36" cy="40" rx="5.5" ry="4" fill="#2d221e" />
        
        {/* Big curious eyes with catchlights */}
        <circle cx="25" cy="30" r="4" fill="#2d221e" />
        <circle cx="26" cy="28.5" r="1.5" fill="#ffffff" />
        <circle cx="47" cy="30" r="4" fill="#2d221e" />
        <circle cx="48" cy="28.5" r="1.5" fill="#ffffff" />

        {/* Rosy blush cheeks */}
        <circle cx="18" cy="40" r="3.5" fill="#fb7185" opacity="0.5" />
        <circle cx="54" cy="40" r="3.5" fill="#fb7185" opacity="0.5" />

        {/* Cute floppy puppy ears */}
        <path d="M14 25C8 34 5 50 12 55C18 58 22 50 21 40C20 30 16 22 14 25Z" fill="#d97706" />
        <path d="M58 25C64 34 67 50 60 55C54 58 50 50 51 40C52 30 56 22 58 25Z" fill="#d97706" />

        {/* Smiling mouth & tongue */}
        <path d="M32 46C34 50 38 50 40 46" stroke="#2d221e" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M34 49C36 53 38 53 39 49" fill="#f87171" />

        {/* Little Paws resting on bottom edge */}
        <ellipse cx="22" cy="62" rx="7" ry="5" fill="#f59e0b" />
        <ellipse cx="50" cy="62" rx="7" ry="5" fill="#f59e0b" />
      </g>

      {/* Foreground grass / leaves hiding body */}
      <path d="M25 100C30 80 45 80 50 100" fill="#4d7c5f" />
      <path d="M65 100C72 78 88 80 92 100" fill="#407553" />
      <path d="M100 100C106 82 120 85 125 100" fill="#4d7c5f" />
      <circle cx="35" cy="85" r="2.5" fill="#f59e0b" />
      <circle cx="115" cy="88" r="2.5" fill="#ec4899" />
    </svg>
  );
}
