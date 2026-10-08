import React from 'react';

export default function PetOwnerHeroArt() {
  return (
    <svg viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-scene-svg">
      {/* Background Soft Hills & Trees */}
      <path d="M-10 160C30 110 80 120 130 140C180 160 230 130 290 150V160H-10Z" fill="#cfe6d5" />
      <path d="M40 160C80 90 140 100 200 130C240 150 270 140 300 160H40Z" fill="#b9dbc2" opacity="0.7" />
      
      {/* Decorative Tree Foliage */}
      <circle cx="20" cy="95" r="28" fill="#a4ceb0" opacity="0.6" />
      <circle cx="45" cy="85" r="22" fill="#91c49f" opacity="0.7" />
      <circle cx="10" cy="115" r="18" fill="#81b890" opacity="0.5" />
      <rect x="25" y="115" width="6" height="40" rx="3" fill="#6d8a74" opacity="0.6" />

      {/* Gentle Floating Clouds */}
      <path d="M180 35C180 31 183 28 187 28C189 28 191 29 192 30C194 26 198 24 202 24C208 24 212 28 212 34C215 34 218 37 218 40C218 43 215 46 212 46H187C183 46 180 43 180 39V35Z" fill="#ffffff" opacity="0.75" />
      <path d="M60 25C60 22 62 20 65 20C67 20 68 21 69 22C71 18 75 16 79 16C84 16 88 19 88 24C91 24 93 26 93 29C93 32 91 34 88 34H65C62 34 60 32 60 29V25Z" fill="#ffffff" opacity="0.6" />

      {/* Sun / Warm Glow */}
      <circle cx="240" cy="30" r="18" fill="#fef3c7" opacity="0.8" />
      <circle cx="240" cy="30" r="26" fill="#fef3c7" opacity="0.3" />

      {/* Golden Retriever Dog */}
      <g transform="translate(130, 48)">
        {/* Dog Body */}
        <path d="M20 70C20 45 45 40 65 52C85 64 90 90 90 105C90 115 20 115 20 105V70Z" fill="#e59847" />
        {/* Chest highlight */}
        <path d="M35 65C45 60 60 65 65 80C70 95 65 110 50 110C40 110 32 95 35 65Z" fill="#f5c27f" />
        {/* Dog Neck & Head */}
        <ellipse cx="48" cy="38" rx="20" ry="22" fill="#e59847" />
        {/* Snout */}
        <ellipse cx="62" cy="42" rx="14" ry="12" fill="#f5c27f" />
        {/* Nose */}
        <ellipse cx="72" cy="40" rx="4.5" ry="3.5" fill="#2d221e" />
        {/* Eye */}
        <circle cx="52" cy="32" r="3.5" fill="#2d221e" />
        <circle cx="53" cy="31" r="1.2" fill="#ffffff" />
        {/* Floppy Ear */}
        <path d="M34 26C30 36 28 50 36 56C42 60 46 54 44 42C43 32 38 24 34 26Z" fill="#c77b32" />
        {/* Happy smile / tongue */}
        <path d="M64 47C66 53 70 54 72 50" stroke="#2d221e" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M66 50C68 56 71 56 73 51" fill="#f87171" />
        {/* Paw hugging */}
        <ellipse cx="28" cy="85" rx="8" ry="14" transform="rotate(-20 28 85)" fill="#e59847" />
      </g>

      {/* Illustrated Young Woman Hugging Dog */}
      <g transform="translate(68, 30)">
        {/* Woman Body / Sweater */}
        <path d="M35 80C25 80 15 95 10 120H75C70 98 60 80 50 80H35Z" fill="#4d7c5f" />
        {/* Collar */}
        <path d="M36 80C42 86 48 86 52 80" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        {/* Arms embracing dog */}
        <path d="M18 90C25 95 45 92 68 85C78 81 88 88 84 96C80 102 70 102 58 102C40 102 24 100 14 96Z" fill="#f6c2a0" />
        <path d="M12 90C20 95 38 98 52 98" stroke="#4d7c5f" strokeWidth="14" strokeLinecap="round" />
        
        {/* Woman Head & Neck */}
        <rect x="38" y="60" width="12" height="18" rx="4" fill="#f6c2a0" />
        <ellipse cx="44" cy="50" rx="16" ry="17" fill="#f6c2a0" />
        
        {/* Face features */}
        {/* Smiling eye */}
        <path d="M48 48C50 45 54 46 55 49" stroke="#372d25" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Rosy Cheek */}
        <circle cx="53" cy="54" r="3.5" fill="#fb7185" opacity="0.6" />
        {/* Sweet smile */}
        <path d="M47 56C51 59 55 58 57 55" stroke="#372d25" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        
        {/* Woman Hair */}
        <path d="M30 45C26 26 44 20 56 26C66 31 66 45 64 54C62 50 58 42 52 42C44 42 38 48 34 56C30 52 30 48 30 45Z" fill="#4a2e1b" />
        <path d="M26 45C22 62 25 80 34 85C36 78 35 68 32 58C30 52 28 48 26 45Z" fill="#4a2e1b" />
      </g>

      {/* Foreground Wildflowers & Grass */}
      <g transform="translate(0, 138)">
        <path d="M10 20L15 2L20 20" stroke="#407553" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M25 20L32 0L38 20" stroke="#407553" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="0" r="3" fill="#f59e0b" />
        
        <path d="M70 20L75 6L80 20" stroke="#407553" strokeWidth="2" strokeLinecap="round" />
        <circle cx="75" cy="5" r="2.5" fill="#ec4899" />

        <path d="M220 20L226 4L232 20" stroke="#407553" strokeWidth="2" strokeLinecap="round" />
        <circle cx="226" cy="3" r="3" fill="#f59e0b" />

        <path d="M245 20L250 8L255 20" stroke="#407553" strokeWidth="2" strokeLinecap="round" />
        <circle cx="250" cy="7" r="2.5" fill="#38bdf8" />

        <path d="M265 20L270 2L275 20" stroke="#407553" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Floating Little Hearts */}
      <path d="M125 36C125 33 128 30 131 32C134 30 137 33 137 36C137 40 131 44 131 44C131 44 125 40 125 36Z" fill="#ef4444" opacity="0.8" />
      <path d="M198 62C198 60 200 58 202 59C204 58 206 60 206 62C206 65 202 68 202 68C202 68 198 65 198 62Z" fill="#ef4444" opacity="0.6" />
    </svg>
  );
}
