'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileNavProps {
  onEarthClick: () => void;
  onSimulateClick: () => void;
  onMoonClick: () => void;
  onMarsClick: () => void;
  currentView: 'earth' | 'moon' | 'mars' | 'simulate';
}

export default function MobileNav({ 
  onEarthClick,
  onSimulateClick, 
  onMoonClick, 
  onMarsClick,
  currentView 
}: MobileNavProps) {
  const [showMarsToast, setShowMarsToast] = useState(false);
  
  const handleMarsClick = () => {
    setShowMarsToast(true);
    setTimeout(() => setShowMarsToast(false), 3000);
  };
  
  const navItems = [
    { id: 'earth', icon: '🌍', label: 'Earth', onClick: onEarthClick },
    { id: 'simulate', icon: '📊', label: 'Simulate', onClick: onSimulateClick },
    { id: 'moon', icon: '🌙', label: 'Moon', onClick: onMoonClick },
    { id: 'mars', icon: '🚀', label: 'Mars', onClick: handleMarsClick },
  ];

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/20 md:hidden z-[100] safe-bottom"
    >
      <div className="grid grid-cols-4 gap-0.5 px-1 py-1">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.95 }}
            onClick={item.onClick}
            className={`
              relative flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all min-w-0
              ${currentView === item.id 
                ? 'bg-gradient-to-t from-purple-600/30 to-cyan-600/30 border border-cyan-500/30' 
                : 'hover:bg-white/5'
              }
              ${item.id === 'mars' ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={item.id === 'mars'}
          >
            <motion.span 
              className="text-xl sm:text-2xl mb-0.5"
              animate={currentView === item.id ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 0.5 }}
            >
              {item.icon}
            </motion.span>
            <span className={`text-[10px] sm:text-xs font-medium whitespace-nowrap ${
              currentView === item.id ? 'text-cyan-400' : 'text-gray-400'
            }`}>
              {item.label}
            </span>
            {item.id === 'moon' && (
              <span className="absolute -top-0.5 -right-0.5 px-1 py-0.5 bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 text-[7px] font-bold rounded leading-none">
                BETA
              </span>
            )}
            {item.id === 'mars' && (
              <span className="absolute -top-0.5 -right-0.5 text-[10px]">🔒</span>
            )}
          </motion.button>
        ))}
      </div>
      
      {/* iPhone home indicator safe area */}
      <div className="h-safe-area-inset-bottom bg-black/90" />
      
      {/* Mars Toast notification */}
      <AnimatePresence>
        {showMarsToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: -100 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute left-1/2 transform -translate-x-1/2 bottom-20 z-50"
          >
            <div className="bg-gray-900/95 backdrop-blur-sm border border-red-500/30 rounded-lg px-4 py-2 shadow-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <div>
                  <p className="text-white font-semibold text-sm">Mars Colony - SpaceX Edition</p>
                  <p className="text-gray-400 text-xs">Elon is still working on it... 🔒</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}