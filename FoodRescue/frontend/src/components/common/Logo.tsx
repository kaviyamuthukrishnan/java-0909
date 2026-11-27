import React from 'react';

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

export function Logo({ className = '', inverted = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          width="32"
          height="32"
          rx="8"
          fill={inverted ? '#22C55E' : '#14532D'}
        />
        <path
          d="M10.5 7.5V14.5C10.5 16.1569 11.8431 17.5 13.5 17.5V24.5"
          stroke={inverted ? '#0F291A' : '#FFFFFF'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8.5 7.5V12C8.5 13.3807 9.61929 14.5 11 14.5H13.5"
          stroke={inverted ? '#0F291A' : '#FFFFFF'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M17.5 23.5C17.5 17 20.5 11.5 24.5 8.5C24.5 14.5 22.5 19.5 17.5 23.5Z"
          fill="#F97316"
          stroke={inverted ? '#0F291A' : '#FFFFFF'}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`font-display text-lg font-bold tracking-tight ${
          inverted ? 'text-white' : 'text-[#14532D]'
        }`}
      >
        FoodRescue
      </span>
    </span>
  );
}
