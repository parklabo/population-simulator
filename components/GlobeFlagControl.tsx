'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CountryData } from '@/lib/world-data';

interface GlobeFlagControlProps {
  onModeChange: (mode: 'dots' | 'flags' | 'both') => void;
  onSizeChange: (size: 'small' | 'medium' | 'large') => void;
  onPerformanceToggle: (enabled: boolean) => void;
  selectedCountry: CountryData | null;
}

export default function GlobeFlagControl({ 
  onModeChange, 
  onSizeChange, 
  onPerformanceToggle,
  selectedCountry 
}: GlobeFlagControlProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayMode, setDisplayMode] = useState<'dots' | 'flags' | 'both'>('dots');
  const [flagSize, setFlagSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [performanceMode, setPerformanceMode] = useState(false);

  const handleModeChange = (mode: 'dots' | 'flags' | 'both') => {
    setDisplayMode(mode);
    onModeChange(mode);
  };

  const handleSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFlagSize(size);
    onSizeChange(size);
  };

  const handlePerformanceToggle = () => {
    setPerformanceMode(!performanceMode);
    onPerformanceToggle(!performanceMode);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center text-2xl hover:shadow-xl transition-shadow"
      >
        <motion.span
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {displayMode === 'dots' ? '⚪' : displayMode === 'flags' ? '🏳️' : '🌐'}
        </motion.span>
      </motion.button>

      {/* Control Panel */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-44 right-4 z-50 w-80 bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-4 border-b border-cyan-500/30">
                <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                  <span className="text-2xl">🌍</span>
                  Globe Display Settings
                </h3>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Display Mode - Large Visual Buttons */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Display Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleModeChange('dots')}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        displayMode === 'dots'
                          ? 'border-cyan-500 bg-cyan-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-3xl mb-1">⚪</div>
                      <div className="text-xs font-medium">Dots</div>
                      {displayMode === 'dots' && (
                        <motion.div
                          layoutId="mode-indicator"
                          className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"
                        />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleModeChange('flags')}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        displayMode === 'flags'
                          ? 'border-cyan-500 bg-cyan-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-3xl mb-1">🏳️</div>
                      <div className="text-xs font-medium">Flags</div>
                      {displayMode === 'flags' && (
                        <motion.div
                          layoutId="mode-indicator"
                          className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"
                        />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleModeChange('both')}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        displayMode === 'both'
                          ? 'border-cyan-500 bg-cyan-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-3xl mb-1">🌐</div>
                      <div className="text-xs font-medium">Both</div>
                      {displayMode === 'both' && (
                        <motion.div
                          layoutId="mode-indicator"
                          className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"
                        />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Flag Size - Only show when flags are enabled */}
                {(displayMode === 'flags' || displayMode === 'both') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <label className="text-sm text-gray-400 mb-2 block">Flag Size</label>
                    <div className="flex gap-2">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <motion.button
                          key={size}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSizeChange(size)}
                          className={`flex-1 py-2 px-3 rounded-lg capitalize transition-all ${
                            flagSize === size
                              ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500'
                              : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          {size === 'small' && '🏳️'}
                          {size === 'medium' && '🏳️‍🌈'}
                          {size === 'large' && '🏴'}
                          <span className="ml-2 text-xs font-medium">{size}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Performance Mode - Toggle Switch */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-300">Performance Mode</div>
                    <div className="text-xs text-gray-500">Show critical countries only</div>
                  </div>
                  <button
                    onClick={handlePerformanceToggle}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      performanceMode ? 'bg-cyan-500' : 'bg-gray-700'
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                      animate={{ x: performanceMode ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Selected Country Info */}
                {selectedCountry && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedCountry.flag}</span>
                      <div className="flex-1">
                        <div className="font-bold text-cyan-400">{selectedCountry.name}</div>
                        <div className="text-xs text-gray-400">
                          Pop: {selectedCountry.population.toFixed(1)}M | 
                          Birth Rate: <span className={selectedCountry.birthRate < 1.5 ? 'text-red-400' : 'text-green-400'}>
                            {selectedCountry.birthRate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-gray-800/30 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {displayMode === 'flags' ? '🏳️ Showing flags' : 
                     displayMode === 'both' ? '🌐 Showing both' : 
                     '⚪ Showing dots'}
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}