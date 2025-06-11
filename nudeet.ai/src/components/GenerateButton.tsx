// components/GenerateButton.tsx - Updated to move button down
"use client"

import { Loader2 } from 'lucide-react'

interface GenerateButtonProps {
  isLoading: boolean;
  progress: number;
  disabled: boolean;
  onGenerate: () => void;
  onLegalClick: () => void;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  isLoading,
  progress,
  disabled,
  onGenerate,
  onLegalClick
}) => {
  return (
    <div className="lg:col-span-2 flex flex-col items-center">
      {/* FIXED: Align with Advanced Options button - specific positioning */}
      <div className="flex flex-col items-center" style={{ marginTop: '280px' }}>
        <button
          onClick={onGenerate}
          disabled={disabled}
          className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-5 px-10 rounded-xl disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed shadow-xl pulse-glow text-base transition-all"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </span>
          ) : (
            '🎯 GENERATE'
          )}
        </button>
        {isLoading && (
          <div className="w-48 bg-slate-700 h-3 rounded-full overflow-hidden mt-4 border border-slate-600 shadow-inner relative">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              {/* Moving highlight */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{
                  animation: 'shimmer 2s ease-in-out infinite',
                  transform: 'translateX(-100%)'
                }}
              ></div>
            </div>
          </div>
        )}
        {/* FIXED: Centered legal link */}
        <div className="w-full flex justify-center mt-6">
          <button
            onClick={onLegalClick}
            className="text-xs underline text-slate-400 hover:text-slate-200 transition-colors text-center"
          >
            Legal Information & Terms
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
};