import React from 'react';

export default function RescuerHeroArt() {
  return (
    <svg viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-scene-svg">
      {/* Background Soft Hills & Horizon */}
      <path d="M-10 160C40 100 100 115 160 135C210 150 250 125 300 150V160H-10Z" fill="#cbe3d2" />
      <path d="M30 160C90 85 160 105 210 130C250 148 280 135 300 160H30Z" fill="#b3d9be" opacity="0.75" />

      {/* Nature Trees & Mountain Silhouettes */}
      <circle cx="25" cy="85" r="26" fill="#9ecdb0" opacity="0.6" />
      <circle cx="48" cy="75" r="20" fill="#8bc29e" opacity="0.7" />
      <circle cx="15" cy="105" r="16" fill="#7ab890" opacity="0.5" />
      <rect x="32" y="105" width="5" height="45" rx="2" fill="#5a7d65" opacity="0.6" />

      {/* Floating Clouds & Sky */}
      <path d="M190 28C190 25 192 23 195 23C197 23 198 24 199 25C201 22 204 20 208 20C213 20 216 23 216 28C219 28 221 30 221 33C221 36 219 38 216 38H195C192 38 190 35 190 32V28Z" fill="#ffffff" opacity="0.8" />
      <path d="M70 18C70 15 72 13 75 13C76 13 77 14 78 15C80 12 83 10 87 10C91 10 94 13 94 17C97 17 99 19 99 22C99 25 97 27 94 27H75C72 27 70 25 70 22V18Z" fill="#ffffff" opacity="0.65" />

      {/* Sun / Daylight */}
      <circle cx="245" cy="25" r="16" fill="#fef3c7" opacity="0.85" />
      <circle cx="245" cy="25" r="24" fill="#fef3c7" opacity="0.3" />

      {/* Rescuer Backpack */}
      <g transform="translate(62, 52)">
        <rect x="0" y="24" width="22" height="32" rx="7" fill="#2d6a4f" />
        <rect x="3" y="18" width="16" height="10" rx="4" fill="#1b4332" />
        <path d="M4 35H18" stroke="#40916c" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M4 44H18" stroke="#40916c" strokeWidth="2.5" strokeLinecap="round" />
        {/* Sleeping mat / bedroll on top */}
        <rect x="1" y="10" width="20" height="7" rx="3" fill="#d97706" />
      </g>

      {/* Rescuer (kneeling, caring posture) */}
      <g transform="translate(75, 38)">
        {/* Legs / Jeans Kneeling */}
        <path d="M22 85C20 95 10 108 5 116H48C46 106 38 95 32 85H22Z" fill="#3b5368" />
        <path d="M5 116H25C25 116 28 110 32 110C36 110 40 116 48 116" stroke="#233544" strokeWidth="3" strokeLinecap="round" />
        
        {/* Torso / Outdoor Jacket */}
        <path d="M18 52C14 62 16 75 20 86H44C46 75 48 62 42 52H18Z" fill="#2d6a4f" />
        
        {/* Arm extending forward to pet dog */}
        <path d="M38 58C46 65 60 72 74 72C78 72 82 76 80 80C77 84 72 84 65 82C52 80 40 76 34 70" fill="#f4b590" />
        <path d="M36 58C44 65 54 70 66 70" stroke="#2d6a4f" strokeWidth="9" strokeLinecap="round" />

        {/* Head & Neck */}
        <rect x="22" y="38" width="10" height="14" rx="3" fill="#f4b590" />
        <ellipse cx="27" cy="30" rx="13" ry="14" fill="#f4b590" />
        
        {/* Friendly eyes looking at dog */}
        <path d="M32 29C34 27 37 28 38 30" stroke="#2b231d" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Warm smile */}
        <path d="M31 36C34 39 38 38 40 35" stroke="#2b231d" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <circle cx="35" cy="34" r="2.5" fill="#f87171" opacity="0.5" />

        {/* Rescuer Cap / Hair */}
        <path d="M16 25C18 14 36 12 41 22C43 25 43 28 41 31C39 27 34 23 27 24C21 24 18 28 16 25Z" fill="#2b231d" />
        <path d="M22 17C26 12 38 12 43 17C46 20 48 23 48 24C44 24 38 21 34 21C28 21 24 23 22 25V17Z" fill="#1b4332" />
        <path d="M34 21L48 24" stroke="#1b4332" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Happy Rescued Dog Looking Up at Rescuer */}
      <g transform="translate(155, 62)">
        {/* Dog Body */}
        <path d="M25 60C25 45 42 38 58 48C72 56 75 75 75 92H15C15 80 25 72 25 60Z" fill="#e09748" />
        {/* Chest white patch */}
        <path d="M22 62C28 58 40 60 45 74C48 85 42 92 30 92C24 92 20 82 22 62Z" fill="#fde68a" />
        
        {/* Dog Head looking left toward Rescuer */}
        <ellipse cx="22" cy="34" rx="17" ry="18" fill="#e09748" />
        <ellipse cx="10" cy="38" rx="12" ry="10" fill="#fde68a" />
        <ellipse cx="3" cy="36" rx="4" ry="3" fill="#1f1815" />
        
        {/* Attentive, grateful eye */}
        <circle cx="17" cy="28" r="3.2" fill="#1f1815" />
        <circle cx="18" cy="27" r="1.1" fill="#ffffff" />
        
        {/* Floppy ear */}
        <path d="M32 24C36 32 38 44 32 49C28 52 24 47 26 38C27 30 30 22 32 24Z" fill="#b45309" />
        
        {/* Happy smile & wagging tail */}
        <path d="M8 43C12 47 16 46 18 42" stroke="#1f1815" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M10 46C12 50 15 50 17 46" fill="#f87171" />
        {/* Tail wagging up */}
        <path d="M72 70C82 62 88 50 86 42" stroke="#e09748" strokeWidth="6" strokeLinecap="round" />
      </g>

      {/* Ground Wildflowers & Grass */}
      <g transform="translate(0, 140)">
        <path d="M15 18L20 2L25 18" stroke="#3b6b4c" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M35 18L40 4L45 18" stroke="#3b6b4c" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="40" cy="3" r="2.5" fill="#f59e0b" />

        <path d="M130 18L136 6L142 18" stroke="#3b6b4c" strokeWidth="2" strokeLinecap="round" />
        <circle cx="136" cy="5" r="2.5" fill="#ef4444" />

        <path d="M235 18L240 2L245 18" stroke="#3b6b4c" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="240" cy="1" r="3" fill="#10b981" />

        <path d="M260 18L265 6L270 18" stroke="#3b6b4c" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Floating Paw & Little Hearts */}
      <g transform="translate(242, 60)" opacity="0.8">
        <circle cx="10" cy="12" r="5" fill="#2d6a4f" />
        <circle cx="4" cy="4" r="2.5" fill="#2d6a4f" />
        <circle cx="10" cy="2" r="2.5" fill="#2d6a4f" />
        <circle cx="16" cy="4" r="2.5" fill="#2d6a4f" />
      </g>
      <path d="M142 42C142 39 145 37 148 39C151 37 154 39 154 42C154 46 148 50 148 50C148 50 142 46 142 42Z" fill="#ef4444" opacity="0.85" />
    </svg>
  );
}
