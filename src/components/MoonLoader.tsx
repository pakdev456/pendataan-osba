import React from 'react';

interface MoonLoaderProps {
  title?: string;
  subtitle?: string;
}

export function OsbaLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="20" fill="black" />
      <circle cx="20" cy="20" r="13" fill="white" />
      <circle cx="25" cy="20" r="10" fill="black" />
    </svg>
  );
}

export function MoonLoader({ title = 'Sistem Pendataan OSBA', subtitle = 'Berpindah halaman' }: MoonLoaderProps) {
  return (
    <div className="fixed inset-0 bg-gray-100/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-32 h-32 rounded-full border-4 border-white border-t-black animate-spin" />
          <div className="w-28 h-28 rounded-full bg-black flex items-center justify-center shadow-inner">
            <OsbaLogo size={56} />
          </div>
        </div>

        <div className="text-center mt-1">
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
