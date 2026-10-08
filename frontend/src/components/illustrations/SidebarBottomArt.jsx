import React from 'react';

export default function SidebarBottomArt({ role = 'PET_OWNER' }) {
  const isRescuer = role === 'RESCUER';

  if (isRescuer) {
    return (
      <div className="sidebar-illustrated-footer">
        <div className="sidebar-handwritten-quote">
          <p>Rescue</p>
          <p>Rehabilitate</p>
          <p>Reunite <span className="heart-pink">♥</span></p>
        </div>
        <div className="sidebar-art-container">
          <svg viewBox="0 0 160 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-art-svg">
            {/* Soft decorative background leaf shapes */}
            <path d="M10 130C15 90 40 85 50 130" fill="#a7d7b5" opacity="0.6" />
            <path d="M130 130C125 80 95 80 85 130" fill="#8ec59f" opacity="0.5" />
            <circle cx="20" cy="115" r="14" fill="#c3e6cd" opacity="0.5" />
            <circle cx="140" cy="110" r="16" fill="#c3e6cd" opacity="0.5" />
            
            {/* Kneeling Rescuer silhouette/drawing */}
            <g transform="translate(20, 20)">
              {/* Rescuer Head */}
              <circle cx="45" cy="22" r="11" fill="#4d6b53" />
              {/* Back / Body */}
              <path d="M42 33C30 40 22 55 18 85H58C55 60 52 45 42 33Z" fill="#35523b" />
              {/* Arm reaching toward dog */}
              <path d="M38 48C45 52 56 56 68 56" stroke="#4d6b53" strokeWidth="6" strokeLinecap="round" />
            </g>

            {/* Little Dog sitting facing rescuer */}
            <g transform="translate(85, 48)">
              {/* Body */}
              <path d="M15 40C15 28 26 22 36 28C44 34 46 45 46 58H10C10 50 15 45 15 40Z" fill="#698570" />
              {/* Head */}
              <circle cx="18" cy="22" r="9" fill="#698570" />
              <ellipse cx="12" cy="24" rx="6" ry="5" fill="#8ca893" />
              {/* Ear */}
              <path d="M22 15C25 18 26 25 22 28" stroke="#4d6b53" strokeWidth="3" strokeLinecap="round" />
              {/* Tail */}
              <path d="M44 48C50 44 54 36 52 30" stroke="#698570" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* Little grass blades */}
            <path d="M5 130L8 120L11 130" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" />
            <path d="M75 130L78 118L81 130" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" />
            <path d="M148 130L151 122L154 130" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-illustrated-footer">
      <div className="sidebar-handwritten-quote">
        <p>Better care</p>
        <p>for happier</p>
        <p>animals <span className="heart-pink">♥</span></p>
      </div>
      <div className="sidebar-art-container">
        <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-art-svg">
          {/* Foliage / Leaves behind */}
          <path d="M8 120C12 75 35 70 42 120" fill="#a7d7b5" opacity="0.6" />
          <path d="M135 120C130 75 105 70 98 120" fill="#8ec59f" opacity="0.5" />
          <circle cx="15" cy="105" r="12" fill="#c3e6cd" opacity="0.6" />
          <circle cx="145" cy="102" r="14" fill="#c3e6cd" opacity="0.6" />

          {/* Golden Dog sitting (left) */}
          <g transform="translate(18, 15)">
            {/* Body */}
            <path d="M22 65C22 42 42 38 56 48C68 56 70 78 70 95H15C15 85 22 75 22 65Z" fill="#e59847" />
            {/* Chest lighter patch */}
            <path d="M25 68C32 60 48 62 52 76C54 86 46 95 35 95C26 95 24 85 25 68Z" fill="#fde68a" />
            
            {/* Head */}
            <ellipse cx="44" cy="34" rx="18" ry="19" fill="#e59847" />
            {/* Snout */}
            <ellipse cx="44" cy="42" rx="13" ry="11" fill="#fde68a" />
            {/* Nose */}
            <ellipse cx="44" cy="38" rx="4.5" ry="3.5" fill="#2d221e" />
            {/* Eyes */}
            <circle cx="36" cy="30" r="2.8" fill="#2d221e" />
            <circle cx="52" cy="30" r="2.8" fill="#2d221e" />
            <circle cx="37" cy="29" r="1" fill="#ffffff" />
            <circle cx="53" cy="29" r="1" fill="#ffffff" />
            
            {/* Floppy Ears */}
            <path d="M28 25C22 32 20 44 25 50C29 52 32 46 32 38C32 30 30 24 28 25Z" fill="#c77b32" />
            <path d="M60 25C66 32 68 44 63 50C59 52 56 46 56 38C56 30 58 24 60 25Z" fill="#c77b32" />

            {/* Happy Dog Smile */}
            <path d="M40 44C42 47 46 47 48 44" stroke="#2d221e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M42 46C43 49 45 49 46 46" fill="#f87171" />
          </g>

          {/* Cute Tuxedo Cat sitting closely (right) */}
          <g transform="translate(82, 38)">
            {/* Cat Body */}
            <path d="M18 50C18 35 32 30 42 38C50 44 52 60 52 74H12C12 65 18 58 18 50Z" fill="#2d3748" />
            {/* Cat White Chest bib */}
            <path d="M22 48C26 42 36 44 38 54C40 64 34 74 26 74C20 74 20 62 22 48Z" fill="#ffffff" />

            {/* Cat Head */}
            <ellipse cx="32" cy="25" rx="14" ry="13" fill="#2d3748" />
            
            {/* Cat Ears */}
            <polygon points="21,18 25,6 30,17" fill="#2d3748" />
            <polygon points="23,16 25,9 28,16" fill="#fbcfe8" />
            <polygon points="34,17 39,6 43,18" fill="#2d3748" />
            <polygon points="36,16 39,9 41,16" fill="#fbcfe8" />

            {/* Cat Eyes (green/amber) */}
            <ellipse cx="26" cy="24" rx="2.5" ry="3.5" fill="#a3e635" />
            <ellipse cx="38" cy="24" rx="2.5" ry="3.5" fill="#a3e635" />
            <circle cx="26" cy="24" r="1.5" fill="#1e293b" />
            <circle cx="38" cy="24" r="1.5" fill="#1e293b" />
            
            {/* Cat Nose & Mouth */}
            <polygon points="31,28 33,28 32,30" fill="#f472b6" />
            <path d="M30 30C31 32 32 32 32 30C32 32 33 32 34 30" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" fill="none" />
            
            {/* Whiskers */}
            <line x1="20" y1="28" x2="13" y2="27" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="20" y1="30" x2="14" y2="31" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="44" y1="28" x2="51" y2="27" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="44" y1="30" x2="50" y2="31" stroke="#cbd5e1" strokeWidth="0.8" />

            {/* Cat Curled Tail */}
            <path d="M48 65C58 60 62 48 58 42" stroke="#2d3748" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Grass foreground details */}
          <path d="M12 120L15 110L18 120" stroke="#3b6b4c" strokeWidth="2" strokeLinecap="round" />
          <path d="M50 120L53 112L56 120" stroke="#3b6b4c" strokeWidth="2" strokeLinecap="round" />
          <circle cx="53" cy="111" r="2" fill="#f59e0b" />
          <path d="M110 120L113 110L116 120" stroke="#3b6b4c" strokeWidth="2" strokeLinecap="round" />
          <circle cx="113" cy="109" r="2" fill="#ec4899" />
          <path d="M142 120L145 112L148 120" stroke="#3b6b4c" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
