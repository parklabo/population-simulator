'use client';

import { useState, useEffect } from 'react';
import { CountryData } from '@/lib/world-data';

interface GlobeFlagModeProps {
  isEnabled: boolean;
  onToggle: () => void;
  selectedCountry: CountryData | null;
}

export default function GlobeFlagMode({ isEnabled, onToggle, selectedCountry }: GlobeFlagModeProps) {
  const [displayMode, setDisplayMode] = useState<'flags' | 'dots' | 'both'>('dots');
  const [flagSize, setFlagSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  useEffect(() => {
    // Performance optimization: limit flags for mobile
    if (window.innerWidth < 768 && displayMode === 'flags') {
      setShowCriticalOnly(true);
    }
  }, [displayMode]);

  return (
    <div className="absolute top-4 right-4 z-20">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={onToggle}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              isEnabled 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                : 'bg-gray-700/50 text-gray-400 border border-gray-600'
            }`}
          >
            {isEnabled ? '🏳️ Flags ON' : '⚪ Dots'}
          </button>
        </div>

        {isEnabled && (
          <div className="space-y-2 mt-3 border-t border-cyan-500/20 pt-3">
            {/* Display Mode */}
            <div className="text-xs text-gray-400">Display Mode:</div>
            <div className="flex gap-1">
              <button
                onClick={() => setDisplayMode('flags')}
                className={`px-2 py-1 text-xs rounded ${
                  displayMode === 'flags' 
                    ? 'bg-cyan-500/30 text-cyan-300' 
                    : 'bg-gray-700/30 text-gray-500'
                }`}
              >
                Flags Only
              </button>
              <button
                onClick={() => setDisplayMode('both')}
                className={`px-2 py-1 text-xs rounded ${
                  displayMode === 'both' 
                    ? 'bg-cyan-500/30 text-cyan-300' 
                    : 'bg-gray-700/30 text-gray-500'
                }`}
              >
                Both
              </button>
              <button
                onClick={() => setDisplayMode('dots')}
                className={`px-2 py-1 text-xs rounded ${
                  displayMode === 'dots' 
                    ? 'bg-cyan-500/30 text-cyan-300' 
                    : 'bg-gray-700/30 text-gray-500'
                }`}
              >
                Dots
              </button>
            </div>

            {/* Flag Size */}
            {(displayMode === 'flags' || displayMode === 'both') && (
              <>
                <div className="text-xs text-gray-400 mt-2">Flag Size:</div>
                <div className="flex gap-1">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setFlagSize(size)}
                      className={`px-2 py-1 text-xs rounded capitalize ${
                        flagSize === size 
                          ? 'bg-cyan-500/30 text-cyan-300' 
                          : 'bg-gray-700/30 text-gray-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Performance Mode */}
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCriticalOnly}
                onChange={(e) => setShowCriticalOnly(e.target.checked)}
                className="w-3 h-3 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
              />
              <span className="text-xs text-gray-400">
                Critical countries only (better performance)
              </span>
            </label>

            {/* Selected Country Info */}
            {selectedCountry && (
              <div className="mt-3 pt-3 border-t border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedCountry.flag}</span>
                  <div>
                    <div className="text-xs text-cyan-400 font-bold">
                      {selectedCountry.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Birth Rate: {selectedCountry.birthRate}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to generate flag HTML elements
export function createFlagElement(country: CountryData, size: 'small' | 'medium' | 'large') {
  const sizeMap = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl'
  };

  const glowColors = {
    critical: 'shadow-red-500/50',
    warning: 'shadow-orange-500/50',
    stable: 'shadow-green-500/50'
  };

  const status = country.birthRate < 1.5 ? 'critical' : 
                 country.birthRate < 2.1 ? 'warning' : 'stable';

  return `
    <div class="flag-container relative">
      <div class="${sizeMap[size]} flag-emoji animate-pulse-slow">
        ${country.flag}
      </div>
      <div class="absolute inset-0 rounded-full blur-xl ${glowColors[status]} opacity-50"></div>
      ${status === 'critical' ? '<div class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>' : ''}
    </div>
  `;
}

// Export configuration for the globe
export function getFlagConfiguration(
  displayMode: 'flags' | 'dots' | 'both',
  flagSize: 'small' | 'medium' | 'large',
  showCriticalOnly: boolean
) {
  return {
    displayMode,
    flagSize,
    showCriticalOnly,
    // Size multipliers for different modes
    sizeMultiplier: {
      small: 0.8,
      medium: 1.0,
      large: 1.3
    }[flagSize],
    // Filter function for performance
    filterCountries: (countries: CountryData[]) => {
      if (!showCriticalOnly) return countries;
      return countries.filter(c => c.birthRate < 2.1);
    }
  };
}