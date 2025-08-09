'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MarsRTSGameProps {
  isOpen: boolean;
  onClose: () => void;
}

// Resource types
interface Resources {
  minerals: number;
  vespeneGas: number;
  supply: number;
  maxSupply: number;
}

// Unit types
interface Unit {
  id: string;
  type: 'scv' | 'marine' | 'marauder' | 'tank' | 'battlecruiser' | 'drone' | 'zergling' | 'roach' | 'hydralisk' | 'ultralisk';
  health: number;
  maxHealth: number;
  damage: number;
  armor: number;
  speed: number;
  cost: {
    minerals: number;
    gas: number;
    supply: number;
  };
  buildTime: number;
}

// Building types
interface Building {
  id: string;
  type: 'command_center' | 'supply_depot' | 'barracks' | 'factory' | 'starport' | 'hatchery' | 'spawning_pool' | 'roach_warren';
  health: number;
  maxHealth: number;
  constructionProgress: number;
  isComplete: boolean;
}

// Unit stats database (StarCraft-inspired balance)
const UNIT_STATS = {
  // Terran units
  scv: { health: 60, damage: 5, armor: 0, speed: 2.8, cost: { minerals: 50, gas: 0, supply: 1 }, buildTime: 17 },
  marine: { health: 45, damage: 6, armor: 0, speed: 3.15, cost: { minerals: 50, gas: 0, supply: 1 }, buildTime: 25 },
  marauder: { health: 125, damage: 10, armor: 1, speed: 2.25, cost: { minerals: 100, gas: 25, supply: 2 }, buildTime: 30 },
  tank: { health: 175, damage: 35, armor: 2, speed: 2.25, cost: { minerals: 150, gas: 125, supply: 3 }, buildTime: 45 },
  battlecruiser: { health: 550, damage: 25, armor: 3, speed: 1.875, cost: { minerals: 400, gas: 300, supply: 6 }, buildTime: 90 },
  
  // Zerg units (Roach faction)
  drone: { health: 40, damage: 5, armor: 0, speed: 3.94, cost: { minerals: 50, gas: 0, supply: 1 }, buildTime: 17 },
  zergling: { health: 35, damage: 5, armor: 0, speed: 4.13, cost: { minerals: 25, gas: 0, supply: 0.5 }, buildTime: 24 },
  roach: { health: 145, damage: 16, armor: 1, speed: 3.0, cost: { minerals: 75, gas: 25, supply: 2 }, buildTime: 27 },
  hydralisk: { health: 90, damage: 12, armor: 0, speed: 3.15, cost: { minerals: 100, gas: 50, supply: 2 }, buildTime: 33 },
  ultralisk: { health: 500, damage: 35, armor: 4, speed: 2.95, cost: { minerals: 300, gas: 200, supply: 6 }, buildTime: 55 }
};

