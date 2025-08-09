'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelestialBodiesProps {
  onMarsClick: () => void;
  onMoonClick: () => void;
}

export default function CelestialBodies({ onMarsClick, onMoonClick }: CelestialBodiesProps) {
  const [showMarsToast, setShowMarsToast] = useState(false);
  return (
    <>
      {/* Mars - Fixed position (LOCKED) */}
      <motion.div
        className="fixed cursor-not-allowed opacity-50"
        style={{ 
          right: '50px', 
          bottom: '200px',
          zIndex: 30 
        }}
        animate={{
          y: [-10, 10, -10],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        onClick={(e) => {
          e.preventDefault();
          setShowMarsToast(true);
          setTimeout(() => setShowMarsToast(false), 3000);
        }}
        whileHover={{ scale: 1.1 }}
      >
        <motion.div 
          className="relative"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 100,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Mars glow (dimmed for locked state) */}
          <motion.div 
            className="absolute -inset-10 w-28 h-28 rounded-full bg-red-500/10 blur-2xl pointer-events-none"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Mars body (with lock overlay) */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-red-400/50 via-red-600/50 to-red-800/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            {/* Surface details */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-red-900/30 to-transparent" />
            <div className="absolute top-2 left-2 w-3 h-3 bg-red-900/50 rounded-full blur-sm" />
            <div className="absolute bottom-3 right-2 w-2 h-2 bg-red-800/50 rounded-full" />
            <div className="absolute top-4 right-3 w-1 h-1 bg-red-700/40 rounded-full" />
            {/* Lock icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl opacity-70">🔒</span>
            </div>
          </div>
          {/* Mars label with lock icon */}
          <motion.div 
            className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-red-400/60 font-bold whitespace-nowrap select-none flex flex-col items-center gap-1"
            animate={{
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="flex items-center gap-1">
              <span>🔒</span>
              <span>MARS</span>
            </span>
            <span className="text-[10px] text-gray-500">Coming Soon</span>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Moon - Fixed position */}
      <motion.div
        className="fixed cursor-pointer"
        style={{ 
          left: '50px', 
          bottom: '200px',
          zIndex: 30 
        }}
        animate={{
          x: [-5, 5, -5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        onClick={onMoonClick}
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="relative">
          {/* Moon glow */}
          <motion.div 
            className="absolute -inset-8 w-24 h-24 rounded-full bg-gray-300/30 blur-xl pointer-events-none"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Moon body */}
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 shadow-[0_0_25px_rgba(200,200,200,0.6)] hover:shadow-[0_0_35px_rgba(200,200,200,0.9)]">
            {/* Craters */}
            <div className="absolute top-2 left-2 w-2 h-2 bg-gray-600/50 rounded-full" />
            <div className="absolute bottom-2 right-2 w-1 h-1 bg-gray-700/30 rounded-full" />
            <div className="absolute top-3 right-3 w-1 h-1 bg-gray-600/40 rounded-full" />
            <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-gray-700/40 rounded-full blur-sm" />
          </div>
          {/* Moon label */}
          <motion.p 
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-300 font-bold whitespace-nowrap select-none"
            animate={{
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            MOON
          </motion.p>
        </div>
      </motion.div>
      
      {/* Toast notification for Mars */}
      <AnimatePresence>
        {showMarsToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gray-900/95 backdrop-blur-sm border border-red-500/30 rounded-lg px-6 py-3 shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="text-white font-semibold">Mars Colony Coming Soon!</p>
                  <p className="text-gray-400 text-sm">This feature is under development</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}