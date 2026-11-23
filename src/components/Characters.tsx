import React from 'react';

interface CharacterProps {
  className?: string;
}

export const SunnyCharacter: React.FC<CharacterProps> = ({ className = 'w-20 h-20' }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="60" cy="60" r="34" fill="#FFBE1B" stroke="#D98000" strokeWidth="4" />
      <path d="M60 10v10M60 100v10M10 60h10M100 60h10M24 24l7 7M89 89l7 7M96 24l-7 7M31 89l-7 7" stroke="#FFA300" strokeWidth="6" />
      <circle cx="48" cy="54" r="4.5" fill="#24334F" />
      <circle cx="72" cy="54" r="4.5" fill="#24334F" />
      <circle cx="40" cy="64" r="4.5" fill="#FF7E6B" opacity="0.55" />
      <circle cx="80" cy="64" r="4.5" fill="#FF7E6B" opacity="0.55" />
      <path d="M48 68c4 6 20 6 24 0" stroke="#24334F" strokeWidth="4" />
      <g transform="translate(82 68)">
        <rect x="0" y="6" width="20" height="22" rx="9" fill="#FFF1B8" stroke="#D98000" strokeWidth="3" />
        <path d="M4 8V-4M10 6V-6M18 14l7-6" stroke="#D98000" strokeWidth="3.5" />
      </g>
    </g>
  </svg>
);

export const LumiCharacter: React.FC<CharacterProps> = ({ className = 'w-20 h-20' }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    <path d="M24 44 L36 16 L54 34 Z" fill="#FF9800" stroke="#24334F" strokeWidth="3.5" strokeLinejoin="round" />
    <path d="M96 44 L84 16 L66 34 Z" fill="#FF9800" stroke="#24334F" strokeWidth="3.5" strokeLinejoin="round" />
    <ellipse cx="60" cy="66" rx="38" ry="34" fill="#FFA300" stroke="#24334F" strokeWidth="3.5" />
    <path d="M26 68 Q60 98 94 68 Q94 98 60 100 Q26 98 26 68 Z" fill="#FFFDF7" />
    <circle cx="46" cy="58" r="4.5" fill="#24334F" />
    <circle cx="74" cy="58" r="4.5" fill="#24334F" />
    <polygon points="56,67 64,67 60,73" fill="#24334F" />
    <path d="M52 78c4 4 12 4 16 0" fill="none" stroke="#24334F" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="37" cy="67" r="4.5" fill="#FF7E6B" opacity="0.5" />
    <circle cx="83" cy="67" r="4.5" fill="#FF7E6B" opacity="0.5" />
  </svg>
);

export const PipCharacter: React.FC<CharacterProps> = ({ className = 'w-20 h-20' }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    <circle cx="32" cy="30" r="14" fill="#078F89" stroke="#24334F" strokeWidth="3.5" />
    <circle cx="88" cy="30" r="14" fill="#078F89" stroke="#24334F" strokeWidth="3.5" />
    <circle cx="60" cy="64" r="38" fill="#FFFFFF" stroke="#24334F" strokeWidth="3.5" />
    <ellipse cx="44" cy="58" rx="10" ry="12" transform="rotate(-12 44 58)" fill="#078F89" />
    <ellipse cx="76" cy="58" rx="10" ry="12" transform="rotate(12 76 58)" fill="#078F89" />
    <circle cx="45" cy="57" r="4" fill="#FFFFFF" />
    <circle cx="75" cy="57" r="4" fill="#FFFFFF" />
    <ellipse cx="60" cy="70" rx="6" ry="4" fill="#24334F" />
    <path d="M51 79c4 5 14 5 18 0" fill="none" stroke="#24334F" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

export const CocoCharacter: React.FC<CharacterProps> = ({ className = 'w-20 h-20' }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    <path d="M22 72 Q22 30 64 28 Q98 28 98 62 Q98 92 60 92 Q28 92 22 72 Z" fill="#438CE4" stroke="#24334F" strokeWidth="3.5" />
    <path d="M40 31 Q55 18 72 28" fill="none" stroke="#FFBE1B" strokeWidth="6" strokeLinecap="round" />
    <circle cx="72" cy="54" r="12" fill="#FFFFFF" stroke="#24334F" strokeWidth="3" />
    <circle cx="74" cy="54" r="5" fill="#24334F" />
    <circle cx="38" cy="64" r="6" fill="#FFBE1B" />
    <circle cx="52" cy="72" r="5" fill="#36A66B" />
    <path d="M68 74c6 5 16 4 21-2" fill="none" stroke="#24334F" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);
