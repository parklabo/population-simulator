'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MarsColonyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MissionPhase {
  year: number;
  phase: string;
  ships: number;
  humans: number;
  robots: number;
  roaches?: number; // Terraformars roaches
  cargo: number; // tons
  description: string;
  status: 'planned' | 'in-progress' | 'completed';
  isWarning?: boolean;
}

export default function MarsColonyModal({ isOpen, onClose }: MarsColonyModalProps) {
  const [currentYear, setCurrentYear] = useState(2024);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rockets, setRockets] = useState(0);
  const [humans, setHumans] = useState(0);
  const [robots, setRobots] = useState(0);
  const [roaches, setRoaches] = useState(0);
  const [casualties, setCasualties] = useState(0);
  const [terraformingLevel, setTerraformingLevel] = useState(0);
  
  // Adjustable parameters
  const [humanBirthRate, setHumanBirthRate] = useState(1.5); // births per person per year
  const [robotProductionRate, setRobotProductionRate] = useState(100); // robots per year
  const [roachReproductionRate, setRoachReproductionRate] = useState(2.0); // multiplication factor
  const [missionStatus, setMissionStatus] = useState<'ongoing' | 'success' | 'failure'>('ongoing');

  const missionPhases: MissionPhase[] = [
    {
      year: 2024,
      phase: "Starship Development",
      ships: 0,
      humans: 0,
      robots: 0,
      cargo: 0,
      description: "Testing Starship prototypes",
      status: 'in-progress'
    },
    {
      year: 2026,
      phase: "Robot Scout Mission",
      ships: 2,
      humans: 0,
      robots: 50,
      cargo: 100,
      description: "AI robots prepare landing sites 🤖",
      status: 'planned'
    },
    {
      year: 2029,
      phase: "First Human Landing",
      ships: 4,
      humans: 12,
      robots: 200,
      cargo: 200,
      description: "First humans on Mars! 🚀",
      status: 'planned'
    },
    {
      year: 2031,
      phase: "Base Alpha Construction",
      ships: 10,
      humans: 100,
      robots: 500,
      cargo: 500,
      description: "Building first permanent settlement",
      status: 'planned'
    },
    {
      year: 2033,
      phase: "⚠️ TERRAFORMARS DETECTED",
      ships: 15,
      humans: 150,
      robots: 800,
      roaches: 1000,
      cargo: 1000,
      description: "Giant roaches discovered! Battle begins! 🪳",
      status: 'planned',
      isWarning: true
    },
    {
      year: 2035,
      phase: "Settlement Defense & Expansion",
      ships: 50,
      humans: 800,
      robots: 2000,
      roaches: 500,
      cargo: 2000,
      description: "Fighting roaches while expanding",
      status: 'planned'
    },
    {
      year: 2040,
      phase: "Victory & Self-Sustaining Base",
      ships: 200,
      humans: 10000,
      robots: 10000,
      roaches: 50,
      cargo: 5000,
      description: "Roaches contained! Settlement thriving",
      status: 'planned'
    },
    {
      year: 2050,
      phase: "New Mars City",
      ships: 1000,
      humans: 100000,
      robots: 50000,
      roaches: 0,
      cargo: 20000,
      description: "First Martian city established! 🏙️",
      status: 'planned'
    },
    {
      year: 2100,
      phase: "Million Person Mars",
      ships: 10000,
      humans: 1000000,
      robots: 500000,
      cargo: 100000,
      description: "Elon's dream achieved! 🎉",
      status: 'planned'
    }
  ];

  const getCurrentPhase = () => {
    return missionPhases.find(phase => phase.year <= currentYear) || missionPhases[0];
  };

  const getNextPhase = () => {
    const currentIndex = missionPhases.findIndex(phase => phase.year <= currentYear);
    return missionPhases[currentIndex + 1];
  };

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentYear(prev => {
        if (prev >= 2100) {
          setIsPlaying(false);
          return 2100;
        }
        return prev + 1;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const phase = getCurrentPhase();
    if (phase && currentYear > 2024) {
      const yearsPassed = currentYear - 2024;
      const progress = Math.min(yearsPassed / (2100 - 2024), 1);
      
      // Calculate humans with birth rate
      let calculatedHumans = phase.humans;
      if (calculatedHumans > 0) {
        const growthYears = currentYear - 2029; // Years since first landing
        if (growthYears > 0) {
          calculatedHumans = Math.floor(12 * Math.pow(1 + humanBirthRate / 10, growthYears));
        }
      }
      
      // Calculate robots with production rate
      let calculatedRobots = 50; // Initial robots
      if (currentYear > 2026) {
        calculatedRobots = Math.floor(50 + robotProductionRate * (currentYear - 2026));
      }
      
      // Calculate roaches with reproduction rate
      let calculatedRoaches = 0;
      if (currentYear >= 2033) {
        const roachYears = currentYear - 2033;
        calculatedRoaches = Math.floor(100 * Math.pow(roachReproductionRate, roachYears));
        
        // Roaches decrease if humans + robots outnumber them
        const defenders = calculatedHumans + calculatedRobots * 2; // Robots count double for combat
        if (defenders > calculatedRoaches * 3) {
          calculatedRoaches = Math.max(0, Math.floor(calculatedRoaches * 0.3));
        }
      }
      
      // Update states
      setRockets(Math.floor(phase.ships * progress));
      setHumans(Math.max(0, calculatedHumans));
      setRobots(calculatedRobots);
      setRoaches(Math.max(0, calculatedRoaches));
      setTerraformingLevel(progress * 100);
      
      // Calculate casualties
      if (calculatedRoaches > 0) {
        const battleIntensity = calculatedRoaches / (calculatedHumans + calculatedRobots + 1);
        setCasualties(Math.floor(calculatedHumans * battleIntensity * 0.05));
      }
      
      // Determine mission status
      if (currentYear >= 2100) {
        if (calculatedHumans >= 100000 && calculatedRoaches === 0) {
          setMissionStatus('success');
        } else if (calculatedHumans < 100) {
          setMissionStatus('failure');
        }
      }
      
      // Mission failure if roaches overwhelm
      if (calculatedRoaches > calculatedHumans * 10 && calculatedHumans > 0) {
        setMissionStatus('failure');
      }
    }
  }, [currentYear, humanBirthRate, robotProductionRate, roachReproductionRate]);

  if (!isOpen) return null;

  const currentPhase = getCurrentPhase();
  const nextPhase = getNextPhase();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-gradient-to-br from-red-950/95 via-orange-950/95 to-red-900/95 backdrop-blur-2xl rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-red-500/30 shadow-[0_0_100px_rgba(239,68,68,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-5xl"
              >
                🚀
              </motion.div>
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  SpaceX Mars Settlement Planner
                </h2>
                <p className="text-sm text-red-300 mt-1">Making Life Multiplanetary™</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-red-900/50 hover:bg-red-800/50 rounded-full flex items-center justify-center transition-all text-red-300"
            >
              ✕
            </button>
          </div>

          {/* Current Year Display */}
          <div className="text-center mb-8">
            <p className="text-sm text-red-400 mb-2">MISSION YEAR</p>
            <motion.p 
              key={currentYear}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-6xl font-bold text-white"
            >
              {currentYear}
            </motion.p>
            <div className="mt-4 h-2 bg-red-900/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                animate={{ width: `${((currentYear - 2024) / (2100 - 2024)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Mission Control Panel */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Left Panel - Current Status */}
            <div className="bg-black/30 rounded-2xl p-6 border border-red-500/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Current Phase</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-red-400">Mission</p>
                  <p className="text-2xl font-bold text-white">{currentPhase?.phase}</p>
                  <p className="text-sm text-gray-400 mt-1">{currentPhase?.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-500/20">
                      <p className="text-xs text-blue-400">👨‍🚀 Humans</p>
                      <motion.p 
                        className="text-xl font-bold text-white"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        {humans.toLocaleString()}
                      </motion.p>
                    </div>
                    <div className="bg-purple-900/20 rounded-lg p-2 border border-purple-500/20">
                      <p className="text-xs text-purple-400">🤖 Robots</p>
                      <motion.p 
                        className="text-xl font-bold text-white"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        {robots.toLocaleString()}
                      </motion.p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-red-900/20 rounded-lg p-2 border border-red-500/20">
                      <p className="text-xs text-red-400">🚀 Starships</p>
                      <motion.p 
                        className="text-xl font-bold text-white"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        {rockets}
                      </motion.p>
                    </div>
                    {roaches > 0 ? (
                      <div className="bg-green-900/20 rounded-lg p-2 border border-green-500/20">
                        <p className="text-xs text-green-400">🪳 Roaches</p>
                        <motion.p 
                          className="text-xl font-bold text-red-400"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.3, repeat: Infinity }}
                        >
                          {roaches.toLocaleString()}
                        </motion.p>
                      </div>
                    ) : (
                      <div className="bg-yellow-900/20 rounded-lg p-2 border border-yellow-500/20">
                        <p className="text-xs text-yellow-400">📦 Cargo</p>
                        <motion.p 
                          className="text-xl font-bold text-white"
                        >
                          {(currentPhase?.cargo || 0).toLocaleString()}t
                        </motion.p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Population Visual Effect */}
                <div className="mt-4 flex items-center justify-center gap-1 flex-wrap">
                  {/* Human icons */}
                  {Array.from({ length: Math.min(20, Math.ceil(humans / 50)) }).map((_, i) => (
                    <motion.span
                      key={`human-${i}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="text-lg"
                    >
                      👨‍🚀
                    </motion.span>
                  ))}
                  {/* Robot icons */}
                  {Array.from({ length: Math.min(15, Math.ceil(robots / 100)) }).map((_, i) => (
                    <motion.span
                      key={`robot-${i}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 + 0.5 }}
                      className="text-lg"
                    >
                      🤖
                    </motion.span>
                  ))}
                  {/* Roach icons if present */}
                  {roaches > 0 && Array.from({ length: Math.min(10, Math.ceil(roaches / 100)) }).map((_, i) => (
                    <motion.span
                      key={`roach-${i}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1, x: [0, -5, 5, 0] }}
                      transition={{ 
                        delay: i * 0.05 + 1,
                        x: { duration: 0.5, repeat: Infinity }
                      }}
                      className="text-lg"
                    >
                      🪳
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Mars Visual */}
            <div className="bg-black/30 rounded-2xl p-6 border border-red-500/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Mars Terraforming</h3>
              
              {/* Mars Animation */}
              <div className="relative h-48 flex items-center justify-center">
                <motion.div
                  className="relative w-40 h-40"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                >
                  {/* Mars */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-900 shadow-[0_0_60px_rgba(239,68,68,0.5)]">
                    {/* Terraforming overlay */}
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-green-600/0 to-blue-600/0"
                      animate={{
                        backgroundColor: terraformingLevel > 50 
                          ? `rgba(34, 197, 94, ${terraformingLevel / 200})`
                          : `rgba(239, 68, 68, 0)`
                      }}
                    />
                  </div>
                  
                  {/* Settlements */}
                  {humans > 0 && (
                    <>
                      <div className="absolute top-8 left-8 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      {humans > 100 && (
                        <div className="absolute bottom-12 right-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      )}
                      {humans > 1000 && (
                        <div className="absolute top-12 right-8 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                      )}
                    </>
                  )}
                  
                  {/* Roach warning */}
                  {roaches > 0 && (
                    <motion.div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      ⚠️
                    </motion.div>
                  )}
                </motion.div>
              </div>
              
              {/* Terraforming Progress */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-red-400">Terraforming Progress</span>
                  <span className="text-white">{terraformingLevel.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-red-900/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-green-500"
                    animate={{ width: `${terraformingLevel}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-black/30 rounded-2xl p-6 border border-red-500/20 mb-6">
            <h3 className="text-xl font-bold text-orange-400 mb-4">Mission Timeline</h3>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-900/50 rounded-full" />
              {missionPhases.map((phase, index) => (
                <motion.div
                  key={phase.year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative pl-8 pb-4 ${phase.year <= currentYear ? 'opacity-100' : 'opacity-50'}`}
                >
                  <div className={`absolute left-0 w-3 h-3 rounded-full ${
                    phase.year <= currentYear ? 'bg-orange-500' : 'bg-red-900'
                  } -translate-x-1`} />
                  <div className="flex items-center gap-4">
                    <span className="text-red-400 font-mono text-sm w-12">{phase.year}</span>
                    <span className="text-white font-semibold">{phase.phase}</span>
                    <span className="text-gray-400 text-sm">- {phase.description}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Results and Population Distribution */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Left: Control Buttons */}
            <div className="bg-black/30 rounded-2xl p-6 border border-red-500/20">
              <h3 className="text-lg font-bold text-orange-400 mb-4">Mission Control</h3>
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCurrentYear(2024);
                    setIsPlaying(!isPlaying);
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 transition-all"
                >
                  {isPlaying ? '⏸ Pause' : '▶ Start Mission'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCurrentYear(2024);
                    setIsPlaying(false);
                    setRockets(0);
                    setHumans(0);
                    setRobots(0);
                    setRoaches(0);
                    setCasualties(0);
                    setTerraformingLevel(0);
                    setMissionStatus('ongoing');
                    // Reset parameters to default
                    setHumanBirthRate(1.5);
                    setRobotProductionRate(100);
                    setRoachReproductionRate(2.0);
                  }}
                  className="w-full px-6 py-2 bg-red-900/50 text-red-300 rounded-xl font-semibold hover:bg-red-900/70 transition-all"
                >
                  🔄 Reset
                </motion.button>
                
                {/* Year Slider */}
                <div className="mt-4">
                  <p className="text-xs text-red-400 mb-2">TIMELINE</p>
                  <input
                    type="range"
                    min="2024"
                    max="2100"
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>2024</span>
                    <span>2100</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Center: Population Distribution */}
            <div className="bg-black/30 rounded-2xl p-6 border border-red-500/20">
              <h3 className="text-lg font-bold text-orange-400 mb-4">Population Distribution</h3>
              <div className="space-y-4">
                {/* Total Population */}
                <div className="text-center mb-4">
                  <p className="text-xs text-gray-400">TOTAL BEINGS</p>
                  <p className="text-3xl font-bold text-white">
                    {(humans + robots + roaches).toLocaleString()}
                  </p>
                </div>
                
                {/* Distribution Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-blue-400">👨‍🚀 Humans</span>
                      <span className="text-sm text-white font-bold">{((humans / (humans + robots + roaches || 1)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                        animate={{ width: `${(humans / (humans + robots + roaches || 1)) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{humans.toLocaleString()} settlers</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-purple-400">🤖 Robots</span>
                      <span className="text-sm text-white font-bold">{((robots / (humans + robots + roaches || 1)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                        animate={{ width: `${(robots / (humans + robots + roaches || 1)) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{robots.toLocaleString()} units</p>
                  </div>
                  
                  {roaches > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-green-400">🪳 Roaches</span>
                        <span className="text-sm text-red-400 font-bold">{((roaches / (humans + robots + roaches || 1)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-green-600 to-green-400"
                          animate={{ width: `${(roaches / (humans + robots + roaches || 1)) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <p className="text-xs text-red-400 mt-1">{roaches.toLocaleString()} hostile</p>
                    </div>
                  )}
                </div>
                
                {/* Combat Status */}
                {roaches > 0 && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-xs text-red-400 font-bold">⚔️ COMBAT STATUS</p>
                    <p className="text-xs text-orange-300 mt-1">
                      Casualties: {casualties} humans lost
                    </p>
                    <p className="text-xs text-purple-300">
                      Robot defenders: {Math.floor(robots * 0.3)} in combat
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right: Mission Results */}
            <div className="bg-black/30 rounded-2xl p-6 border border-red-500/20">
              <h3 className="text-lg font-bold text-orange-400 mb-4">Mission Results</h3>
              <div className="space-y-4">
                {currentYear >= 2029 ? (
                  <>
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-3 border border-purple-500/20">
                      <p className="text-xs text-purple-400 uppercase">Settlement Year {currentYear}</p>
                      <p className="text-2xl font-bold text-white">
                        {humans > 0 ? `${humans.toLocaleString()} Humans` : 'No humans yet'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {humans > 100000 ? '🎉 City established!' : 
                         humans > 10000 ? '🏘️ Self-sustaining' :
                         humans > 1000 ? '🏗️ Growing settlement' :
                         humans > 100 ? '🏠 Early base' :
                         humans > 0 ? '🚀 First landing!' : '🤖 Robot preparation'}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 rounded-xl p-3 border border-orange-500/20">
                      <p className="text-xs text-orange-400 uppercase">Robot Force</p>
                      <p className="text-xl font-bold text-white">
                        {robots.toLocaleString()} Units
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {robots > 10000 ? 'Full automation' : 
                         robots > 1000 ? 'Major workforce' :
                         robots > 100 ? 'Construction crew' : 'Scout team'}
                      </p>
                    </div>
                    
                    {roaches > 0 && (
                      <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl p-3 border border-red-500/20">
                        <p className="text-xs text-red-400 uppercase">⚠️ Threat Level</p>
                        <p className="text-xl font-bold text-red-400">
                          {roaches.toLocaleString()} Roaches
                        </p>
                        <p className="text-xs text-orange-400 mt-1">
                          {roaches > 500 ? 'Critical threat!' :
                           roaches > 100 ? 'Major infestation' :
                           roaches > 0 ? 'Contained threat' : 'Eliminated'}
                        </p>
                      </div>
                    )}
                    
                    {currentYear >= 2100 && (
                      <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-3 border border-green-500/20">
                        <p className="text-xs text-green-400 uppercase">🎊 Mission Success</p>
                        <p className="text-lg font-bold text-green-400">
                          Mars Colonized!
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">Run simulation to see results</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Simulation Parameters */}
          <div className="bg-black/30 rounded-2xl p-6 border border-red-500/20 mb-6">
            <h3 className="text-xl font-bold text-orange-400 mb-4">⚙️ Simulation Parameters</h3>
            <div className="grid grid-cols-3 gap-6">
              {/* Human Birth Rate */}
              <div>
                <label className="block text-sm text-blue-400 mb-2">
                  👨‍🚀 Human Birth Rate (per year)
                </label>
                <div className="relative mb-2">
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={humanBirthRate}
                    onChange={(e) => setHumanBirthRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-500/20">
                  <p className="text-center text-xl font-bold text-blue-400">
                    {humanBirthRate.toFixed(1)}x
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    {humanBirthRate < 1.0 ? 'Low growth' : 
                     humanBirthRate < 2.0 ? 'Moderate' : 'High growth'}
                  </p>
                </div>
              </div>
              
              {/* Robot Production Rate */}
              <div>
                <label className="block text-sm text-purple-400 mb-2">
                  🤖 Robot Production (per year)
                </label>
                <div className="relative mb-2">
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={robotProductionRate}
                    onChange={(e) => setRobotProductionRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="bg-purple-900/20 rounded-lg p-2 border border-purple-500/20">
                  <p className="text-center text-xl font-bold text-purple-400">
                    {robotProductionRate}/yr
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    {robotProductionRate < 100 ? 'Slow production' : 
                     robotProductionRate < 300 ? 'Standard' : 'Mass production'}
                  </p>
                </div>
              </div>
              
              {/* Roach Reproduction Rate */}
              <div>
                <label className="block text-sm text-green-400 mb-2">
                  🪳 Roach Reproduction Rate
                </label>
                <div className="relative mb-2">
                  <input
                    type="range"
                    min="1.1"
                    max="3.0"
                    step="0.1"
                    value={roachReproductionRate}
                    onChange={(e) => setRoachReproductionRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="bg-green-900/20 rounded-lg p-2 border border-green-500/20">
                  <p className="text-center text-xl font-bold text-green-400">
                    {roachReproductionRate.toFixed(1)}x
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    {roachReproductionRate < 1.5 ? 'Manageable' : 
                     roachReproductionRate < 2.5 ? 'Dangerous' : 'Catastrophic'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mission Status Indicator */}
            {missionStatus !== 'ongoing' && (
              <div className={`mt-4 p-4 rounded-xl border ${
                missionStatus === 'success' 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : 'bg-red-900/20 border-red-500/30'
              }`}>
                <p className={`text-center text-lg font-bold ${
                  missionStatus === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {missionStatus === 'success' 
                    ? '🎉 MISSION SUCCESS! Mars is colonized!' 
                    : '💀 MISSION FAILED! Colony destroyed!'}
                </p>
                <p className="text-center text-sm text-gray-400 mt-2">
                  {missionStatus === 'success' 
                    ? `Achieved with ${humans.toLocaleString()} humans and ${robots.toLocaleString()} robots`
                    : roaches > humans * 10 
                      ? 'Overwhelmed by roaches!' 
                      : 'Insufficient population growth'}
                </p>
              </div>
            )}
          </div>

          {/* Elon Quote */}
          <div className="mt-6 text-center">
            <p className="text-sm text-red-400 italic">
              "I want to die on Mars, just not on impact" - Elon Musk
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}