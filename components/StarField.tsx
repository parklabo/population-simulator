'use client';

import { useEffect, useState, useMemo } from 'react';
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
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Generate stars only once and memoize
  const stars = useMemo(() => {
    // Reduce star count on mobile
    const layers = isMobile ? [
      { count: 50, sizeRange: [1, 2], opacityRange: [0.3, 0.6], durationRange: [4, 8] }, // Far stars
      { count: 30, sizeRange: [2, 3], opacityRange: [0.5, 0.8], durationRange: [3, 6] }, // Mid stars
      { count: 20, sizeRange: [3, 4], opacityRange: [0.7, 1], durationRange: [2, 4] },  // Near stars
    ] : [
      { count: 150, sizeRange: [1, 2], opacityRange: [0.3, 0.6], durationRange: [3, 6] }, // Far stars
      { count: 100, sizeRange: [2, 3], opacityRange: [0.5, 0.8], durationRange: [2, 4] }, // Mid stars
      { count: 50, sizeRange: [3, 4], opacityRange: [0.7, 1], durationRange: [1.5, 3] },  // Near stars
    ];
    
    const allStars: Star[] = [];
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
  }, [isMobile]);
  
  // Simplified nebulas - static on mobile
  const nebulas = useMemo(() => {
    if (isMobile) {
      // Only one nebula on mobile
      return [
        { id: 1, x: 50, y: 50, color: 'purple', size: 300 }
      ];
    }
    return [
      { id: 1, x: 20, y: 30, color: 'purple', size: 400 },
      { id: 2, x: 70, y: 60, color: 'blue', size: 300 },
      { id: 3, x: 40, y: 80, color: 'pink', size: 350 },
    ];
  }, [isMobile]);
  
  useEffect(() => {
    // Disable shooting stars on mobile
    if (isMobile) return;
    
    // Create shooting stars less frequently
    const shootingStarInterval = setInterval(() => {
      const id = Date.now();
      const startX = Math.random() * 100;
      const startY = Math.random() * 50;
      const angle = 30 + Math.random() * 30;
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
    }, 5000 + Math.random() * 5000); // Less frequent: 5-10 seconds
    
    return () => clearInterval(shootingStarInterval);
  }, [isMobile]);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />
      
      {/* Nebula clouds - simplified animation on mobile */}
      {nebulas.map(nebula => (
        <div
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
        />
      ))}
      
      {/* Use CSS animations for stars instead of Framer Motion on mobile */}
      {isMobile ? (
        // Simple CSS animated stars for mobile
        <div className="absolute inset-0">
          {stars.map(star => (
            <div
              key={star.id}
              className="absolute rounded-full animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                backgroundColor: `rgba(255, 255, 255, ${star.opacity})`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`
              }}
            />
          ))}
        </div>
      ) : (
        // Framer Motion stars for desktop
        stars.map(star => (
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
        ))
      )}
      
      {/* Shooting stars - desktop only */}
      {!isMobile && shootingStars.map(shootingStar => (
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
            <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
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
      
      {/* Milky way band - static, no animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent transform rotate-12" />
      </div>
    </div>
  );
}