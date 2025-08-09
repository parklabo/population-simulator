'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MobileNavProps {
  onSimulateClick: () => void;
  onMoonClick: () => void;
  onMarsClick: () => void;
  currentView: 'earth' | 'moon' | 'mars' | 'simulate';
}

export default function MobileNav({ 
  onSimulateClick, 
  onMoonClick, 
  onMarsClick,
  currentView 
}: MobileNavProps) {
  const navItems = [
    { id: 'earth', icon: '🌍', label: 'Earth', onClick: () => {} },
    { id: 'simulate', icon: '📊', label: 'Simulate', onClick: onSimulateClick },
    { id: 'moon', icon: '🌙', label: 'Moon', onClick: onMoonClick },
    { id: 'mars', icon: '🚀', label: 'Mars', onClick: onMarsClick },
  ];

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/20 md:hidden z-[100] safe-bottom"
    >
      <div className="grid grid-cols-4 gap-1 px-2 py-1">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.95 }}
            onClick={item.onClick}
            className={`
              flex flex-col items-center justify-center p-3 rounded-lg transition-all
              ${currentView === item.id 
                ? 'bg-gradient-to-t from-purple-600/30 to-cyan-600/30 border border-cyan-500/30' 
                : 'hover:bg-white/5'
              }
            `}
          >
            <motion.span 
              className="text-2xl mb-1"
              animate={currentView === item.id ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 0.5 }}
            >
              {item.icon}
            </motion.span>
            <span className={`text-xs font-medium ${
              currentView === item.id ? 'text-cyan-400' : 'text-gray-400'
            }`}>
              {item.label}
            </span>
            {item.id === 'moon' && (
              <span className="absolute top-1 right-1 px-1 py-0.5 bg-yellow-500/20 text-yellow-400 text-[8px] font-bold rounded">
                BETA
              </span>
            )}
            {item.id === 'mars' && (
              <span className="absolute top-1 right-1 text-[10px]">🔒</span>
            )}
          </motion.button>
        ))}
      </div>
      
      {/* iPhone home indicator safe area */}
      <div className="h-safe-area-inset-bottom bg-black/90" />
    </motion.nav>
  );
}