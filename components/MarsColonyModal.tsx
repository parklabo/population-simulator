'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart } from 'recharts';
import CountUp from 'react-countup';
import MarsRTSGame from './MarsRTSGame';

interface MarsColonyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Equipment types for humans
interface Equipment {
  humanoids: number;
  cybertrucks: number;
  spaceships: number;
  lasers: number;
  shields: number;
}

export default function MarsColonyModal({ isOpen, onClose }: MarsColonyModalProps) {
  const [currentYear, setCurrentYear] = useState(2024);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [humans, setHumans] = useState(0);
  const [roaches, setRoaches] = useState(0);
  const [casualties, setCasualties] = useState(0);
  const [terraformingLevel, setTerraformingLevel] = useState(0);
  const [battleIntensity, setBattleIntensity] = useState(0);
  const [prevYearRoaches, setPrevYearRoaches] = useState(0);
  const [showRTSGame, setShowRTSGame] = useState(false);
  
  // Equipment state
  const [equipment, setEquipment] = useState<Equipment>({
    humanoids: 0,
    cybertrucks: 0,
    spaceships: 0,
    lasers: 0,
    shields: 0
  });
  
  // Adjustable parameters
  const [humanBirthRate, setHumanBirthRate] = useState(2.0);
  const [techLevel, setTechLevel] = useState(1); // Technology multiplier
  const [productionEnabled, setProductionEnabled] = useState({
    humanoids: true,
    cybertrucks: false,
    spaceships: false
  });
  const [roachReproductionRate, setRoachReproductionRate] = useState(1.5);
  const [missionStatus, setMissionStatus] = useState<'ongoing' | 'success' | 'failure'>('ongoing');

  // 3D rotation for Mars
  const [marsRotation, setMarsRotation] = useState(0);
  const animationFrame = useRef<number>(0);

  // Equipment production rates - memoized to prevent infinite re-renders
  const productionRates = useMemo(() => ({
    humanoids: techLevel * 10,
    cybertrucks: techLevel * 5,
    spaceships: techLevel * 2,
    lasers: techLevel * 20,
    shields: techLevel * 15
  }), [techLevel]);

  // Combat power calculation
  const calculateHumanForce = () => {
    const humanPower = humans * 50;
    const humanoidPower = equipment.humanoids * 200;
    const cybertruckPower = equipment.cybertrucks * 500;
    const spaceshipPower = equipment.spaceships * 2000;
    const laserBonus = equipment.lasers * 10;
    const shieldBonus = equipment.shields * 20;
    
    return humanPower + humanoidPower + cybertruckPower + spaceshipPower + laserBonus + shieldBonus;
  };

  // Full simulation data - calculate once per parameter change, not per year
  const fullSimulationData = useMemo(() => {
    const data = [];
    let prevRoaches = 0;
    
    for (let year = 2024; year <= 2100; year += 2) {
      let h = 0, ro = 0;
      let hum = 0, cyb = 0, spa = 0;
      
      if (year >= 2029) {
        const growthYears = year - 2029;
        h = Math.floor(12 + (growthYears * humanBirthRate * 30) + (growthYears * 20));
        
        // Calculate equipment
        if (year >= 2030) {
          const prodYears = year - 2030;
          hum = productionEnabled.humanoids ? Math.floor(prodYears * productionRates.humanoids) : 0;
          cyb = productionEnabled.cybertrucks ? Math.floor(prodYears * productionRates.cybertrucks) : 0;
          spa = productionEnabled.spaceships ? Math.floor(prodYears * productionRates.spaceships) : 0;
        }
      }
      
      if (year >= 2033) {
        // Initial invasion or reproduction from survivors
        if (year === 2033 || year === 2034) {
          ro = 1000; // Stronger initial invasion force
        } else {
          if (prevRoaches > 0) {
            // Roaches reproduce and get reinforcements
            ro = Math.floor(prevRoaches * Math.pow(roachReproductionRate, 0.4));
            // Random reinforcements
            if (Math.random() > 0.6) {
              ro += Math.floor(100 + Math.random() * 300);
            }
            // Evolution bonus
            if (year > 2050) {
              ro = Math.floor(ro * 1.1);
            }
          } else if (Math.random() > 0.8) {
            // Chance of re-invasion
            ro = Math.floor(50 + Math.random() * 200);
          } else {
            ro = 0;
          }
        }
        
        // Combat simulation if roaches exist
        if (ro > 0) {
          const totalHumanForce = h * 50 + hum * 200 + cyb * 500 + spa * 2000;
          
          // Roach power increases over time
          let roachPowerMultiplier = 15;
          if (year > 2050) roachPowerMultiplier = 20;
          if (year > 2070) roachPowerMultiplier = 25;
          
          const roachForce = ro * roachPowerMultiplier;
          const combatRatio = totalHumanForce / (roachForce + 1);
          
          // Apply kills based on combat ratio
          let roachesKilled = 0;
          if (combatRatio > 10.0) {
            roachesKilled = ro; // Kill all
          } else if (combatRatio > 5.0) {
            roachesKilled = Math.floor(ro * 0.9);
          } else if (combatRatio > 3.0) {
            roachesKilled = Math.floor(ro * 0.7);
          } else if (combatRatio > 2.0) {
            roachesKilled = Math.floor(ro * 0.5);
          } else if (combatRatio > 1.0) {
            roachesKilled = Math.floor(ro * 0.3);
          } else if (combatRatio > 0.5) {
            roachesKilled = Math.floor(ro * 0.1);
          } else {
            roachesKilled = Math.floor(ro * 0.05);
          }
          
          ro = Math.max(0, ro - roachesKilled);
          
          // Elimination threshold
          if (ro < 10 && combatRatio > 2.0) {
            ro = 0;
          }
        }
      }
      
      prevRoaches = ro; // Store for next iteration
      
      data.push({
        year,
        humans: h,
        roaches: ro,
        humanoids: hum,
        cybertrucks: cyb,
        spaceships: spa
      });
    }
    return data;
  }, [humanBirthRate, techLevel, productionEnabled, roachReproductionRate, productionRates]);

  // Chart data - show only up to current year when playing
  const chartData = useMemo(() => {
    if (!hasStarted) {
      // Return empty data structure before start
      return fullSimulationData.map(d => ({
        ...d,
        humans: 0,
        roaches: 0,
        humanoids: 0,
        cybertrucks: 0,
        spaceships: 0
      }));
    }
    
    // Show data up to current year
    return fullSimulationData.map(d => {
      if (d.year <= currentYear) {
        return d;
      }
      return {
        ...d,
        humans: 0,
        roaches: 0,
        humanoids: 0,
        cybertrucks: 0,
        spaceships: 0
      };
    });
  }, [fullSimulationData, hasStarted, currentYear]);

  // 3D Mars rotation animation
  useEffect(() => {
    if (hasStarted) {
      const animate = () => {
        setMarsRotation(prev => prev + 1);
        animationFrame.current = requestAnimationFrame(animate);
      };
      animationFrame.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current);
        }
      };
    }
  }, [hasStarted]);

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
    }, 500); // 0.5초마다 1년 진행 (이전 50ms에서 500ms로 변경)
    
    return () => clearInterval(interval);
  }, [isPlaying]);
  
  // Update states based on current year from simulation data
  useEffect(() => {
    if (!hasStarted) return;
    
    // Find data for current year
    const yearData = fullSimulationData.find(d => d.year === currentYear);
    if (yearData) {
      // Update previous roaches for next calculation
      if (currentYear >= 2033 && yearData.roaches > 0) {
        setPrevYearRoaches(yearData.roaches);
      }
      
      setHumans(yearData.humans);
      setRoaches(yearData.roaches);
      setEquipment({
        humanoids: yearData.humanoids,
        cybertrucks: yearData.cybertrucks,
        spaceships: yearData.spaceships,
        lasers: 0,
        shields: 0
      });
      
      // Calculate casualties (rough estimate based on human decrease)
      if (currentYear > 2033 && yearData.humans > 0) {
        const prevYearData = fullSimulationData.find(d => d.year === currentYear - 1);
        if (prevYearData && prevYearData.humans > yearData.humans) {
          setCasualties(prev => prev + (prevYearData.humans - yearData.humans));
        }
      }
      
      // Update battle intensity
      if (yearData.roaches > 0 && yearData.humans > 0) {
        setBattleIntensity(Math.min(100, Math.random() * 50 + 20));
      } else {
        setBattleIntensity(0);
      }
    }
  }, [currentYear, hasStarted, fullSimulationData]);

  useEffect(() => {
    const yearsPassed = currentYear - 2024;
    const progress = Math.min(yearsPassed / 76, 1);
    
    // Calculate humans
    let calculatedHumans = 0;
    if (currentYear >= 2029) {
      calculatedHumans = 12;
      const growthYears = currentYear - 2029;
      if (growthYears > 0) {
        calculatedHumans = Math.floor(12 + (growthYears * humanBirthRate * 30) + (growthYears * 20));
      }
    }
    
    // Calculate equipment production
    const newEquipment = { ...equipment };
    if (currentYear >= 2030) {
      const prodYears = currentYear - 2030;
      newEquipment.humanoids = productionEnabled.humanoids ? Math.floor(prodYears * productionRates.humanoids) : 0;
      newEquipment.cybertrucks = productionEnabled.cybertrucks ? Math.floor(prodYears * productionRates.cybertrucks) : 0;
      newEquipment.spaceships = productionEnabled.spaceships ? Math.floor(prodYears * productionRates.spaceships) : 0;
      newEquipment.lasers = Math.floor(prodYears * productionRates.lasers);
      newEquipment.shields = Math.floor(prodYears * productionRates.shields);
      setEquipment(newEquipment);
    }
    
    // Calculate roaches
    let calculatedRoaches = 0;
    if (currentYear >= 2033) {
      // First appearance or reproduction
      if (currentYear === 2033) {
        // Initial roach invasion - BALANCED
        calculatedRoaches = 100; // Start smaller
      } else {
        // Use previous year's roaches and apply reproduction
        if (prevYearRoaches > 0) {
          // Roaches reproduce from survivors with controlled growth
          calculatedRoaches = Math.floor(prevYearRoaches * Math.min(roachReproductionRate, 1.2));
          // Occasional reinforcements from space
          if (Math.random() > 0.7 && currentYear < 2080) {
            calculatedRoaches += Math.floor(10 + Math.random() * 30);
          }
          // Evolution - roaches get stronger over time (but less extreme)
          if (currentYear > 2050) {
            calculatedRoaches = Math.floor(calculatedRoaches * 1.02);
          }
          // Cap maximum roaches to prevent overflow
          calculatedRoaches = Math.min(calculatedRoaches, 2000);
        } else if (currentYear < 2070 && Math.random() > 0.85) {
          // Lower chance of re-invasion
          calculatedRoaches = Math.floor(20 + Math.random() * 50);
        } else {
          calculatedRoaches = 0;
        }
      }
      
      // Enhanced combat with equipment (only if roaches exist)
      if (calculatedRoaches > 0) {
        const totalHumanForce = calculatedHumans * 50 + 
                                newEquipment.humanoids * 200 +
                                newEquipment.cybertrucks * 500 +
                                newEquipment.spaceships * 2000 +
                                newEquipment.lasers * 10 +
                                newEquipment.shields * 20;
        
        // Roaches get stronger over time but more balanced
        let roachPowerMultiplier = 8;
        if (currentYear > 2050) {
          roachPowerMultiplier = 10; // Evolution bonus
        }
        if (currentYear > 2070) {
          roachPowerMultiplier = 12; // Super evolution
        }
        
        const roachForce = calculatedRoaches * roachPowerMultiplier;
        const combatRatio = totalHumanForce / (roachForce + 1);
        setBattleIntensity(Math.min(100, combatRatio * 20));
        
        // Apply combat kills - MUCH HARDER TO KILL
        let roachesKilled = 0;
        if (combatRatio > 20.0) {
          // Need overwhelming force to kill all
          roachesKilled = calculatedRoaches;
        } else if (combatRatio > 10.0) {
          // Very strong - kill 80%
          roachesKilled = Math.floor(calculatedRoaches * 0.8);
        } else if (combatRatio > 5.0) {
          // Strong - kill 50%
          roachesKilled = Math.floor(calculatedRoaches * 0.5);
        } else if (combatRatio > 3.0) {
          // Moderate advantage - kill 30%
          roachesKilled = Math.floor(calculatedRoaches * 0.3);
        } else if (combatRatio > 2.0) {
          // Slight advantage - kill 20%
          roachesKilled = Math.floor(calculatedRoaches * 0.2);
        } else if (combatRatio > 1.0) {
          // Barely winning - kill 10%
          roachesKilled = Math.floor(calculatedRoaches * 0.1);
        } else if (combatRatio > 0.5) {
          // Disadvantage - kill 5%
          roachesKilled = Math.floor(calculatedRoaches * 0.05);
        } else {
          // Severe disadvantage - kill 2%
          roachesKilled = Math.floor(calculatedRoaches * 0.02);
        }
        
        calculatedRoaches = Math.max(0, calculatedRoaches - roachesKilled);
        
        // Much harder to completely eliminate
        if (calculatedRoaches < 50 && combatRatio > 10.0) {
          calculatedRoaches = 0;
        }
      }
      
      // Human casualties - MORE DEADLY
      if (calculatedRoaches > 0 && calculatedHumans > 0) {
        // Calculate human force for this combat
        const humanPower = calculatedHumans * 50;
        const humanoidPower = newEquipment.humanoids * 200;
        const cybertruckPower = newEquipment.cybertrucks * 500;
        const spaceshipPower = newEquipment.spaceships * 2000;
        const laserBonus = newEquipment.lasers * 10;
        const shieldBonus = newEquipment.shields * 20;
        const totalHumanForce = humanPower + humanoidPower + cybertruckPower + spaceshipPower + laserBonus + shieldBonus;
        
        const roachAdvantage = roachForce / (totalHumanForce + 1);
        let casualtyRate = 0;
        
        if (roachAdvantage > 2.0) {
          // Roaches dominating - heavy losses
          casualtyRate = 0.25; // Increased death rate
        } else if (roachAdvantage > 1.0) {
          // Roaches winning - moderate losses
          casualtyRate = 0.15; // Increased death rate
        } else if (roachAdvantage > 0.5) {
          // Close battle - some losses
          casualtyRate = 0.08; // Increased death rate
        } else {
          // Humans winning - still take losses
          casualtyRate = 0.03; // Increased from 0.01
        }
        
        const losses = Math.floor(calculatedHumans * casualtyRate);
        calculatedHumans = Math.max(0, calculatedHumans - losses);
        // Note: casualties are tracked in the useEffect that updates states
        
        // Equipment can also be destroyed
        if (roachAdvantage > 1.0 && newEquipment.humanoids > 0) {
          newEquipment.humanoids = Math.floor(newEquipment.humanoids * 0.9);
        }
        if (roachAdvantage > 1.5 && newEquipment.cybertrucks > 0) {
          newEquipment.cybertrucks = Math.floor(newEquipment.cybertrucks * 0.85);
        }
      }
    }
    
    // Update states
    setHumans(Math.max(0, calculatedHumans));
    setRoaches(Math.max(0, calculatedRoaches));
    setPrevYearRoaches(Math.max(0, calculatedRoaches)); // Store for next year
    setTerraformingLevel(progress * 100);
    
    // Determine mission status
    if (currentYear >= 2100) {
      if (calculatedRoaches === 0 && calculatedHumans >= 1000) {
        setMissionStatus('success');
      } else if (calculatedRoaches > 0) {
        setMissionStatus('failure');
      }
    }
  }, [currentYear, humanBirthRate, techLevel, productionEnabled, roachReproductionRate, productionRates]);

  const startSimulation = () => {
    if (!isPlaying) {
      setCurrentYear(2024);
      setHasStarted(true);
    }
    setIsPlaying(!isPlaying);
  };

  const resetSimulation = () => {
    setCurrentYear(2024);
    setIsPlaying(false);
    setHasStarted(false);
    setMissionStatus('ongoing');
    setHumanBirthRate(2.0);
    setTechLevel(1);
    setProductionEnabled({ humanoids: true, cybertrucks: false, spaceships: false });
    setRoachReproductionRate(1.5);
    setHumans(0);
    setRoaches(0);
    setPrevYearRoaches(0);
    setCasualties(0);
    setEquipment({
      humanoids: 0,
      cybertrucks: 0,
      spaceships: 0,
      lasers: 0,
      shields: 0
    });
  };

  const simulationComplete = currentYear >= 2100;
  const humanForce = calculateHumanForce();
  const roachForce = roaches * 8;
  const combatRatio = humanForce / (roachForce + 1);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mars-colony-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-red-900/20 to-black/90 backdrop-blur-md" />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl rounded-3xl p-6 max-w-7xl w-full max-h-[92vh] overflow-y-auto border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚀</span>
              <div>
                <h2 className="text-2xl font-bold text-white">SpaceX Mars War Simulator</h2>
                <p className="text-xs text-gray-400">
                  Advanced Equipment System • 2024-2100 • Defeat Alien Roaches with Technology
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all"
            >
              <span className="text-gray-400 hover:text-white">✕</span>
            </button>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Panel - Controls */}
            <div className="col-span-3">
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                {/* Year Display */}
                <div className="text-center mb-6">
                  <p className="text-xs text-gray-500 mb-2">MISSION YEAR</p>
                  <motion.div
                    key={currentYear}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    <p className="text-5xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                      {currentYear}
                    </p>
                  </motion.div>
                  <div className="mt-2 h-1 bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-red-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${(currentYear - 2024) / 76 * 100}%` }}
                    />
                  </div>
                  {/* Mission Events */}
                  <div className="mt-3 text-[10px] text-gray-400">
                    {currentYear < 2029 && <p>🚀 Preparing Mission...</p>}
                    {currentYear === 2029 && <p className="text-blue-400 animate-pulse">🌍 First Humans Arrive!</p>}
                    {currentYear === 2030 && <p className="text-purple-400">🏭 Production Begins</p>}
                    {currentYear === 2033 && <p className="text-red-400 animate-pulse">⚠️ Alien Roaches Detected!</p>}
                    {currentYear > 2033 && roaches > 0 && <p className="text-orange-400">⚔️ War in Progress</p>}
                    {currentYear > 2033 && roaches === 0 && <p className="text-green-400">✅ Mars Secured!</p>}
                  </div>
                </div>
                
                {/* Control Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startSimulation}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 transition-all"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>{isPlaying ? '⏸' : '▶'}</span>
                      {isPlaying ? 'Pause' : 'Start War'}
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowRTSGame(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/25 transition-all"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>🎮</span>
                      Play RTS Game
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetSimulation}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all border border-white/10"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>↺</span>
                      Reset
                    </span>
                  </motion.button>
                </div>
                
                {/* Equipment Display */}
                {hasStarted && (
                  <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-xs text-blue-400 font-bold mb-2">🛡️ EQUIPMENT</p>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-gray-400">🤖 Humanoids:</span>
                        <span className="text-white font-mono">{equipment.humanoids}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">🚗 Cybertrucks:</span>
                        <span className="text-white font-mono">{equipment.cybertrucks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">🚀 Spaceships:</span>
                        <span className="text-white font-mono">{equipment.spaceships}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">⚡ Laser Guns:</span>
                        <span className="text-white font-mono">{equipment.lasers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">🛡️ Energy Shields:</span>
                        <span className="text-white font-mono">{equipment.shields}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Center Panel - 3D Mars & Visualization */}
            <div className="col-span-6">
              <div className="relative">
                {/* 3D Mars Display */}
                <div className="bg-gradient-to-br from-red-900/40 via-black/80 to-orange-900/40 rounded-3xl p-4 border-2 border-red-500/50 mb-4 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-2xl animate-pulse">⚔️</span>
                      MARS BATTLEFIELD
                      <span className="text-2xl animate-pulse">⚔️</span>
                    </h3>
                    <div className="flex items-center gap-3">
                      {roaches > 0 && humans > 0 && (
                        <span className="px-3 py-1 bg-red-500/30 border border-red-500 rounded-full text-xs text-red-300 animate-pulse">
                          🔴 BATTLE ACTIVE
                        </span>
                      )}
                      {roaches === 0 && humans > 0 && hasStarted && (
                        <span className="px-3 py-1 bg-green-500/30 border border-green-500 rounded-full text-xs text-green-300">
                          ✅ VICTORY!
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative h-80 bg-gradient-to-b from-orange-900/20 via-red-950/40 to-black rounded-2xl overflow-hidden border border-red-800/50">
                    {/* Game-style grid background */}
                    <div className="absolute inset-0">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `
                          linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                      }} />
                    </div>
                    
                    {/* Mars Terrain Layer */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-red-900/60 via-red-800/30 to-transparent">
                      {/* Terrain features */}
                      <div className="absolute bottom-0 left-10 w-24 h-16 bg-red-800/40 rounded-t-full blur-sm" />
                      <div className="absolute bottom-0 right-20 w-32 h-20 bg-red-900/50 rounded-t-full blur-md" />
                      <div className="absolute bottom-0 left-1/2 w-40 h-12 bg-orange-900/40 rounded-t-full blur-lg" />
                    </div>
                    
                    {/* Game Field - Split Screen Style */}
                    <div className="absolute inset-0 flex">
                      {/* Human Side (Left) */}
                      <div className="relative w-1/2 border-r-2 border-yellow-500/30">
                        <div className="absolute top-4 left-4">
                          <div className="bg-blue-500/20 border border-blue-400 rounded-lg px-3 py-1">
                            <p className="text-xs text-blue-300 font-bold">HUMAN ALLIANCE</p>
                            <p className="text-2xl font-bold text-white">{humans}</p>
                          </div>
                        </div>
                        
                        {/* Human Units Display with sounds */}
                        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2">
                          {humans > 0 && (
                            <div className="relative">
                              <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-4xl filter drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                              >
                                👨‍🚀
                              </motion.div>
                              {battleIntensity > 30 && (
                                <motion.span
                                  className="absolute -top-4 left-0 text-[10px] text-blue-300 font-bold"
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                                >
                                  For Mars!
                                </motion.span>
                              )}
                            </div>
                          )}
                          {equipment.humanoids > 0 && Array.from({ length: Math.min(3, Math.ceil(equipment.humanoids / 100)) }).map((_, i) => (
                            <div key={`humanoid-${i}`} className="relative">
                              <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                className="text-3xl filter drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                              >
                                🤖
                              </motion.div>
                              {battleIntensity > 20 && Math.random() > 0.7 && (
                                <motion.span
                                  className="absolute -bottom-3 left-0 text-[8px] text-purple-300 font-mono"
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 3, delay: i * 0.5 }}
                                >
                                  BEEP
                                </motion.span>
                              )}
                            </div>
                          ))}
                          {equipment.cybertrucks > 0 && Array.from({ length: Math.min(2, Math.ceil(equipment.cybertrucks / 100)) }).map((_, i) => (
                            <div key={`truck-${i}`} className="relative">
                              <motion.div
                                animate={{ x: [-5, 5, -5] }}
                                transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                                className="text-3xl filter drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]"
                              >
                                🚗
                              </motion.div>
                              {battleIntensity > 10 && (
                                <motion.span
                                  className="absolute -bottom-3 left-0 text-[8px] text-orange-300 font-bold"
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 4, delay: i * 0.7 }}
                                >
                                  VROOM
                                </motion.span>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Human Power Bar */}
                        <div className="absolute bottom-8 left-4 right-4">
                          <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-blue-500/50">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                              animate={{ width: `${Math.min(100, (humanForce / 100000) * 100)}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <p className="text-[10px] text-blue-300 mt-1">Power: {humanForce.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {/* Roach Side (Right) */}
                      <div className="relative w-1/2">
                        <div className="absolute top-4 right-4">
                          <div className="bg-red-500/20 border border-red-400 rounded-lg px-3 py-1">
                            <p className="text-xs text-red-300 font-bold">ALIEN SWARM</p>
                            <p className="text-2xl font-bold text-white">{roaches}</p>
                          </div>
                        </div>
                        
                        {/* Roach Units Display */}
                        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-1 flex-wrap px-2">
                          {roaches > 0 && Array.from({ length: Math.min(15, Math.ceil(roaches / 100)) }).map((_, i) => (
                            <motion.div
                              key={`roach-${i}`}
                              animate={{ 
                                x: [0, Math.random() * 10 - 5, 0],
                                y: [0, Math.random() * 10 - 5, 0]
                              }}
                              transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                              className="text-2xl filter drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                            >
                              🪳
                            </motion.div>
                          ))}
                        </div>
                        
                        {/* Roach Power Bar */}
                        <div className="absolute bottom-8 left-4 right-4">
                          <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-red-500/50">
                            <motion.div
                              className="h-full bg-gradient-to-r from-red-600 to-orange-400"
                              animate={{ width: `${Math.min(100, (roachForce / 50000) * 100)}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <p className="text-[10px] text-red-300 mt-1">Power: {roachForce.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {/* Center Battle Line */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                          {/* VS Badge - Static with pulse effect instead of rotation */}
                          <motion.div 
                            className="w-20 h-20 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-[0_0_30px_rgba(251,191,36,0.8)]"
                            animate={{ 
                              scale: [1, 1.1, 1],
                              boxShadow: [
                                "0 0 30px rgba(251,191,36,0.8)",
                                "0 0 50px rgba(251,191,36,1)",
                                "0 0 30px rgba(251,191,36,0.8)"
                              ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <span className="text-2xl font-black text-white">VS</span>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Battle Effects Layer */}
                    {roaches > 0 && humans > 0 && battleIntensity > 0 && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Laser attacks with sound effects */}
                        {Array.from({ length: Math.min(5, Math.ceil(battleIntensity / 20)) }).map((_, i) => (
                          <motion.div
                            key={`laser-${i}`}
                            className="absolute"
                            style={{
                              left: `${20 + Math.random() * 30}%`,
                              top: `${30 + Math.random() * 40}%`
                            }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ 
                              duration: 0.2, 
                              repeat: Infinity, 
                              repeatDelay: Math.random() * 2,
                              delay: i * 0.1 
                            }}
                          >
                            <div className="w-20 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-transparent" 
                                 style={{ transform: `rotate(${-30 + Math.random() * 60}deg)` }} />
                            {/* Sound effect indicator */}
                            <motion.div
                              className="absolute -top-4 -left-2"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0] }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              <span className="text-xs text-cyan-400 font-bold">PEW!</span>
                            </motion.div>
                          </motion.div>
                        ))}
                        
                        {/* Explosions with sound effects */}
                        {Array.from({ length: Math.min(3, Math.ceil(battleIntensity / 30)) }).map((_, i) => (
                          <motion.div
                            key={`explosion-${i}`}
                            className="absolute"
                            style={{
                              right: `${10 + Math.random() * 40}%`,
                              top: `${40 + Math.random() * 30}%`
                            }}
                            animate={{
                              scale: [0, 2, 0],
                              opacity: [0, 1, 0]
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              repeatDelay: 1 + Math.random() * 2,
                              delay: i * 0.2
                            }}
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-md" />
                            {/* Sound effect indicator */}
                            <motion.div
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: [0, 1, 0], scale: [1, 2, 0] }}
                              transition={{ duration: 0.5 }}
                            >
                              <span className="text-xl text-orange-400 font-black">BOOM!</span>
                            </motion.div>
                          </motion.div>
                        ))}
                        
                        {/* Roach attack sounds */}
                        {roachForce > humanForce && Array.from({ length: 2 }).map((_, i) => (
                          <motion.div
                            key={`roach-sound-${i}`}
                            className="absolute"
                            style={{
                              right: `${30 + i * 20}%`,
                              bottom: `${30 + Math.random() * 20}%`
                            }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              repeatDelay: 2 + Math.random(),
                              delay: i * 0.5
                            }}
                          >
                            <span className="text-sm text-green-400 font-bold">SCREECH!</span>
                          </motion.div>
                        ))}
                        
                        {/* Combat intensity indicator */}
                        {battleIntensity > 50 && (
                          <motion.div
                            className="absolute top-1/3 left-1/2 -translate-x-1/2"
                            animate={{ 
                              opacity: [0, 1, 0],
                              scale: [0.8, 1.2, 0.8]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity
                            }}
                          >
                            <div className="bg-red-900/80 border-2 border-red-500 rounded-lg px-4 py-2">
                              <p className="text-red-300 font-black text-lg">⚔️ INTENSE BATTLE!</p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                    
                    {/* Spaceships Flying Above with sound */}
                    {equipment.spaceships > 0 && (
                      <div className="absolute top-4 left-0 right-0">
                        <motion.div
                          className="flex justify-center gap-8"
                          animate={{ x: [-100, 100, -100] }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        >
                          {Array.from({ length: Math.min(3, Math.ceil(equipment.spaceships / 200)) }).map((_, i) => (
                            <div key={i} className="relative">
                              <span className="text-2xl filter drop-shadow-[0_0_15px_rgba(147,51,234,0.8)]">
                                🛸
                              </span>
                              <motion.span
                                className="absolute -bottom-4 left-0 text-[10px] text-purple-400 font-bold"
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                              >
                                WHOOSH
                              </motion.span>
                            </div>
                          ))}
                        </motion.div>
                      </div>
                    )}
                    
                    {/* Sound Wave Indicator with dynamic intensity */}
                    {(roaches > 0 || humans > 0) && battleIntensity > 0 && (
                      <div className="absolute bottom-4 right-4">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <motion.div
                              key={`wave-${i}`}
                              className={`w-1 rounded-full ${
                                battleIntensity > 50 
                                  ? 'bg-gradient-to-t from-red-400 to-orange-400' 
                                  : battleIntensity > 25
                                  ? 'bg-gradient-to-t from-yellow-400 to-orange-400'
                                  : 'bg-gradient-to-t from-green-400 to-cyan-400'
                              }`}
                              animate={{
                                height: [
                                  `${4 + (battleIntensity / 10)}px`,
                                  `${8 + (battleIntensity / 5)}px`,
                                  `${4 + (battleIntensity / 10)}px`
                                ]
                              }}
                              transition={{
                                duration: 0.3 + Math.random() * 0.2,
                                repeat: Infinity,
                                delay: i * 0.05
                              }}
                            />
                          ))}
                          <div className="ml-1">
                            <span className="text-[8px] text-gray-400">SOUND</span>
                            {battleIntensity > 75 && (
                              <motion.span
                                className="block text-[8px] text-red-400 font-bold"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                              >
                                MAX!
                              </motion.span>
                            )}
                          </div>
                        </div>
                        
                        {/* Ambient battle sounds */}
                        {battleIntensity > 0 && (
                          <div className="absolute -top-8 right-0 space-y-1">
                            {battleIntensity > 10 && (
                              <motion.div
                                className="text-[8px] text-gray-500 text-right"
                                animate={{ opacity: [0, 0.6, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                              >
                                💥 distant explosions...
                              </motion.div>
                            )}
                            {battleIntensity > 30 && (
                              <motion.div
                                className="text-[8px] text-yellow-500 text-right"
                                animate={{ opacity: [0, 0.7, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                              >
                                🔫 laser fire...
                              </motion.div>
                            )}
                            {battleIntensity > 60 && (
                              <motion.div
                                className="text-[8px] text-red-500 text-right font-bold"
                                animate={{ opacity: [0, 0.8, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                              >
                                ⚠️ WARNING: HEAVY COMBAT
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                  </div>
                </div>
                
                {/* Chart */}
                <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Force Comparison</h3>
                  </div>
                  
                  <div className="relative">
                    {!hasStarted && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
                        <div className="text-center">
                          <p className="text-gray-400 text-lg mb-2">Press &quot;Start War&quot; to begin</p>
                          <p className="text-gray-500 text-sm">Configure settings below first</p>
                        </div>
                      </div>
                    )}
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart 
                        data={chartData}
                        key="mars-war-chart"
                      >
                        <defs>
                          <linearGradient id="humanGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="roachGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="year" 
                          stroke="#9CA3AF"
                          domain={[2024, 2100]}
                          type="number"
                          ticks={[2024, 2040, 2060, 2080, 2100]}
                          allowDataOverflow={true}
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                          labelStyle={{ color: '#F3F4F6' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="humans"
                          stackId="1"
                          stroke="#3B82F6"
                          fillOpacity={1}
                          fill="url(#humanGradient)"
                          isAnimationActive={false}
                          animationDuration={0}
                        />
                        <Area
                          type="monotone"
                          dataKey="roaches"
                          stroke="#EF4444"
                          fillOpacity={1}
                          fill="url(#roachGradient)"
                          isAnimationActive={false}
                          animationDuration={0}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Force Display */}
                  {hasStarted && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                        <p className="text-xs text-blue-400 font-bold mb-1">🌍 HUMAN ALLIANCE</p>
                        <p className="text-2xl font-bold text-white">{humanForce.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {humans} humans + {equipment.humanoids + equipment.cybertrucks + equipment.spaceships} units
                        </p>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                        <p className="text-xs text-red-400 font-bold mb-1">🪳 ALIEN SWARM</p>
                        <p className="text-2xl font-bold text-white">{roachForce.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {roaches} alien roaches
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Panel - Results & Status */}
            <div className="col-span-3">
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">COMBAT STATUS</h3>
                
                {hasStarted ? (
                  <div className="space-y-3">
                    {/* Combat Ratio */}
                    <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 rounded-xl p-3 border border-orange-500/20">
                      <p className="text-[10px] text-orange-400 uppercase mb-1">Combat Ratio</p>
                      <p className={`text-2xl font-bold ${
                        combatRatio > 2 ? 'text-green-400' : 
                        combatRatio > 1 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {combatRatio.toFixed(2)}x
                      </p>
                      <p className="text-[9px] text-gray-400 mt-1">
                        {combatRatio > 3 ? '🎯 Dominating!' :
                         combatRatio > 1.5 ? '⚔️ Winning' :
                         combatRatio > 0.5 ? '⚠️ Struggling' : '💀 Losing!'}
                      </p>
                    </div>
                    
                    {/* Population Status */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-blue-400">Humans:</span>
                        <span className="text-white font-bold">
                          {humans}
                          {casualties > 0 && humans > 0 && (
                            <span className="text-red-400 text-[10px] ml-1">(-{Math.min(casualties, 99)})</span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-red-400">Roaches:</span>
                        <span className={`font-bold ${roaches > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {roaches} {roaches === 0 && '✅'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-400">Casualties:</span>
                        <span className={`font-bold ${casualties > 50 ? 'text-red-400' : casualties > 20 ? 'text-orange-400' : 'text-white'}`}>
                          {casualties} {casualties > 100 && '💀'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mission Status */}
                    {simulationComplete && (
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", duration: 0.8 }}
                        className={`p-3 rounded-xl border relative overflow-hidden ${
                          missionStatus === 'success' 
                            ? 'bg-green-900/30 border-green-500/30' 
                            : 'bg-red-900/30 border-red-500/30'
                        }`}
                      >
                        {/* Victory/Defeat Animation Background */}
                        {missionStatus === 'success' && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-green-500/20"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                        
                        <motion.p 
                          className={`text-lg font-bold text-center relative z-10 ${
                            missionStatus === 'success' ? 'text-green-400' : 'text-red-400'
                          }`}
                          animate={missionStatus === 'success' ? {
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          } : {
                            y: [0, -2, 0],
                            opacity: [1, 0.7, 1]
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {missionStatus === 'success' ? '🎉 VICTORY!' : '💀 DEFEAT'}
                        </motion.p>
                        
                        {/* Sound effect text animations */}
                        {missionStatus === 'success' ? (
                          <>
                            <motion.div
                              className="absolute top-0 left-0 text-yellow-400 font-black text-xs"
                              animate={{ 
                                opacity: [0, 1, 0],
                                x: [0, 20, 0],
                                y: [0, -10, 0]
                              }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              FANFARE!
                            </motion.div>
                            <motion.div
                              className="absolute bottom-0 right-0 text-green-300 font-black text-xs"
                              animate={{ 
                                opacity: [0, 1, 0],
                                scale: [0.5, 1.5, 0.5]
                              }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            >
                              🎺 TA-DA!
                            </motion.div>
                          </>
                        ) : (
                          <>
                            <motion.div
                              className="absolute top-0 right-0 text-red-300 font-mono text-xs"
                              animate={{ 
                                opacity: [0, 1, 0],
                                rotate: [0, -10, 0]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              GAME OVER
                            </motion.div>
                            <motion.div
                              className="absolute bottom-0 left-0 text-gray-400 text-xs"
                              animate={{ opacity: [0.3, 0.7, 0.3] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              ☠️ wasted...
                            </motion.div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">Start simulation to see combat</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Parameters Section */}
          <div className="relative mt-6">
            <div className="relative bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-3xl p-6 border border-white/5">
              <h3 className="text-xl font-semibold text-white mb-5">
                ⚙️ War Configuration
              </h3>
              
              {/* Two sections: Human and Alien */}
              <div className="grid grid-cols-2 gap-6">
                {/* Human Configuration */}
                <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/20">
                  <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                    🌍 Human Alliance
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Human Growth */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Population Growth Rate
                      </label>
                      <div className="mars-slider">
                        <input
                          type="range"
                          min="0.5"
                          max="4.0"
                          step="0.1"
                          value={humanBirthRate}
                          onChange={(e) => setHumanBirthRate(parseFloat(e.target.value))}
                          className="w-full"
                          style={{ color: '#3B82F6' }}
                        />
                        <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                          <span>0.5x</span>
                          <span>1.5x</span>
                          <span>2.5x</span>
                          <span>3.5x</span>
                          <span>4.0x</span>
                        </div>
                      </div>
                      <div className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20 mt-2">
                        <p className="text-center text-xl font-bold text-blue-400">
                          {humanBirthRate.toFixed(1)}x
                        </p>
                      </div>
                    </div>
                    
                    {/* Technology Level */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Technology Level
                      </label>
                      <div className="mars-slider">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={techLevel}
                          onChange={(e) => setTechLevel(parseInt(e.target.value))}
                          className="w-full"
                          style={{ color: '#A855F7' }}
                        />
                        <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                          <span>1</span>
                          <span>3</span>
                          <span>5</span>
                          <span>7</span>
                          <span>10</span>
                        </div>
                      </div>
                      <div className="bg-purple-500/10 rounded-lg p-2 border border-purple-500/20 mt-2">
                        <p className="text-center text-xl font-bold text-purple-400">
                          Level {techLevel}
                        </p>
                      </div>
                    </div>
                    
                    {/* Production Options */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-3">
                        Equipment Production
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 p-2 bg-black/30 rounded-lg hover:bg-black/50 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={productionEnabled.humanoids}
                            onChange={(e) => setProductionEnabled(prev => ({ ...prev, humanoids: e.target.checked }))}
                            className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-white text-sm">🤖 Humanoids</span>
                          <span className="text-[10px] text-gray-500 ml-auto">200 PWR</span>
                        </label>
                        
                        <label className="flex items-center gap-2 p-2 bg-black/30 rounded-lg hover:bg-black/50 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={productionEnabled.cybertrucks}
                            onChange={(e) => setProductionEnabled(prev => ({ ...prev, cybertrucks: e.target.checked }))}
                            className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-white text-sm">🚗 Cybertrucks</span>
                          <span className="text-[10px] text-gray-500 ml-auto">500 PWR</span>
                        </label>
                        
                        <label className="flex items-center gap-2 p-2 bg-black/30 rounded-lg hover:bg-black/50 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={productionEnabled.spaceships}
                            onChange={(e) => setProductionEnabled(prev => ({ ...prev, spaceships: e.target.checked }))}
                            className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-white text-sm">🚀 Spaceships</span>
                          <span className="text-[10px] text-gray-500 ml-auto">2000 PWR</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Alien Configuration */}
                <div className="bg-red-500/5 rounded-2xl p-4 border border-red-500/20">
                  <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                    🪳 Alien Roaches
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Roach Reproduction */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Reproduction Rate
                      </label>
                      <div className="mars-slider">
                        <input
                          type="range"
                          min="1.0"
                          max="2.5"
                          step="0.1"
                          value={roachReproductionRate}
                          onChange={(e) => setRoachReproductionRate(parseFloat(e.target.value))}
                          className="w-full"
                          style={{ color: '#EF4444' }}
                        />
                        <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                          <span>1.0x</span>
                          <span>1.5x</span>
                          <span>2.0x</span>
                          <span>2.5x</span>
                        </div>
                      </div>
                      <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/20 mt-2">
                        <p className="text-center text-xl font-bold text-red-400">
                          {roachReproductionRate.toFixed(1)}x
                        </p>
                      </div>
                    </div>
                    
                    {/* Roach Stats */}
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-2">Alien Capabilities</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Base Power:</span>
                          <span className="text-red-400 font-bold">8 PWR</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Initial Count:</span>
                          <span className="text-red-400 font-bold">300</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Arrival Year:</span>
                          <span className="text-red-400 font-bold">2033</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Difficulty Presets */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Difficulty Presets
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setRoachReproductionRate(1.2)}
                          className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-xs text-green-400 hover:bg-green-500/20 transition-all"
                        >
                          Easy
                        </button>
                        <button
                          onClick={() => setRoachReproductionRate(1.5)}
                          className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-400 hover:bg-yellow-500/20 transition-all"
                        >
                          Normal
                        </button>
                        <button
                          onClick={() => setRoachReproductionRate(2.0)}
                          className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          Hard
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Equipment Power Info */}
              <div className="mt-4 grid grid-cols-5 gap-2 text-[10px]">
                <div className="bg-black/30 rounded-lg p-2 text-center border border-white/10">
                  <p className="text-gray-500">Humanoid</p>
                  <p className="text-purple-400 font-bold">200 PWR</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 text-center border border-white/10">
                  <p className="text-gray-500">Cybertruck</p>
                  <p className="text-orange-400 font-bold">500 PWR</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 text-center border border-white/10">
                  <p className="text-gray-500">Spaceship</p>
                  <p className="text-blue-400 font-bold">2000 PWR</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 text-center border border-white/10">
                  <p className="text-gray-500">Human</p>
                  <p className="text-green-400 font-bold">50 PWR</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 text-center border border-white/10">
                  <p className="text-gray-500">Roach</p>
                  <p className="text-red-400 font-bold">8 PWR</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-xs text-blue-400 text-center">
                  💡 Strategy: Increase tech level for better equipment, focus production on powerful units, and maintain high human growth!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
      
      {/* StarCraft-style RTS Game Modal */}
      <MarsRTSGame 
        isOpen={showRTSGame}
        onClose={() => setShowRTSGame(false)}
      />
    </AnimatePresence>
  );
}