export default function MarsRTSGame({ isOpen, onClose }: MarsRTSGameProps) {
  // Use useRef to persist the counter across renders
  const unitIdCounter = useRef(0);
  // Game state
  const [gameTime, setGameTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);
  
  // Resources
  const [terranResources, setTerranResources] = useState<Resources>({
    minerals: 50,
    vespeneGas: 0,
    supply: 6,
    maxSupply: 10
  });
  
  const [zergResources, setZergResources] = useState<Resources>({
    minerals: 50,
    vespeneGas: 0,
    supply: 6,
    maxSupply: 10
  });
  
  // Units - Start with some initial units
  const [terranUnits, setTerranUnits] = useState<Unit[]>(() => {
    // Start with 6 SCVs
    const initialUnits: Unit[] = [];
    for (let i = 0; i < 6; i++) {
      const stats = UNIT_STATS.scv;
      unitIdCounter.current++;
      initialUnits.push({
        id: `scv-initial-${unitIdCounter.current}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'scv',
        health: stats.health,
        maxHealth: stats.health,
        damage: stats.damage,
        armor: stats.armor,
        speed: stats.speed,
        cost: stats.cost,
        buildTime: stats.buildTime
      });
    }
    return initialUnits;
  });
  
  const [zergUnits, setZergUnits] = useState<Unit[]>(() => {
    // Start with 6 drones
    const initialUnits: Unit[] = [];
    for (let i = 0; i < 6; i++) {
      const stats = UNIT_STATS.drone;
      unitIdCounter.current++;
      initialUnits.push({
        id: `drone-initial-${unitIdCounter.current}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'drone',
        health: stats.health,
        maxHealth: stats.health,
        damage: stats.damage,
        armor: stats.armor,
        speed: stats.speed,
        cost: stats.cost,
        buildTime: stats.buildTime
      });
    }
    return initialUnits;
  });
  
  // Buildings
  // const [terranBuildings, setTerranBuildings] = useState<Building[]>([
  //   { id: 'cc1', type: 'command_center', health: 1500, maxHealth: 1500, constructionProgress: 100, isComplete: true }
  // ]);
  // const [zergBuildings, setZergBuildings] = useState<Building[]>([
  //   { id: 'hatch1', type: 'hatchery', health: 1250, maxHealth: 1250, constructionProgress: 100, isComplete: true }
  // ]);
  
  // Production queue
  const [terranQueue, setTerranQueue] = useState<Array<{ unit: string; progress: number }>>([]);
  const [zergQueue, setZergQueue] = useState<Array<{ unit: string; progress: number }>>([]);
  
  // Selected units/buildings
  // const [selectedTerran, setSelectedTerran] = useState<string[]>([]);
  // const [selectedZerg, setSelectedZerg] = useState<string[]>([]);
  
  // Game messages
  const [messages, setMessages] = useState<string[]>(['Welcome to Mars RTS!', 'Build workers to gather resources']);
  
  // Income rates (per second)
  // const [terranIncome, setTerranIncome] = useState({ minerals: 0, gas: 0 });
  // const [zergIncome, setZergIncome] = useState({ minerals: 0, gas: 0 });
  
  // Battle state
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [terranCasualties, setTerranCasualties] = useState(0);
  const [zergCasualties, setZergCasualties] = useState(0);
  const [gameWinner, setGameWinner] = useState<string | null>(null);

  // Game loop
  useEffect(() => {
    if (!isPaused && isOpen) {
      const interval = setInterval(() => {
        setGameTime(prev => prev + 1);
        
        // Resource gathering (based on worker count)
        const terranWorkers = terranUnits.filter(u => u.type === 'scv').length;
        const zergWorkers = zergUnits.filter(u => u.type === 'drone').length;
        
        setTerranResources(prev => ({
          ...prev,
          minerals: Math.min(9999, prev.minerals + terranWorkers * 0.7 * gameSpeed),
          vespeneGas: Math.min(9999, prev.vespeneGas + Math.floor(terranWorkers * 0.3) * gameSpeed)
        }));
        
        setZergResources(prev => ({
          ...prev,
          minerals: Math.min(9999, prev.minerals + zergWorkers * 0.8 * gameSpeed),
          vespeneGas: Math.min(9999, prev.vespeneGas + Math.floor(zergWorkers * 0.4) * gameSpeed)
        }));
        
        // Update production queues
        setTerranQueue(prev => prev.map(item => ({
          ...item,
          progress: Math.min(100, item.progress + (100 / UNIT_STATS[item.unit as keyof typeof UNIT_STATS].buildTime) * gameSpeed)
        })).filter(item => {
          if (item.progress >= 100) {
            // Unit completed
            createUnit('terran', item.unit as Unit['type']);
            return false;
          }
          return true;
        }));
        
        setZergQueue(prev => prev.map(item => ({
          ...item,
          progress: Math.min(100, item.progress + (100 / UNIT_STATS[item.unit as keyof typeof UNIT_STATS].buildTime) * gameSpeed)
        })).filter(item => {
          if (item.progress >= 100) {
            // Unit completed
            createUnit('zerg', item.unit as Unit['type']);
            return false;
          }
          return true;
        }));
        
        // ZERG AI - Auto produce units (AGGRESSIVE SWARM STRATEGY)
        if (gameTime % 2 === 0) { // Every 2 seconds - faster decision making
          // Check current state
          const drones = zergUnits.filter(u => u.type === 'drone').length;
          const zerglings = zergUnits.filter(u => u.type === 'zergling').length;
          const roaches = zergUnits.filter(u => u.type === 'roach').length;
          const hydralisks = zergUnits.filter(u => u.type === 'hydralisk').length;
          const ultralisks = zergUnits.filter(u => u.type === 'ultralisk').length;
          const combatUnits = zergUnits.filter(u => u.type !== 'drone').length;
          const terranThreat = terranUnits.filter(u => u.type !== 'scv').length;
          
          // Zerg AI Strategy Phases
          const gamePhase = gameTime < 30 ? 'early' : gameTime < 90 ? 'mid' : 'late';
          
          // SUPPLY CHECK - Build Overlords when needed
          if (zergResources.supply >= zergResources.maxSupply - 2 && zergResources.minerals >= 100) {
            setZergResources(prev => ({
              ...prev,
              minerals: prev.minerals - 100,
              maxSupply: prev.maxSupply + 8
            }));
            addMessage('🎈 Zerg spawned Overlord! +8 supply');
          }
          
          // Early game: Focus on economy and basic units
          if (gamePhase === 'early') {
            if (drones < 12 && zergResources.minerals >= 50) {
              queueUnit('zerg', 'drone');
            } else if (zergResources.minerals >= 25 && zergQueue.length < 2) {
              // Mass cheap zerglings early
              queueUnit('zerg', 'zergling');
              if (zergResources.minerals >= 50) {
                queueUnit('zerg', 'zergling');
              }
            }
          }
          // Mid game: Transition to roaches and hydralisks
          else if (gamePhase === 'mid') {
            if (drones < 16 && zergResources.minerals >= 50 && Math.random() > 0.6) {
              queueUnit('zerg', 'drone');
            } else if (zergResources.minerals >= 75 && zergResources.vespeneGas >= 25 && roaches < 8) {
              // Prioritize roaches for tankiness
              queueUnit('zerg', 'roach');
            } else if (zergResources.minerals >= 100 && zergResources.vespeneGas >= 50 && hydralisks < 6) {
              // Add hydralisks for DPS
              queueUnit('zerg', 'hydralisk');
            } else if (zergResources.minerals >= 25) {
              // Fill with zerglings
              queueUnit('zerg', 'zergling');
            }
          }
          // Late game: Tech to ultralisks
          else {
            if (zergResources.minerals >= 300 && zergResources.vespeneGas >= 200 && ultralisks < 3) {
              // Build powerful ultralisks
              queueUnit('zerg', 'ultralisk');
            } else if (zergResources.minerals >= 100 && zergResources.vespeneGas >= 50) {
              // Continue hydralisk production
              queueUnit('zerg', 'hydralisk');
            } else if (zergResources.minerals >= 75 && zergResources.vespeneGas >= 25) {
              // Roaches as backbone
              queueUnit('zerg', 'roach');
            } else if (zergResources.minerals >= 25) {
              // Zerglings as filler
              queueUnit('zerg', 'zergling');
            }
          }
          
          // Emergency response - if losing badly, spam cheap units
          if (combatUnits < terranThreat * 0.5 && zergResources.minerals >= 25) {
            queueUnit('zerg', 'zergling');
            if (zergResources.minerals >= 50) {
              queueUnit('zerg', 'zergling');
            }
          }
        }
        
        // COMBAT SYSTEM - Every 2 seconds
        if (gameTime % 2 === 0) {
          const terranArmy = terranUnits.filter(u => u.type !== 'scv');
          const zergArmy = zergUnits.filter(u => u.type !== 'drone');
          
          if (terranArmy.length > 0 && zergArmy.length > 0) {
            // Calculate total damage with armor reduction
            const terranDamage = terranArmy.reduce((sum, unit) => sum + unit.damage, 0);
            const zergDamage = zergArmy.reduce((sum, unit) => sum + unit.damage, 0);
            
            // Apply damage to units
            let terranKills = 0;
            let zergKills = 0;
            
            // Damage Zerg units - distribute damage more realistically
            setZergUnits(prev => prev.map(unit => {
              if (unit.type === 'drone') return unit; // Don't damage workers
              
              // Each unit takes proportional damage
              const damagePerUnit = terranDamage / zergArmy.length;
              const actualDamage = Math.max(1, damagePerUnit - unit.armor);
              
              const updatedUnit = { ...unit };
              updatedUnit.health = Math.max(0, unit.health - actualDamage);
              
              if (updatedUnit.health <= 0) {
                terranKills++;
                setZergCasualties(prev => prev + 1);
              }
              
              return updatedUnit;
            }).filter(unit => unit.health > 0));
            
            // Damage Terran units - distribute damage more realistically
            setTerranUnits(prev => prev.map(unit => {
              if (unit.type === 'scv') return unit; // Don't damage workers
              
              // Each unit takes proportional damage
              const damagePerUnit = zergDamage / terranArmy.length;
              const actualDamage = Math.max(1, damagePerUnit - unit.armor);
              
              const updatedUnit = { ...unit };
              updatedUnit.health = Math.max(0, unit.health - actualDamage);
              
              if (updatedUnit.health <= 0) {
                zergKills++;
                setTerranCasualties(prev => prev + 1);
              }
              
              return updatedUnit;
            }).filter(unit => unit.health > 0));
            
            // Update battle log
            if (terranKills > 0 || zergKills > 0) {
              addMessage(`⚔️ Battle! Terran killed ${terranKills} units, Zerg killed ${zergKills} units`);
              setBattleLog(prev => [...prev.slice(-4), `T: -${zergKills} | Z: -${terranKills}`]);
            }
          }
          
          // Check victory conditions
          const terranArmySize = terranUnits.filter(u => u.type !== 'scv').length;
          const zergArmySize = zergUnits.filter(u => u.type !== 'drone').length;
          const terranWorkers = terranUnits.filter(u => u.type === 'scv').length;
          const zergWorkers = zergUnits.filter(u => u.type === 'drone').length;
          
          // Victory if enemy has no army and no workers, or just 1 worker left
          if (terranArmySize === 0 && terranWorkers <= 1 && !gameWinner) {
            setGameWinner('ZERG');
            addMessage('🎉 ZERG VICTORY! The swarm has consumed Mars!');
            setIsPaused(true);
          } else if (zergArmySize === 0 && zergWorkers <= 1 && !gameWinner) {
            setGameWinner('TERRAN');
            addMessage('🎉 TERRAN VICTORY! Humanity prevails on Mars!');
            setIsPaused(true);
          }
        }
        
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isPaused, isOpen, gameSpeed, terranUnits, zergUnits, zergResources, gameTime, gameWinner]);
  
  // Create a new unit
  const createUnit = (faction: 'terran' | 'zerg', unitType: Unit['type']) => {
    const stats = UNIT_STATS[unitType];
    unitIdCounter.current++; // Increment counter for unique ID
    const newUnit: Unit = {
      id: `${unitType}-${unitIdCounter.current}-${Math.random().toString(36).substr(2, 9)}`,
      type: unitType,
      health: stats.health,
      maxHealth: stats.health,
      damage: stats.damage,
      armor: stats.armor,
      speed: stats.speed,
      cost: stats.cost,
      buildTime: stats.buildTime
    };
    
    if (faction === 'terran') {
      setTerranUnits(prev => [...prev, newUnit]);
      addMessage(`Terran ${unitType} ready!`);
    } else {
      setZergUnits(prev => [...prev, newUnit]);
      addMessage(`Zerg ${unitType} spawned!`);
    }
  };
  
  // Queue unit production
  const queueUnit = (faction: 'terran' | 'zerg', unitType: Unit['type']) => {
    const stats = UNIT_STATS[unitType];
    const resources = faction === 'terran' ? terranResources : zergResources;
    
    // Check resources
    if (resources.minerals < stats.cost.minerals || resources.vespeneGas < stats.cost.gas) {
      addMessage('Not enough resources!');
      return;
    }
    
    // Check supply
    if (resources.supply + stats.cost.supply > resources.maxSupply) {
      addMessage('Need more supply!');
      return;
    }
    
    // Deduct resources
    if (faction === 'terran') {
      setTerranResources(prev => ({
        ...prev,
        minerals: prev.minerals - stats.cost.minerals,
        vespeneGas: prev.vespeneGas - stats.cost.gas,
        supply: prev.supply + stats.cost.supply
      }));
      setTerranQueue(prev => [...prev, { unit: unitType, progress: 0 }]);
    } else {
      setZergResources(prev => ({
        ...prev,
        minerals: prev.minerals - stats.cost.minerals,
        vespeneGas: prev.vespeneGas - stats.cost.gas,
        supply: prev.supply + stats.cost.supply
      }));
      setZergQueue(prev => [...prev, { unit: unitType, progress: 0 }]);
    }
    
    addMessage(`Training ${unitType}...`);
  };
  
  // Add message to game log
  const addMessage = (msg: string) => {
    setMessages(prev => [...prev.slice(-4), msg]);
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-gray-900 rounded-2xl w-full max-w-7xl h-[90vh] overflow-hidden border border-cyan-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 bg-black/80 border-b border-cyan-500/30 p-2 flex justify-between items-center z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-cyan-400">MARS RTS - StarCraft Style</h2>
              <div className="text-sm text-gray-400">
                Time: <span className="text-white font-mono">{formatTime(gameTime)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setGameSpeed(gameSpeed === 1 ? 2 : gameSpeed === 2 ? 4 : 1)}
                className="px-3 py-1 bg-cyan-600/20 border border-cyan-500/50 rounded text-cyan-400 hover:bg-cyan-600/30"
              >
                Speed: {gameSpeed}x
              </button>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-3 py-1 bg-cyan-600/20 border border-cyan-500/50 rounded text-cyan-400 hover:bg-cyan-600/30"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-red-600/20 border border-red-500/50 rounded text-red-400 hover:bg-red-600/30"
              >
                Exit
              </button>
            </div>
          </div>
          
          {/* Main Game Area */}
          <div className="h-full pt-12 pb-32 flex">
            {/* Left Panel - Terran */}
            <div className="w-1/3 border-r border-cyan-500/30 p-4">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-blue-400 mb-2">TERRAN DOMINION</h3>
                
                {/* Resources */}
                <div className="bg-black/50 rounded p-2 mb-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">💎 Minerals:</span>
                    <span className="text-white font-mono">{Math.floor(terranResources.minerals)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">⛽ Vespene:</span>
                    <span className="text-white font-mono">{Math.floor(terranResources.vespeneGas)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-400">🏠 Supply:</span>
                    <span className="text-white font-mono">{terranResources.supply}/{terranResources.maxSupply}</span>
                  </div>
                </div>
                
                {/* Buildings */}
                <div className="bg-black/50 rounded p-2 mb-2">
                  <p className="text-xs text-gray-400 mb-1">Buildings</p>
                  <button
                    onClick={() => {
                      if (terranResources.minerals >= 100) {
                        setTerranResources(prev => ({
                          ...prev,
                          minerals: prev.minerals - 100,
                          maxSupply: prev.maxSupply + 8
                        }));
                        addMessage('Supply Depot built! +8 supply');
                      } else {
                        addMessage('Not enough minerals!');
                      }
                    }}
                    className="w-full px-2 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-xs text-blue-400 hover:bg-blue-600/30"
                  >
                    Supply Depot (100m) +8 Supply
                  </button>
                </div>
                
                {/* Unit Production */}
                <div className="bg-black/50 rounded p-2 mb-2">
                  <p className="text-xs text-gray-400 mb-1">Unit Production</p>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => queueUnit('terran', 'scv')}
                      className="px-2 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-xs text-blue-400 hover:bg-blue-600/30"
                    >
                      SCV (50m)
                    </button>
                    <button
                      onClick={() => queueUnit('terran', 'marine')}
                      className="px-2 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-xs text-blue-400 hover:bg-blue-600/30"
                    >
                      Marine (50m)
                    </button>
                    <button
                      onClick={() => queueUnit('terran', 'marauder')}
                      className="px-2 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-xs text-blue-400 hover:bg-blue-600/30"
                    >
                      Marauder (100m/25g)
                    </button>
                    <button
                      onClick={() => queueUnit('terran', 'tank')}
                      className="px-2 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-xs text-blue-400 hover:bg-blue-600/30"
                    >
                      Tank (150m/125g)
                    </button>
                  </div>
                </div>
                
                {/* Production Queue */}
                {terranQueue.length > 0 && (
                  <div className="bg-black/50 rounded p-2 mb-2">
                    <p className="text-xs text-gray-400 mb-1">Production Queue</p>
                    {terranQueue.map((item, i) => (
                      <div key={i} className="mb-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-400">{item.unit}</span>
                          <span className="text-white">{Math.floor(item.progress)}%</span>
                        </div>
                        <div className="h-1 bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Army */}
                <div className="bg-black/50 rounded p-2">
                  <p className="text-xs text-gray-400 mb-1">Army ({terranUnits.length} units)</p>
                  <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                    {Object.entries(
                      terranUnits.reduce((acc, unit) => {
                        acc[unit.type] = (acc[unit.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="text-blue-300">{type}:</span>
                        <span className="text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Center - Battlefield */}
            <div className="flex-1 relative bg-gradient-to-b from-red-900/20 to-orange-900/20">
              <div 
                className="absolute inset-0 opacity-50" 
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
                }}
              />
              
              {/* Battle visualization */}
              <div className="h-full flex flex-col items-center justify-center p-4 relative">
                {/* Victory Screen */}
                {gameWinner && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`text-6xl font-bold mb-4 ${
                        gameWinner === 'TERRAN' ? 'text-blue-400' : 'text-purple-400'
                      }`}
                    >
                      {gameWinner} VICTORY!
                    </motion.div>
                    <div className="text-2xl text-gray-300 mb-4">
                      {gameWinner === 'TERRAN' ? '🚀 Humanity Prevails!' : '🪳 The Swarm Consumes All!'}
                    </div>
                    <div className="grid grid-cols-2 gap-8 text-center">
                      <div>
                        <p className="text-blue-400 text-sm">Terran Casualties</p>
                        <p className="text-3xl font-bold text-white">{terranCasualties}</p>
                      </div>
                      <div>
                        <p className="text-purple-400 text-sm">Zerg Casualties</p>
                        <p className="text-3xl font-bold text-white">{zergCasualties}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-8 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold rounded-lg hover:from-cyan-700 hover:to-purple-700"
                    >
                      Play Again
                    </button>
                  </motion.div>
                )}
                
                <h3 className="text-2xl font-bold text-orange-400 mb-4">MARS BATTLEFIELD</h3>
                
                {/* Army Units Display */}
                <div className="flex justify-between w-full mb-4">
                  {/* Terran Army */}
                  <div className="w-1/2 pr-4">
                    <p className="text-blue-400 font-bold text-center mb-2">TERRAN FORCES</p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {terranUnits.slice(0, 20).map((unit, i) => (
                        <motion.div
                          key={unit.id}
                          initial={{ scale: 0 }}
                          animate={{ 
                            scale: unit.health < unit.maxHealth * 0.3 ? [1, 1.1, 1] : 1,
                          }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            scale: { duration: 0.5, repeat: unit.health < unit.maxHealth * 0.3 ? Infinity : 0 }
                          }}
                          className="relative group"
                        >
                          <motion.span 
                            className="text-2xl block"
                            animate={unit.health < unit.maxHealth ? { 
                              filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] 
                            } : {}}
                            transition={{ duration: 0.2 }}
                          >
                            {unit.type === 'scv' && '👷'}
                            {unit.type === 'marine' && '🔫'}
                            {unit.type === 'marauder' && '💪'}
                            {unit.type === 'tank' && '🚗'}
                            {unit.type === 'battlecruiser' && '🚁'}
                          </motion.span>
                          {/* Health bar */}
                          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                              className={`h-full rounded-full ${
                                unit.health > unit.maxHealth * 0.6 ? 'bg-green-500' :
                                unit.health > unit.maxHealth * 0.3 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              initial={{ width: '100%' }}
                              animate={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          {/* Damage indicator */}
                          {unit.health < unit.maxHealth && (
                            <motion.div
                              initial={{ opacity: 1, y: -10 }}
                              animate={{ opacity: 0, y: -20 }}
                              transition={{ duration: 1 }}
                              className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-red-500 text-xs font-bold pointer-events-none"
                            >
                              -{Math.floor(unit.maxHealth - unit.health)}
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                      {terranUnits.length > 20 && (
                        <span className="text-gray-400 text-sm">+{terranUnits.length - 20} more</span>
                      )}
                    </div>
                  </div>
                  
                  {/* VS */}
                  <div className="flex items-center">
                    <motion.div 
                      className="text-4xl text-yellow-400"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ⚔️
                    </motion.div>
                  </div>
                  
                  {/* Zerg Army */}
                  <div className="w-1/2 pl-4">
                    <p className="text-purple-400 font-bold text-center mb-2">ZERG SWARM</p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {zergUnits.slice(0, 20).map((unit, i) => (
                        <motion.div
                          key={unit.id}
                          initial={{ scale: 0 }}
                          animate={{ 
                            scale: unit.health < unit.maxHealth * 0.3 ? [1, 1.1, 1] : 1,
                          }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            scale: { duration: 0.5, repeat: unit.health < unit.maxHealth * 0.3 ? Infinity : 0 }
                          }}
                          className="relative group"
                        >
                          <motion.span 
                            className="text-2xl block"
                            animate={unit.health < unit.maxHealth ? { 
                              filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] 
                            } : {}}
                            transition={{ duration: 0.2 }}
                          >
                            {unit.type === 'drone' && '🐛'}
                            {unit.type === 'zergling' && '🦗'}
                            {unit.type === 'roach' && '🪳'}
                            {unit.type === 'hydralisk' && '🦂'}
                            {unit.type === 'ultralisk' && '🦏'}
                          </motion.span>
                          {/* Health bar */}
                          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                              className={`h-full rounded-full ${
                                unit.health > unit.maxHealth * 0.6 ? 'bg-green-500' :
                                unit.health > unit.maxHealth * 0.3 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              initial={{ width: '100%' }}
                              animate={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          {/* Damage indicator */}
                          {unit.health < unit.maxHealth && (
                            <motion.div
                              initial={{ opacity: 1, y: -10 }}
                              animate={{ opacity: 0, y: -20 }}
                              transition={{ duration: 1 }}
                              className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-purple-500 text-xs font-bold pointer-events-none"
                            >
                              -{Math.floor(unit.maxHealth - unit.health)}
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                      {zergUnits.length > 20 && (
                        <span className="text-gray-400 text-sm">+{zergUnits.length - 20} more</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Battle Stats */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                  <div className="bg-blue-900/30 rounded-lg p-2 text-center">
                    <p className="text-xs text-blue-400">Terran Army</p>
                    <p className="text-xl font-bold text-white">{terranUnits.filter(u => u.type !== 'scv').length}</p>
                    <p className="text-xs text-red-400">Casualties: {terranCasualties}</p>
                  </div>
                  
                  <div className="bg-black/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">Battle Status</p>
                    <p className="text-sm font-bold text-yellow-400">
                      {terranUnits.filter(u => u.type !== 'scv').length === 0 && zergUnits.filter(u => u.type !== 'drone').length === 0 && 'Preparing...'}
                      {terranUnits.filter(u => u.type !== 'scv').length > zergUnits.filter(u => u.type !== 'drone').length * 1.5 && '🔵 Terran Lead!'}
                      {zergUnits.filter(u => u.type !== 'drone').length > terranUnits.filter(u => u.type !== 'scv').length * 1.5 && '🟣 Zerg Swarm!'}
                      {terranUnits.filter(u => u.type !== 'scv').length > 0 && zergUnits.filter(u => u.type !== 'drone').length > 0 && Math.abs(terranUnits.filter(u => u.type !== 'scv').length - zergUnits.filter(u => u.type !== 'drone').length) < 3 && '⚔️ Fierce Battle!'}
                    </p>
                  </div>
                  
                  <div className="bg-purple-900/30 rounded-lg p-2 text-center">
                    <p className="text-xs text-purple-400">Zerg Army</p>
                    <p className="text-xl font-bold text-white">{zergUnits.filter(u => u.type !== 'drone').length}</p>
                    <p className="text-xs text-red-400">Casualties: {zergCasualties}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Panel - Zerg */}
            <div className="w-1/3 border-l border-purple-500/30 p-4">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-purple-400 mb-2">ZERG SWARM</h3>
                
                {/* Resources */}
                <div className="bg-black/50 rounded p-2 mb-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">💎 Minerals:</span>
                    <span className="text-white font-mono">{Math.floor(zergResources.minerals)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">⛽ Vespene:</span>
                    <span className="text-white font-mono">{Math.floor(zergResources.vespeneGas)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-400">🏠 Supply:</span>
                    <span className="text-white font-mono">{zergResources.supply}/{zergResources.maxSupply}</span>
                  </div>
                </div>
                
                {/* Buildings */}
                <div className="bg-black/50 rounded p-2 mb-2">
                  <p className="text-xs text-gray-400 mb-1">Buildings</p>
                  <button
                    onClick={() => {
                      if (zergResources.minerals >= 100) {
                        setZergResources(prev => ({
                          ...prev,
                          minerals: prev.minerals - 100,
                          maxSupply: prev.maxSupply + 8
                        }));
                        addMessage('Overlord spawned! +8 supply');
                      } else {
                        addMessage('Not enough minerals!');
                      }
                    }}
                    className="w-full px-2 py-1 bg-purple-600/20 border border-purple-500/50 rounded text-xs text-purple-400 hover:bg-purple-600/30"
                  >
                    Overlord (100m) +8 Supply
                  </button>
                </div>
                
                {/* Unit Production */}
                <div className="bg-black/50 rounded p-2 mb-2">
                  <p className="text-xs text-gray-400 mb-1">Unit Production</p>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => queueUnit('zerg', 'drone')}
                      className="px-2 py-1 bg-purple-600/20 border border-purple-500/50 rounded text-xs text-purple-400 hover:bg-purple-600/30"
                    >
                      Drone (50m)
                    </button>
                    <button
                      onClick={() => queueUnit('zerg', 'zergling')}
                      className="px-2 py-1 bg-purple-600/20 border border-purple-500/50 rounded text-xs text-purple-400 hover:bg-purple-600/30"
                    >
                      Zergling (25m)
                    </button>
                    <button
                      onClick={() => queueUnit('zerg', 'roach')}
                      className="px-2 py-1 bg-purple-600/20 border border-purple-500/50 rounded text-xs text-purple-400 hover:bg-purple-600/30"
                    >
                      Roach (75m/25g)
                    </button>
                    <button
                      onClick={() => queueUnit('zerg', 'hydralisk')}
                      className="px-2 py-1 bg-purple-600/20 border border-purple-500/50 rounded text-xs text-purple-400 hover:bg-purple-600/30"
                    >
                      Hydra (100m/50g)
                    </button>
                  </div>
                </div>
                
                {/* Production Queue */}
                {zergQueue.length > 0 && (
                  <div className="bg-black/50 rounded p-2 mb-2">
                    <p className="text-xs text-gray-400 mb-1">Production Queue</p>
                    {zergQueue.map((item, i) => (
                      <div key={i} className="mb-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-400">{item.unit}</span>
                          <span className="text-white">{Math.floor(item.progress)}%</span>
                        </div>
                        <div className="h-1 bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Army */}
                <div className="bg-black/50 rounded p-2">
                  <p className="text-xs text-gray-400 mb-1">Army ({zergUnits.length} units)</p>
                  <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                    {Object.entries(
                      zergUnits.reduce((acc, unit) => {
                        acc[unit.type] = (acc[unit.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="text-purple-300">{type}:</span>
                        <span className="text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Panel - Messages */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-cyan-500/30 p-2">
            <div className="text-xs space-y-1">
              {messages.slice(-5).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-cyan-400"
                >
                  [{formatTime(gameTime)}] {msg}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}