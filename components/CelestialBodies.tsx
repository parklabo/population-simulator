'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface CelestialBodiesProps {
  onMarsClick?: () => void;
  onMoonClick: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CelestialBodies({ onMoonClick, onMarsClick }: CelestialBodiesProps) {
  const [showMarsToast, setShowMarsToast] = useState(false);
  return (
    <>
      {/* Moon - Fixed position */}
      <motion.div
        className="fixed cursor-pointer hidden sm:block"
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
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="relative">
          {/* Moon glow */}
          <motion.div 
            className="absolute -inset-12 w-36 h-36 rounded-full bg-gray-300/30 blur-xl pointer-events-none"
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
          {/* Moon body (Larger) */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 shadow-[0_0_25px_rgba(200,200,200,0.6)] hover:shadow-[0_0_35px_rgba(200,200,200,0.9)]">
            {/* Craters */}
            <div className="absolute top-3 left-3 w-3 h-3 bg-gray-600/50 rounded-full" />
            <div className="absolute bottom-4 right-3 w-2 h-2 bg-gray-700/30 rounded-full" />
            <div className="absolute top-5 right-5 w-2 h-2 bg-gray-600/40 rounded-full" />
            <div className="absolute bottom-5 left-5 w-2.5 h-2.5 bg-gray-700/40 rounded-full blur-sm" />
            {/* YonYonWare Profile Icon */}
            <div className="absolute -right-3 -bottom-3 w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400/50 shadow-lg">
              <Image
                src="/favicon-96x96.png"
                alt="YonYonWare"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {/* Moon label with BETA indicator */}
          <motion.div 
            className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-sm text-gray-300 font-bold whitespace-nowrap select-none flex flex-col items-center gap-1"
            animate={{
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="flex items-center gap-2">
              <span>MOON</span>
              <span className="px-1.5 py-0.5 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-[10px] rounded">BETA</span>
            </span>
            <span className="text-[10px] text-cyan-400">Lunar Defense</span>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Mars - Next to Moon (LOCKED) */}
      <motion.div
        className="fixed cursor-not-allowed opacity-50 hidden sm:block"
        style={{ 
          left: '190px',  // Positioned next to Moon
          bottom: '190px',
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
            className="absolute -inset-12 w-36 h-36 rounded-full bg-red-500/10 blur-2xl pointer-events-none"
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
          {/* Mars body (Larger) */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-400/50 via-red-600/50 to-red-800/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            {/* Surface details */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-red-900/30 to-transparent" />
            <div className="absolute top-3 left-3 w-4 h-4 bg-red-900/50 rounded-full blur-sm" />
            <div className="absolute bottom-4 right-3 w-3 h-3 bg-red-800/50 rounded-full" />
            <div className="absolute top-6 right-5 w-2 h-2 bg-red-700/40 rounded-full" />
            {/* Lock icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl opacity-70">🔒</span>
            </div>
            {/* SpaceX/Elon Musk indicator */}
            <div className="absolute -right-3 -bottom-3 w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 via-red-900/30 to-black border-2 border-red-500/50 flex flex-col items-center justify-center shadow-lg">
              <span className="text-lg">🚀</span>
              <span className="text-[8px] text-red-400 font-bold">SPACEX</span>
            </div>
          </div>
          {/* Mars label with lock icon */}
          <motion.div 
            className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-sm text-red-400/60 font-bold whitespace-nowrap select-none flex flex-col items-center gap-1"
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
            <span className="text-[10px] text-gray-500">SpaceX Edition</span>
          </motion.div>
        </motion.div>
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
                <div className="flex flex-col items-center">
                  <span className="text-2xl">🚀</span>
                  <span className="text-[10px] text-red-400 font-bold">SPACEX</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Mars Colony - SpaceX Edition</p>
                  <p className="text-gray-400 text-sm">Elon is still working on it... 🔒</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}