'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
}

export default function StarField() {
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [nebulas, setNebulas] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate multiple layers of stars for depth
    const generateStars = () => {
      const layers = [
        { count: 150, sizeRange: [1, 2], opacityRange: [0.3, 0.6], durationRange: [3, 6] }, // Far stars
        { count: 100, sizeRange: [2, 3], opacityRange: [0.5, 0.8], durationRange: [2, 4] }, // Mid stars
        { count: 50, sizeRange: [3, 4], opacityRange: [0.7, 1], durationRange: [1.5, 3] },  // Near stars
      ];
      
      let allStars: Star[] = [];
      let id = 0;
      
      layers.forEach(layer => {
        for (let i = 0; i < layer.count; i++) {
          allStars.push({
            id: id++,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]),
            opacity: layer.opacityRange[0] + Math.random() * (layer.opacityRange[1] - layer.opacityRange[0]),
            duration: layer.durationRange[0] + Math.random() * (layer.durationRange[1] - layer.durationRange[0]),
            delay: Math.random() * 5
          });
        }
      });
      
      return allStars;
    };
    
    // Generate nebula clouds
    const generateNebulas = () => {
      return [
        { id: 1, x: 20, y: 30, color: 'purple', size: 400 },
        { id: 2, x: 70, y: 60, color: 'blue', size: 300 },
        { id: 3, x: 40, y: 80, color: 'pink', size: 350 },
      ];
    };
    
    setStars(generateStars());
    setNebulas(generateNebulas());
    
    // Create shooting stars periodically
    const shootingStarInterval = setInterval(() => {
      const id = Date.now();
      const startX = Math.random() * 100;
      const startY = Math.random() * 50;
      const angle = 30 + Math.random() * 30; // 30-60 degree angle
      const distance = 20 + Math.random() * 30;
      
      const newShootingStar: ShootingStar = {
        id,
        startX,
        startY,
        endX: startX + distance,
        endY: startY + distance * Math.tan(angle * Math.PI / 180),
        duration: 0.5 + Math.random() * 1
      };
      
      setShootingStars(prev => [...prev, newShootingStar]);
      
      // Remove after animation
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== id));
      }, (newShootingStar.duration + 0.5) * 1000);
    }, 3000 + Math.random() * 4000);
    
    return () => clearInterval(shootingStarInterval);
  }, []);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />
      
      {/* Nebula clouds for depth */}
      {nebulas.map(nebula => (
        <motion.div
          key={nebula.id}
          className={`absolute rounded-full blur-3xl ${
            nebula.color === 'purple' ? 'bg-purple-600/10' :
            nebula.color === 'blue' ? 'bg-blue-600/10' :
            'bg-pink-600/10'
          }`}
          style={{
            left: `${nebula.x}%`,
            top: `${nebula.y}%`,
            width: nebula.size,
            height: nebula.size,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Animated stars */}
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: `radial-gradient(circle, rgba(255,255,255,${star.opacity}) 0%, transparent 70%)`,
            boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,${star.opacity * 0.5})`
          }}
          animate={{
            opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Shooting stars */}
      {shootingStars.map(shootingStar => (
        <motion.div
          key={shootingStar.id}
          className="absolute"
          initial={{
            left: `${shootingStar.startX}%`,
            top: `${shootingStar.startY}%`,
            opacity: 0
          }}
          animate={{
            left: `${shootingStar.endX}%`,
            top: `${shootingStar.endY}%`,
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: shootingStar.duration,
            ease: "easeOut"
          }}
        >
          <div className="relative">
            {/* Star head */}
            <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
            {/* Star tail */}
            <div 
              className="absolute top-0 left-0 w-20 h-[1px] bg-gradient-to-r from-white to-transparent"
              style={{
                transform: `rotate(${Math.atan2(
                  shootingStar.endY - shootingStar.startY,
                  shootingStar.endX - shootingStar.startX
                ) * 180 / Math.PI}deg)`,
                transformOrigin: 'left center'
              }}
            />
          </div>
        </motion.div>
      ))}
      
      
      {/* Constellation lines (subtle) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.g
          animate={{
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <line x1="10%" y1="20%" x2="15%" y2="25%" stroke="white" strokeWidth="0.5" opacity="0.3" />
          <line x1="15%" y1="25%" x2="18%" y2="22%" stroke="white" strokeWidth="0.5" opacity="0.3" />
          <line x1="18%" y1="22%" x2="22%" y2="28%" stroke="white" strokeWidth="0.5" opacity="0.3" />
          
          <line x1="70%" y1="15%" x2="75%" y2="18%" stroke="white" strokeWidth="0.5" opacity="0.3" />
          <line x1="75%" y1="18%" x2="73%" y2="23%" stroke="white" strokeWidth="0.5" opacity="0.3" />
          <line x1="73%" y1="23%" x2="78%" y2="25%" stroke="white" strokeWidth="0.5" opacity="0.3" />
        </motion.g>
      </svg>
      
      {/* Milky way band */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent transform rotate-12" />
      </div>
    </div>
  );
}