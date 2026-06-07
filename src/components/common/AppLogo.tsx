/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AppLogoProps {
  className?: string;
  variant?: 'icon-only' | 'full' | 'inline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AppLogo({ className = '', variant = 'full', size = 'md' }: AppLogoProps) {
  // Size presets
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const currentSize = sizeClasses[size];

  // The custom geometric vector symbol representing the brand logo "M"
  const logoSymbol = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Upper M-Frame and Diagonals as a single solid vector to eliminate cracks */}
      <path
        d="M 20,20 L 32,20 L 32,32 L 50,50 L 80,20 L 80,80 L 68,80 L 68,50 L 50,68 L 32,50 L 32,80 L 20,80 Z"
        fill="currentColor"
      />

      {/* Nested lower chevron pointing down extending to the bottom floor */}
      <path
        d="M 38,62 L 50,74 L 62,62 L 62,68 L 50,80 L 38,68 Z"
        fill="currentColor"
      />
    </svg>
  );

  if (variant === 'icon-only') {
    return (
      <div className={`${currentSize} ${className} text-emerald-400`}>
        {logoSymbol}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`${currentSize} ${className} text-zinc-100`}>
        {logoSymbol}
      </div>
    );
  }

  // 'full' variant: Logo on the dark emerald solid background as requested in the image upload
  return (
    <div 
      className={`${currentSize} ${className} bg-[#076449] flex items-center justify-center rounded-2xl select-none p-1.5 shadow-[0_4px_20px_rgba(7,100,73,0.3)] border border-emerald-400/20`}
    >
      <div className="w-full h-full text-white">
        {logoSymbol}
      </div>
    </div>
  );
}
