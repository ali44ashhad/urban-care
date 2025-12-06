import React from "react";

export default function LoadingSpinner({
  size = 48,
  text = "Loading...",
  showText = false,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-4 border-white/20"
        ></div>

        {/* Spinning gradient ring */}
        <div
          className="absolute inset-0 rounded-full border-4 border-t-transparent 
          border-l-transparent animate-spin
          border-r-blue-500 border-b-purple-500"
        ></div>

        {/* Glow center */}
        <div
          className="absolute w-1/2 h-1/2 rounded-full bg-gradient-to-br 
          from-blue-500/40 to-purple-500/30 blur-md"
        ></div>
      </div>

      {/* Optional text */}
      {showText && (
        <div className="mt-3 text-sm font-medium text-gray-600">{text}</div>
      )}
    </div>
  );
}
