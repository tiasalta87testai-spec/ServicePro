import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | number;
  showText?: boolean;
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const pixelSize = typeof size === 'number' ? size : {
    sm: 24,
    md: 32,
    lg: 48,
  }[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/icon.png" 
        alt="ServicePro Logo" 
        width={pixelSize} 
        height={pixelSize} 
        className="rounded-lg shadow-sm"
      />
      {showText && (
        <span className="font-bold tracking-tight text-inherit">
          Service<span className="text-teal-400">Pro</span>
        </span>
      )}
    </div>
  );
}
