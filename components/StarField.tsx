'use client';

import { useEffect, useState } from 'react';

export default function StarField() {
  const [stars, setStars] = useState<Array<{ id: number; left: string; top: string; delay: string; opacity: number }>>([]);
  
  useEffect(() => {
    const newStars = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      opacity: Math.random() * 0.8 + 0.2
    }));
    setStars(newStars);
  }, []);
  
  return (
    <div className="absolute inset-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay,
            opacity: star.opacity
          }}
        />
      ))}
    </div>
  );
}