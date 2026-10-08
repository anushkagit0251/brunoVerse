import React from 'react';

export default function RescueBannerArt() {
  return (
    <svg viewBox="0 0 200 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="banner-art-svg">
      {/* Background Soft Green Landscape */}
      <path d="M0 90C40 60 90 65 140 75C170 82 185 75 200 85V90H0Z" fill="#a4ceb0" opacity="0.6" />
      <path d="M20 90C60 50 120 55 170 70C190 76 195 72 200 90H20Z" fill="#81b890" opacity="0.4" />

      {/* Silhouetted Animals in nature */}
      <g transform="translate(60, 15)">
        {/* Large Dog Silhouette lying down or attentive */}
        <path d="M55 58C55 45 68 40 78 46C86 52 90 64 88 74H35C35 68 42 62 48 60C50 52 54 48 55 58Z" fill="#3b5e47" />
        {/* Head */}
        <circle cx="76" cy="38" r="10" fill="#3b5e47" />
        <ellipse cx="83" cy="40" rx="6" ry="4" fill="#3b5e47" />
        {/* Ears */}
        <path d="M72 32C71 25 76 22 78 28" stroke="#3b5e47" strokeWidth="3" strokeLinecap="round" />
        <path d="M80 32C81 26 85 24 86 29" stroke="#3b5e47" strokeWidth="2.5" strokeLinecap="round" />

        {/* Small Cat Silhouette sitting beside dog */}
        <path d="M96 52C96 44 103 40 108 45C112 50 114 62 112 74H92C92 66 96 60 96 52Z" fill="#2d4837" />
        <circle cx="104" cy="36" r="7" fill="#2d4837" />
        {/* Pointy ears */}
        <polygon points="99,32 101,25 104,31" fill="#2d4837" />
        <polygon points="106,31 108,25 111,32" fill="#2d4837" />
        {/* Curled tail */}
        <path d="M112 66C118 62 120 54 117 48" stroke="#2d4837" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Bird flying high */}
      <path d="M165 24C168 20 172 21 175 25C178 21 182 20 185 24" stroke="#40634c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M178 14C180 11 183 12 185 15C187 12 190 11 192 14" stroke="#40634c" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Grassy detail blades */}
      <path d="M15 90L18 80L21 90" stroke="#3b5e47" strokeWidth="2" strokeLinecap="round" />
      <path d="M45 90L48 78L51 90" stroke="#3b5e47" strokeWidth="2" strokeLinecap="round" />
      <path d="M140 90L143 82L146 90" stroke="#3b5e47" strokeWidth="2" strokeLinecap="round" />
      <path d="M185 90L188 80L191 90" stroke="#3b5e47" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
