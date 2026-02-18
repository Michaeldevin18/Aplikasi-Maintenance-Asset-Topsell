import React from 'react';

export const TopsellLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background Shape - Red Geometric Container */}
    <path 
      d="M10 10 H90 V30 L90 90 H10 V10 Z" 
      fill="#E60012" 
      stroke="#E60012" 
      strokeWidth="2"
      strokeLinejoin="round"
    />
    
    {/* The T Shape - White Negative Space with "Folded" look */}
    {/* Vertical Stem */}
    <path d="M40 35 H60 V80 H40 V35 Z" fill="white" />
    {/* Top Bar with angular cuts */}
    <path d="M20 20 H80 V35 H65 L60 40 H40 L35 35 H20 V20 Z" fill="white" />
    
    {/* Angular accents/highlights to give depth */}
    <path d="M20 20 L35 35" stroke="#E60012" strokeWidth="1" />
    <path d="M80 20 L65 35" stroke="#E60012" strokeWidth="1" />
  </svg>
);
