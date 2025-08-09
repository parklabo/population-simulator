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
// Building interface - currently unused but may be needed for future features
// interface Building {
//   id: string;
//   type: 'command_center' | 'supply_depot' | 'barracks' | 'factory' | 'starport' | 'hatchery' | 'spawning_pool' | 'roach_warren';
//   health: number;
//   maxHealth: number;
//   constructionProgress: number;
//   isComplete: boolean;
// }

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
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard' | 'insane'>('normal');
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
  // const [battleLog, setBattleLog] = useState<string[]>([]);
  const [terranCasualties, setTerranCasualties] = useState(0);
  const [zergCasualties, setZergCasualties] = useState(0);
  const [gameWinner, setGameWinner] = useState<string | null>(null);

  // Difficulty multipliers
  const getDifficultyMultipliers = () => {
    switch(difficulty) {
      case 'easy':
        return { zergMinerals: 0.5, zergGas: 0.5, zergBuildSpeed: 0.8, zergDamage: 0.8 };
      case 'normal':
        return { zergMinerals: 0.8, zergGas: 0.8, zergBuildSpeed: 1.0, zergDamage: 1.0 };
      case 'hard':
        return { zergMinerals: 1.2, zergGas: 1.2, zergBuildSpeed: 1.3, zergDamage: 1.2 };
      case 'insane':
        return { zergMinerals: 2.0, zergGas: 2.0, zergBuildSpeed: 1.5, zergDamage: 1.5 };
      default:
        return { zergMinerals: 0.8, zergGas: 0.8, zergBuildSpeed: 1.0, zergDamage: 1.0 };
    }
  };

  // Game loop
  useEffect(() => {
    if (!isPaused && isOpen && gameStarted) {
      const interval = setInterval(() => {
        setGameTime(prev => prev + 1);
        
        const difficultyMods = getDifficultyMultipliers();
        
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
          minerals: Math.min(9999, prev.minerals + zergWorkers * 0.8 * gameSpeed * difficultyMods.zergMinerals),
          vespeneGas: Math.min(9999, prev.vespeneGas + Math.floor(zergWorkers * 0.4 * difficultyMods.zergGas) * gameSpeed)
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
          progress: Math.min(100, item.progress + (100 / UNIT_STATS[item.unit as keyof typeof UNIT_STATS].buildTime) * gameSpeed * difficultyMods.zergBuildSpeed)
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
          // const zerglings = zergUnits.filter(u => u.type === 'zergling').length;
          const roaches = zergUnits.filter(u => u.type === 'roach').length;
          const hydralisks = zergUnits.filter(u => u.type === 'hydralisk').length;
          const ultralisks = zergUnits.filter(u => u.type === 'ultralisk').length;
          const combatUnits = zergUnits.filter(u => u.type !== 'drone').length;
          const terranThreat = terranUnits.filter(u => u.type !== 'scv').length;
          
          // Zerg AI Strategy Phases
          const gamePhase = gameTime < 30 ? 'early' : gameTime < 90 ? 'mid' : 'late';
          
          // SUPPLY CHECK - Build Overlords proactively based on difficulty
          const supplyBuffer = difficulty === 'insane' ? 20 : difficulty === 'hard' ? 12 : 6;
          const needSupply = zergResources.supply >= zergResources.maxSupply - supplyBuffer;
          
          // In insane mode, build multiple overlords at once
          if (needSupply && zergResources.minerals >= 100) {
            const overlordCount = difficulty === 'insane' ? Math.min(4, Math.floor(zergResources.minerals / 100)) : 
                                 difficulty === 'hard' ? Math.min(2, Math.floor(zergResources.minerals / 100)) : 1;
            
            let overlordsMade = 0;
            let currentMinerals = zergResources.minerals;
            for (let i = 0; i < overlordCount && i < 4; i++) { // Max 4 overlords at once
              if (currentMinerals >= 100) {
                overlordsMade++;
                currentMinerals -= 100;
              }
            }
            
            if (overlordsMade > 0) {
              setZergResources(prev => ({
                ...prev,
                minerals: Math.max(0, prev.minerals - (100 * overlordsMade)),
                maxSupply: prev.maxSupply + (8 * overlordsMade)
              }));
              addMessage(`🎈 Zerg spawned ${overlordsMade} Overlord${overlordsMade > 1 ? 's' : ''}! +${8 * overlordsMade} supply`);
            }
          }
          
          // In insane/hard mode, queue multiple units in parallel
          const maxQueueSize = difficulty === 'insane' ? 6 : difficulty === 'hard' ? 4 : 2;
          
          // Early game: Focus on economy and basic units
          if (gamePhase === 'early') {
            if (drones < 12 && zergResources.minerals >= 50 && zergQueue.length < maxQueueSize) {
              queueUnit('zerg', 'drone');
            } 
            // Parallel zergling production in higher difficulties
            let zerglingCount = 0;
            while (zergResources.minerals >= 25 && zergQueue.length < maxQueueSize && 
                   zergResources.supply + (0.5 * (zergQueue.length + 1)) <= zergResources.maxSupply &&
                   zerglingCount < 3) {
              queueUnit('zerg', 'zergling');
              zerglingCount++;
            }
          }
          // Mid game: Transition to roaches and hydralisks with parallel production
          else if (gamePhase === 'mid') {
            if (drones < 16 && zergResources.minerals >= 50 && Math.random() > 0.6 && zergQueue.length < maxQueueSize) {
              queueUnit('zerg', 'drone');
            }
            
            // Queue multiple units in parallel for insane difficulty
            let queued = 0;
            const maxQueueAttempts = 5; // Prevent infinite loop
            while (zergQueue.length + queued < maxQueueSize && 
                   zergResources.supply < zergResources.maxSupply - 2 && 
                   queued < maxQueueAttempts) {
              if (zergResources.minerals >= 75 && zergResources.vespeneGas >= 25 && roaches < 12) {
                queueUnit('zerg', 'roach');
                queued++;
              } else if (zergResources.minerals >= 100 && zergResources.vespeneGas >= 50 && hydralisks < 8) {
                queueUnit('zerg', 'hydralisk');
                queued++;
              } else if (zergResources.minerals >= 25) {
                queueUnit('zerg', 'zergling');
                queued++;
              } else {
                break;
              }
            }
          }
          // Late game: Tech to ultralisks with massive parallel production
          else {
            let queued = 0;
            const maxQueueAttempts = 6; // Prevent infinite loop
            while (zergQueue.length + queued < maxQueueSize && 
                   zergResources.supply < zergResources.maxSupply - 4 &&
                   queued < maxQueueAttempts) {
              if (zergResources.minerals >= 300 && zergResources.vespeneGas >= 200 && ultralisks < 6) {
                queueUnit('zerg', 'ultralisk');
                queued++;
              } else if (zergResources.minerals >= 100 && zergResources.vespeneGas >= 50) {
                queueUnit('zerg', 'hydralisk');
                queued++;
              } else if (zergResources.minerals >= 75 && zergResources.vespeneGas >= 25) {
                queueUnit('zerg', 'roach');
                queued++;
              } else if (zergResources.minerals >= 25) {
                queueUnit('zerg', 'zergling');
                queued++;
              } else {
                break;
              }
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
            const zergDamage = zergArmy.reduce((sum, unit) => sum + unit.damage * difficultyMods.zergDamage, 0);
            
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
              // setBattleLog(prev => [...prev.slice(-4), `T: -${zergKills} | Z: -${terranKills}`]);
            }
          }
          
          // Check victory conditions - more comprehensive with minimum time requirement
          const terranArmySize = terranUnits.filter(u => u.type !== 'scv').length;
          const zergArmySize = zergUnits.filter(u => u.type !== 'drone').length;
          const terranWorkers = terranUnits.filter(u => u.type === 'scv').length;
          const zergWorkers = zergUnits.filter(u => u.type === 'drone').length;
          const terranProduction = terranQueue.length > 0;
          const zergProduction = zergQueue.length > 0;
          
          // Minimum game time requirement: 3 minutes (180 seconds)
          const MIN_GAME_TIME = 180;
          const canDeclareVictory = gameTime >= MIN_GAME_TIME;
          
          // Victory conditions:
          // 1. Must play for at least 3 minutes
          // 2. Enemy has no army and cannot produce (no workers or resources)
          // 3. Enemy has been reduced to 0 units
          // 4. Overwhelming force advantage (10:1 ratio or 100+ unit difference)
          if (!gameWinner && canDeclareVictory) {
            // Total annihilation victory
            if ((terranArmySize === 0 && terranWorkers === 0) || 
                (terranArmySize === 0 && terranWorkers <= 2 && terranResources.minerals < 50 && !terranProduction)) {
              setGameWinner('ZERG');
              addMessage('🎉 ZERG VICTORY! The swarm has consumed the Moon!');
              setIsPaused(true);
            } else if ((zergArmySize === 0 && zergWorkers === 0) || 
                      (zergArmySize === 0 && zergWorkers <= 2 && zergResources.minerals < 50 && !zergProduction)) {
              setGameWinner('TERRAN');
              addMessage('🎉 TERRAN VICTORY! Humanity prevails on the Moon!');
              setIsPaused(true);
            } 
            // Overwhelming force victory - reduced requirements
            else if (terranArmySize > 50 && zergArmySize < 5) {
              setGameWinner('TERRAN');
              addMessage('🎉 TERRAN VICTORY! Overwhelming force achieved!');
              setIsPaused(true);
            } else if (zergArmySize > 50 && terranArmySize < 5) {
              setGameWinner('ZERG');
              addMessage('🎉 ZERG VICTORY! The swarm is unstoppable!');
              setIsPaused(true);
            }
            // Massive army difference victory
            else if (terranArmySize > zergArmySize + 100) {
              setGameWinner('TERRAN');
              addMessage('🎉 TERRAN VICTORY! Decisive military superiority!');
              setIsPaused(true);
            } else if (zergArmySize > terranArmySize + 100) {
              setGameWinner('ZERG');
              addMessage('🎉 ZERG VICTORY! The swarm overwhelms!');
              setIsPaused(true);
            }
            // 10:1 ratio with minimum army size
            else if (terranArmySize >= 20 && terranArmySize > zergArmySize * 10) {
              setGameWinner('TERRAN');
              addMessage('🎉 TERRAN VICTORY! Enemy forces decimated!');
              setIsPaused(true);
            } else if (zergArmySize >= 20 && zergArmySize > terranArmySize * 10) {
              setGameWinner('ZERG');
              addMessage('🎉 ZERG VICTORY! Terran forces crushed!');
              setIsPaused(true);
            }
          } else if (!gameWinner && !canDeclareVictory) {
            // Check if victory conditions are met but time hasn't passed
            const wouldWinTerran = (zergArmySize === 0 && zergWorkers === 0) || 
                                  (zergArmySize === 0 && zergWorkers <= 2 && zergResources.minerals < 50 && !zergProduction) ||
                                  (terranArmySize > zergArmySize * 10 && zergWorkers < 3);
            const wouldWinZerg = (terranArmySize === 0 && terranWorkers === 0) || 
                                (terranArmySize === 0 && terranWorkers <= 2 && terranResources.minerals < 50 && !terranProduction) ||
                                (zergArmySize > terranArmySize * 10 && terranWorkers < 3);
            
            if (wouldWinTerran || wouldWinZerg) {
              const timeRemaining = MIN_GAME_TIME - gameTime;
              if (gameTime % 10 === 0) { // Show message every 10 seconds
                addMessage(`⏰ Victory conditions met! ${timeRemaining} seconds until victory can be declared (Min 3 minutes required)`);
              }
            }
          }
        }
        
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isPaused, isOpen, gameSpeed, terranUnits, zergUnits, zergResources, gameTime, gameWinner, gameStarted, difficulty]);
  
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
  
  // Reset game when difficulty changes or game starts
  const startGame = () => {
    setGameTime(0);
    setTerranCasualties(0);
    setZergCasualties(0);
    setGameWinner(null);
    setIsPaused(false);
    setGameStarted(true);
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
        {!gameStarted ? (
          // Enhanced Start Screen with Story
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative bg-gradient-to-b from-gray-900 via-blue-950/20 to-gray-900 rounded-3xl max-w-3xl border border-cyan-500/20 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(6,182,212,0.1) 35px, rgba(6,182,212,0.1) 70px)`,
              }} />
            </div>
            
            {/* Glowing orbs */}
            <motion.div 
              className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            <motion.div 
              className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            
            <div className="relative p-8">
              {/* Title Section - Compact */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-center gap-4"
                >
                  <motion.div 
                    className="text-5xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  >
                    🌙
                  </motion.div>
                  <div>
                    <h1 className="text-5xl font-black mb-1">
                      <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                        LUNAR DEFENSE
                      </span>
                    </h1>
                    <div className="text-lg text-cyan-400 font-semibold">
                      OPERATION: LAST STAND
                    </div>
                  </div>
                </motion.div>
                
                {/* Creator Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center mt-3 mb-3"
                >
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 border border-purple-500/20">
                    <div className="relative">
                      <span className="text-lg">🐱</span>
                      <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-[6px] font-bold text-white px-0.5 rounded">AI</span>
                    </div>
                    <span className="text-xs text-gray-400">by</span>
                    <span className="text-xs font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">YonYonWare</span>
                  </div>
                </motion.div>
                
                {/* Story/Mission Briefing - Compact */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-black/40 backdrop-blur-sm rounded-xl p-4 mb-6 border border-cyan-500/20"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-xl">⚠️</span>
                    <div className="text-left flex-1">
                      <h3 className="text-base font-bold text-red-400 mb-1">HUMANITY IN CRISIS</h3>
                      <p className="text-gray-300 text-xs leading-relaxed mb-2">
                        Earth&apos;s population crisis has reached critical levels. An alien swarm approaches our lunar colony.
                      </p>
                      <p className="text-cyan-300 text-xs font-semibold">
                        📡 MISSION: Defend the Moon base - humanity&apos;s last hope for survival!
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center py-2 bg-black/30 rounded">
                      <div className="text-xl mb-1">🌍</div>
                      <div className="text-xs text-gray-400">Earth</div>
                      <div className="text-red-400 font-bold text-xs">DECLINING</div>
                    </div>
                    <div className="text-center py-2 bg-black/30 rounded">
                      <div className="text-xl mb-1">👽</div>
                      <div className="text-xs text-gray-400">Threat</div>
                      <div className="text-purple-400 font-bold text-xs">IMMINENT</div>
                    </div>
                    <div className="text-center py-2 bg-black/30 rounded">
                      <div className="text-xl mb-1">🚀</div>
                      <div className="text-xs text-gray-400">Colony</div>
                      <div className="text-cyan-400 font-bold text-xs">LAST HOPE</div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Difficulty Selection - Compact */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-xl font-bold text-cyan-400 mb-3 text-center">
                    SELECT THREAT LEVEL
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDifficulty('easy')}
                      className={`relative p-3 rounded-xl border-2 transition-all overflow-hidden ${
                        difficulty === 'easy' 
                          ? 'border-green-400 bg-gradient-to-br from-green-900/40 to-green-950/40' 
                          : 'border-gray-700 bg-gray-900/50 hover:border-green-500/50'
                      }`}
                    >
                      {difficulty === 'easy' && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      )}
                      <div className="relative">
                        <div className="text-2xl mb-1">🛡️</div>
                        <div className="font-bold text-base text-green-400">ROOKIE</div>
                        <div className="text-xs text-gray-400">Scout force</div>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(59,130,246,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDifficulty('normal')}
                      className={`relative p-3 rounded-xl border-2 transition-all overflow-hidden ${
                        difficulty === 'normal' 
                          ? 'border-blue-400 bg-gradient-to-br from-blue-900/40 to-blue-950/40' 
                          : 'border-gray-700 bg-gray-900/50 hover:border-blue-500/50'
                      }`}
                    >
                      {difficulty === 'normal' && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      )}
                      <div className="relative">
                        <div className="text-2xl mb-1">⚔️</div>
                        <div className="font-bold text-base text-blue-400">SOLDIER</div>
                        <div className="text-xs text-gray-400">Standard invasion</div>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(251,146,60,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDifficulty('hard')}
                      className={`relative p-3 rounded-xl border-2 transition-all overflow-hidden ${
                        difficulty === 'hard' 
                          ? 'border-orange-400 bg-gradient-to-br from-orange-900/40 to-orange-950/40' 
                          : 'border-gray-700 bg-gray-900/50 hover:border-orange-500/50'
                      }`}
                    >
                      {difficulty === 'hard' && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      )}
                      <div className="relative">
                        <div className="text-2xl mb-1">🔥</div>
                        <div className="font-bold text-base text-orange-400">VETERAN</div>
                        <div className="text-xs text-gray-400">Heavy assault</div>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(239,68,68,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDifficulty('insane')}
                      className={`relative p-3 rounded-xl border-2 transition-all overflow-hidden ${
                        difficulty === 'insane' 
                          ? 'border-red-400 bg-gradient-to-br from-red-900/40 to-red-950/40' 
                          : 'border-gray-700 bg-gray-900/50 hover:border-red-500/50'
                      }`}
                    >
                      {difficulty === 'insane' && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      )}
                      <div className="relative">
                        <div className="text-2xl mb-1">💀</div>
                        <div className="font-bold text-base text-red-400">COMMANDER</div>
                        <div className="text-xs text-gray-400">Apocalyptic swarm</div>
                      </div>
                    </motion.button>
                  </div>
                  
                  {/* Difficulty Details - Compact */}
                  <div className="bg-gradient-to-r from-cyan-950/30 to-purple-950/30 rounded-xl p-3 mb-4 border border-cyan-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-cyan-300">THREAT ASSESSMENT</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        difficulty === 'normal' ? 'bg-blue-500/20 text-blue-400' :
                        difficulty === 'hard' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {difficulty.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      {difficulty === 'easy' && (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-green-400">▸</span>
                            Alien forces gather resources 50% slower
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">▸</span>
                            Enemy production reduced by 20%
                          </div>
                        </>
                      )}
                      {difficulty === 'normal' && (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-400">▸</span>
                            Standard alien invasion force
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400">▸</span>
                            Balanced resource gathering and production
                          </div>
                        </>
                      )}
                      {difficulty === 'hard' && (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-orange-400">▸</span>
                            Alien forces gather 120% resources
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-orange-400">▸</span>
                            Enemy production increased by 30%
                          </div>
                        </>
                      )}
                      {difficulty === 'insane' && (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-red-400">▸</span>
                            Alien swarm gathers 200% resources!
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-red-400">▸</span>
                            Overwhelming production speed (+50%)
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={startGame}
                      className="relative px-10 py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white text-lg font-black rounded-xl shadow-xl transition-all overflow-hidden group"
                    >
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                      <span className="relative flex items-center gap-2">
                        <span className="text-xl">🚀</span>
                        DEPLOY FORCES
                        <span className="text-xl">⚔️</span>
                      </span>
                    </motion.button>
                    
                    <button
                      onClick={onClose}
                      className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
                    >
                      Abort Mission
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          // Game Screen
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-gray-900 rounded-2xl w-[95vw] h-[95vh] overflow-hidden border border-cyan-500/30"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 bg-black/80 border-b border-cyan-500/30 p-2 flex justify-between items-center z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-cyan-400">LUNAR DEFENSE - Protect Humanity&apos;s Future</h2>
              <div className={`text-sm px-2 py-1 rounded ${
                difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                difficulty === 'normal' ? 'bg-blue-500/20 text-blue-400' :
                difficulty === 'hard' ? 'bg-orange-500/20 text-orange-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {difficulty.toUpperCase()}
              </div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <span>Time: <span className="text-white font-mono">{formatTime(gameTime)}</span></span>
                {gameTime < 180 && (
                  <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded">
                    Min 3:00 for victory
                  </span>
                )}
                {gameTime >= 180 && (
                  <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">
                    ✓ Victory enabled
                  </span>
                )}
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
                onClick={() => {
                  // Reset game to start screen
                  setGameStarted(false);
                  setGameTime(0);
                  setGameWinner(null);
                  setTerranCasualties(0);
                  setZergCasualties(0);
                  setIsPaused(false);
                  setGameSpeed(1);
                  // setBattleLog([]);
                  setMessages([]);
                  setTerranQueue([]);
                  setZergQueue([]);
                  // Reset resources
                  setTerranResources({
                    minerals: 50,
                    vespeneGas: 0,
                    supply: 6,
                    maxSupply: 10
                  });
                  setZergResources({
                    minerals: 50,
                    vespeneGas: 0,
                    supply: 6,
                    maxSupply: 10
                  });
                  // Reset units
                  unitIdCounter.current = 0;
                  const initialTerranUnits: Unit[] = [];
                  for (let i = 0; i < 6; i++) {
                    const stats = UNIT_STATS.scv;
                    unitIdCounter.current++;
                    initialTerranUnits.push({
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
                  setTerranUnits(initialTerranUnits);
                  
                  const initialZergUnits: Unit[] = [];
                  for (let i = 0; i < 6; i++) {
                    const stats = UNIT_STATS.drone;
                    unitIdCounter.current++;
                    initialZergUnits.push({
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
                  setZergUnits(initialZergUnits);
                }}
                className="px-3 py-1 bg-yellow-600/20 border border-yellow-500/50 rounded text-yellow-400 hover:bg-yellow-600/30"
              >
                🔄 Restart
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
            {/* Left Panel - Terran (Reduced Width) */}
            <div className="w-1/5 border-r border-cyan-500/30 p-2 overflow-y-auto">
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
            
            {/* Center - Battlefield (Maximized) */}
            <div className="flex-1 relative bg-gradient-to-b from-gray-700/20 to-gray-900/30">
              <div 
                className="absolute inset-0 opacity-50" 
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
                }}
              />
              
              {/* Battle visualization */}
              <div className="h-full flex flex-col items-center justify-center p-8 relative">
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
                    <div className="text-lg text-gray-400 mb-4">
                      Game Time: <span className="text-white font-mono">{formatTime(gameTime)}</span>
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
                      onClick={() => {
                        // Reset game to start screen - same as restart button
                        setGameStarted(false);
                        setGameTime(0);
                        setGameWinner(null);
                        setTerranCasualties(0);
                        setZergCasualties(0);
                        setIsPaused(false);
                        setGameSpeed(1);
                        // setBattleLog([]);
                        setMessages([]);
                        setTerranQueue([]);
                        setZergQueue([]);
                        // Reset resources
                        setTerranResources({
                          minerals: 50,
                          vespeneGas: 0,
                          supply: 6,
                          maxSupply: 10
                        });
                        setZergResources({
                          minerals: 50,
                          vespeneGas: 0,
                          supply: 6,
                          maxSupply: 10
                        });
                        // Reset units
                        unitIdCounter.current = 0;
                        const initialTerranUnits: Unit[] = [];
                        for (let i = 0; i < 6; i++) {
                          const stats = UNIT_STATS.scv;
                          unitIdCounter.current++;
                          initialTerranUnits.push({
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
                        setTerranUnits(initialTerranUnits);
                        
                        const initialZergUnits: Unit[] = [];
                        for (let i = 0; i < 6; i++) {
                          const stats = UNIT_STATS.drone;
                          unitIdCounter.current++;
                          initialZergUnits.push({
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
                        setZergUnits(initialZergUnits);
                      }}
                      className="mt-8 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold rounded-lg hover:from-cyan-700 hover:to-purple-700"
                    >
                      Play Again
                    </button>
                  </motion.div>
                )}
                
                {/* Battlefield Title with Effects */}
                <motion.div 
                  className="relative mb-6"
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400">
                    LUNAR BATTLEFIELD
                  </h3>
                  <motion.div 
                    className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                
                {/* Main Battle Display Area */}
                <div className="relative w-full">
                  {/* Background Effects */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent rounded-2xl" />
                  
                  {/* Army Display Grid */}
                  <div className="relative grid grid-cols-11 gap-6 p-8 bg-black/40 backdrop-blur-sm rounded-2xl border border-cyan-500/20">
                    {/* Terran Army Section */}
                    <div className="col-span-5">
                      <div className="relative">
                        {/* Faction Header */}
                        <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 rounded-t-lg p-4 border border-blue-500/30">
                          <h4 className="text-2xl font-bold text-blue-300 text-center flex items-center justify-center gap-3">
                            <span className="text-3xl">🛡️</span>
                            TERRAN DOMINION
                            <span className="text-3xl">⚔️</span>
                          </h4>
                        </div>
                        
                        {/* Units Display */}
                        <div className="bg-gradient-to-b from-blue-950/40 to-black/60 rounded-b-lg p-4 border-x border-b border-blue-500/20 space-y-3">
                          {Object.entries(
                            terranUnits.reduce((acc, unit) => {
                              if (!acc[unit.type]) {
                                acc[unit.type] = { count: 0, icon: '', health: 0, maxHealth: 0 };
                              }
                              acc[unit.type].count++;
                              acc[unit.type].health += unit.health;
                              acc[unit.type].maxHealth += unit.maxHealth;
                              acc[unit.type].icon = 
                                unit.type === 'scv' ? '👷' :
                                unit.type === 'marine' ? '🔫' :
                                unit.type === 'marauder' ? '💪' :
                                unit.type === 'tank' ? '🚗' :
                                unit.type === 'battlecruiser' ? '🚁' : '?';
                              return acc;
                            }, {} as Record<string, { count: number; icon: string; health: number; maxHealth: number }>)
                          ).map(([type, data]) => (
                            <motion.div
                              key={type}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.02 }}
                              className="relative group"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg blur group-hover:blur-md transition-all" />
                              <div className="relative bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30 group-hover:border-blue-400/50 transition-all">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <motion.span 
                                      className="text-5xl"
                                      animate={{ rotate: [0, -5, 5, 0] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    >
                                      {data.icon}
                                    </motion.span>
                                    <div>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-blue-200 font-bold text-xl capitalize">{type}</span>
                                        <span className="text-cyan-400 font-black text-2xl">×{data.count}</span>
                                      </div>
                                      <div className="text-sm text-gray-400">
                                        HP: {Math.floor(data.health)}/{data.maxHealth}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Health Bar */}
                                  <div className="w-32">
                                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                      <motion.div 
                                        className="h-full relative overflow-hidden"
                                        style={{
                                          background: data.health / data.maxHealth > 0.6 
                                            ? 'linear-gradient(90deg, #10b981, #34d399)' 
                                            : data.health / data.maxHealth > 0.3 
                                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                            : 'linear-gradient(90deg, #dc2626, #ef4444)'
                                        }}
                                        initial={{ width: '100%' }}
                                        animate={{ width: `${(data.health / data.maxHealth) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                      >
                                        <motion.div 
                                          className="absolute inset-0 bg-white/30"
                                          animate={{ x: ['0%', '100%'] }}
                                          transition={{ duration: 1, repeat: Infinity }}
                                        />
                                      </motion.div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          {terranUnits.length === 0 && (
                            <div className="text-gray-500 text-center py-8">
                              <span className="text-4xl">🚫</span>
                              <p className="mt-2">No units deployed</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  
                    {/* VS Center */}
                    <div className="col-span-1 flex items-center justify-center">
                      <motion.div 
                        className="relative"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/50 to-orange-500/50 blur-2xl" />
                        <div className="relative bg-black/60 rounded-full p-4 border-2 border-yellow-500/50">
                          <span className="text-5xl">⚔️</span>
                        </div>
                        <motion.div 
                          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-yellow-400 font-bold text-sm"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          BATTLE
                        </motion.div>
                      </motion.div>
                    </div>
                  
                    {/* Zerg Army Section */}
                    <div className="col-span-5">
                      <div className="relative">
                        {/* Faction Header */}
                        <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-t-lg p-4 border border-purple-500/30">
                          <h4 className="text-2xl font-bold text-purple-300 text-center flex items-center justify-center gap-3">
                            <span className="text-3xl">🦴</span>
                            ZERG SWARM
                            <span className="text-3xl">👾</span>
                          </h4>
                        </div>
                        
                        {/* Units Display */}
                        <div className="bg-gradient-to-b from-purple-950/40 to-black/60 rounded-b-lg p-4 border-x border-b border-purple-500/20 space-y-3">
                          {Object.entries(
                            zergUnits.reduce((acc, unit) => {
                              if (!acc[unit.type]) {
                                acc[unit.type] = { count: 0, icon: '', health: 0, maxHealth: 0 };
                              }
                              acc[unit.type].count++;
                              acc[unit.type].health += unit.health;
                              acc[unit.type].maxHealth += unit.maxHealth;
                              acc[unit.type].icon = 
                                unit.type === 'drone' ? '🐛' :
                                unit.type === 'zergling' ? '🦗' :
                                unit.type === 'roach' ? '🪳' :
                                unit.type === 'hydralisk' ? '🦂' :
                                unit.type === 'ultralisk' ? '🦏' : '?';
                              return acc;
                            }, {} as Record<string, { count: number; icon: string; health: number; maxHealth: number }>)
                          ).map(([type, data]) => (
                            <motion.div
                              key={type}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.02 }}
                              className="relative group"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg blur group-hover:blur-md transition-all" />
                              <div className="relative bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30 group-hover:border-purple-400/50 transition-all">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <motion.span 
                                      className="text-5xl"
                                      animate={{ rotate: [0, 5, -5, 0] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    >
                                      {data.icon}
                                    </motion.span>
                                    <div>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-purple-200 font-bold text-xl capitalize">{type}</span>
                                        <span className="text-pink-400 font-black text-2xl">×{data.count}</span>
                                      </div>
                                      <div className="text-sm text-gray-400">
                                        HP: {Math.floor(data.health)}/{data.maxHealth}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Health Bar */}
                                  <div className="w-32">
                                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                      <motion.div 
                                        className="h-full relative overflow-hidden"
                                        style={{
                                          background: data.health / data.maxHealth > 0.6 
                                            ? 'linear-gradient(90deg, #10b981, #34d399)' 
                                            : data.health / data.maxHealth > 0.3 
                                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                            : 'linear-gradient(90deg, #dc2626, #ef4444)'
                                        }}
                                        initial={{ width: '100%' }}
                                        animate={{ width: `${(data.health / data.maxHealth) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                      >
                                        <motion.div 
                                          className="absolute inset-0 bg-white/30"
                                          animate={{ x: ['0%', '100%'] }}
                                          transition={{ duration: 1, repeat: Infinity }}
                                        />
                                      </motion.div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          {zergUnits.length === 0 && (
                            <div className="text-gray-500 text-center py-8">
                              <span className="text-4xl">🚫</span>
                              <p className="mt-2">No units spawned</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Battle Statistics Dashboard */}
                <motion.div 
                  className="mt-6 grid grid-cols-3 gap-6 w-full max-w-3xl"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Terran Stats */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-gradient-to-br from-blue-950/80 to-black/80 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-blue-300 font-bold">TERRAN</h5>
                        <span className="text-2xl">🛡️</span>
                      </div>
                      <div className="text-3xl font-black text-white mb-1">
                        {terranUnits.filter(u => u.type !== 'scv').length}
                      </div>
                      <div className="text-xs text-gray-400">Combat Units</div>
                      <div className="mt-2 pt-2 border-t border-blue-500/20">
                        <div className="flex justify-between text-xs">
                          <span className="text-red-400">Casualties</span>
                          <span className="text-red-300 font-bold">{terranCasualties}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Battle Status */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-gradient-to-br from-gray-950/80 to-black/80 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
                      <div className="flex items-center justify-center mb-2">
                        <h5 className="text-yellow-300 font-bold">BATTLE STATUS</h5>
                      </div>
                      <div className="text-center">
                        <motion.div 
                          className="text-2xl font-black"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {terranUnits.filter(u => u.type !== 'scv').length === 0 && zergUnits.filter(u => u.type !== 'drone').length === 0 && (
                            <span className="text-gray-400">PREPARING</span>
                          )}
                          {terranUnits.filter(u => u.type !== 'scv').length > zergUnits.filter(u => u.type !== 'drone').length * 1.5 && (
                            <span className="text-blue-400">TERRAN LEAD!</span>
                          )}
                          {zergUnits.filter(u => u.type !== 'drone').length > terranUnits.filter(u => u.type !== 'scv').length * 1.5 && (
                            <span className="text-purple-400">ZERG SWARM!</span>
                          )}
                          {terranUnits.filter(u => u.type !== 'scv').length > 0 && zergUnits.filter(u => u.type !== 'drone').length > 0 && Math.abs(terranUnits.filter(u => u.type !== 'scv').length - zergUnits.filter(u => u.type !== 'drone').length) < 3 && (
                            <span className="text-orange-400">FIERCE BATTLE!</span>
                          )}
                        </motion.div>
                      </div>
                      <div className="mt-2 text-xs text-center text-gray-400">
                        Total Casualties: {terranCasualties + zergCasualties}
                      </div>
                    </div>
                  </div>
                  
                  {/* Zerg Stats */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-gradient-to-br from-purple-950/80 to-black/80 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-purple-300 font-bold">ZERG</h5>
                        <span className="text-2xl">👾</span>
                      </div>
                      <div className="text-3xl font-black text-white mb-1">
                        {zergUnits.filter(u => u.type !== 'drone').length}
                      </div>
                      <div className="text-xs text-gray-400">Combat Units</div>
                      <div className="mt-2 pt-2 border-t border-purple-500/20">
                        <div className="flex justify-between text-xs">
                          <span className="text-red-400">Casualties</span>
                          <span className="text-red-300 font-bold">{zergCasualties}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Right Panel - Zerg (Reduced Width) */}
            <div className="w-1/5 border-l border-purple-500/30 p-2 overflow-y-auto">
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
        )}
      </motion.div>
    </AnimatePresence>
  );
}