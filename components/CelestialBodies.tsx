'use client';

import { motion } from 'framer-motion';

interface CelestialBodiesProps {
  onMarsClick: () => void;
  onMoonClick: () => void;
}

export default function CelestialBodies({ onMarsClick, onMoonClick }: CelestialBodiesProps) {
  return (
    <>
      {/* Mars - Fixed position, always on top */}
      <motion.div
        className="fixed cursor-pointer"
        style={{ 
          right: '50px', 
          bottom: '200px',
          zIndex: 9999 
        }}
        animate={{
          y: [-10, 10, -10],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        onClick={onMarsClick}
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.9 }}
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
          {/* Mars glow */}
          <motion.div 
            className="absolute -inset-10 w-28 h-28 rounded-full bg-red-500/30 blur-2xl pointer-events-none"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Mars body */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-800 shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:shadow-[0_0_40px_rgba(239,68,68,0.9)]">
            {/* Surface details */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-red-900/30 to-transparent" />
            <div className="absolute top-2 left-2 w-3 h-3 bg-red-900/50 rounded-full blur-sm" />
            <div className="absolute bottom-3 right-2 w-2 h-2 bg-red-800/50 rounded-full" />
            <div className="absolute top-4 right-3 w-1 h-1 bg-red-700/40 rounded-full" />
          </div>
          {/* Mars label */}
          <motion.p 
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-red-400 font-bold whitespace-nowrap select-none"
            animate={{
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            MARS
          </motion.p>
        </motion.div>
      </motion.div>
      
      {/* Moon - Fixed position, always on top */}
      <motion.div
        className="fixed cursor-pointer"
        style={{ 
          left: '50px', 
          bottom: '200px',
          zIndex: 9999 
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
    </>
  );
}