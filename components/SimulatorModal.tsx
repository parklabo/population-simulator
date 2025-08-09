'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CountryData } from '@/lib/world-data';
import { PopulationSimulator, SimulationParams } from '@/lib/population-simulator';
import { Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart } from 'recharts';
import CountUp from 'react-countup';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: CountryData;
}

export default function SimulatorModal({ isOpen, onClose, country }: SimulatorModalProps) {
  const [currentYear, setCurrentYear] = useState(2025);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // Track if simulation has started
  
  const [params, setParams] = useState<SimulationParams>({
    currentPopulation: country.population,
    birthRate: country.birthRate,
    lifeExpectancy: country.lifeExpectancy,
    immigrationRate: 0,
    startYear: 2025
  });
  
  // Reset parameters when country changes
  useEffect(() => {
    setParams({
      currentPopulation: country.population,
      birthRate: country.birthRate,
      lifeExpectancy: country.lifeExpectancy,
      immigrationRate: 0,
      startYear: 2025
    });
    setCurrentYear(2025);
    setIsPlaying(false);
    setHasStarted(false);
  }, [country]);
  
  const simulator = useMemo(() => new PopulationSimulator(), []);
  const projection = useMemo(() => simulator.simulate(params, 75), [params, simulator]);
  
  // Time-lapse animation
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
    }, 50); // Fixed speed: 50ms per year
    
    return () => clearInterval(interval);
  }, [isPlaying]);
  
  // Chart data up to current year (only when simulation has started)
  const chartData = useMemo(() => {
    if (!hasStarted) return [];
    const yearIndex = Math.floor((currentYear - 2025) / 5);
    return projection.data.slice(0, yearIndex + 1).map(d => ({
      year: d.year,
      population: parseFloat(d.totalPopulation.toFixed(2)),
      youth: parseFloat(d.youth.toFixed(2)),
      working: parseFloat(d.workingAge.toFixed(2)),
      elderly: parseFloat(d.elderly.toFixed(2))
    }));
  }, [projection.data, currentYear, hasStarted]);
  
  const currentData = useMemo(() => {
    const yearIndex = Math.floor((currentYear - 2025) / 5);
    return projection.data[Math.min(yearIndex, projection.data.length - 1)];
  }, [projection.data, currentYear]);
  
  const handleParamChange = (key: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setCurrentYear(2025); // Reset animation
    setIsPlaying(false);
    setHasStarted(false); // Reset started status when params change
  };
  
  const startTimeLapse = () => {
    setCurrentYear(2025);
    setIsPlaying(true);
    setHasStarted(true); // Mark as started
  };
  
  // Find critical years
  const declineStartYear = useMemo(() => {
    for (let i = 1; i < projection.data.length; i++) {
      if (projection.data[i].totalPopulation < projection.data[i - 1].totalPopulation) {
        return projection.data[i].year;
      }
    }
    return null;
  }, [projection.data]);
  
  const populationIn2100 = projection.data[projection.data.length - 1]?.totalPopulation || 0;
  const populationChange = ((populationIn2100 - country.population) / country.population * 100).toFixed(1);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-gray-900 rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">{country.flag}</span>
                {country.name} Population Simulator
              </h2>
              <p className="text-gray-400 mt-1">Projecting demographic future from 2025 to 2100</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
          
          {/* Time Display */}
          <div className="text-center mb-8">
            <motion.div
              key={currentYear}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block"
            >
              <p className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                {currentYear}
              </p>
            </motion.div>
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={startTimeLapse}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                ▶ Start Time-Lapse
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {isPlaying ? '⏸ Pause' : '▶ Resume'}
              </button>
              <button
                onClick={() => {
                  setCurrentYear(2025);
                  setIsPlaying(false);
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ↺ Reset
              </button>
            </div>
            
            {/* Year Selector */}
            <div className="mt-6 px-8">
              <input
                type="range"
                min="2025"
                max="2100"
                step="1"
                value={currentYear}
                onChange={(e) => {
                  setCurrentYear(Number(e.target.value));
                  setHasStarted(true);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>2025</span>
                <span>2050</span>
                <span>2075</span>
                <span>2100</span>
              </div>
            </div>
          </div>
          
          {/* Main Chart */}
          <div className="bg-black/50 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Population Projection</h3>
            {!hasStarted ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-lg mb-4">Press "Start Time-Lapse" to begin simulation</p>
                  <p className="text-gray-500 text-sm">Adjust parameters below to see different scenarios</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="populationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Area
                  type="monotone"
                  dataKey="population"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#populationGradient)"
                  strokeWidth={2}
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
            )}
            
            {/* Current Stats - Only show when simulation has started */}
            {hasStarted && (
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Current Population</p>
                  <p className="text-xl font-bold text-white">
                    <CountUp
                      end={currentData.totalPopulation}
                      decimals={1}
                      duration={0.5}
                      suffix="M"
                    />
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Youth (0-14)</p>
                  <p className="text-xl font-bold text-green-400">
                    {((currentData.youth / currentData.totalPopulation) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Working (15-64)</p>
                  <p className="text-xl font-bold text-blue-400">
                    {((currentData.workingAge / currentData.totalPopulation) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Elderly (65+)</p>
                  <p className="text-xl font-bold text-orange-400">
                    {((currentData.elderly / currentData.totalPopulation) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Simulation Parameters</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Birth Rate (per woman)</label>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.01"
                  value={params.birthRate}
                  onChange={(e) => handleParamChange('birthRate', parseFloat(e.target.value))}
                  className="w-full mb-2"
                />
                <div className="text-center text-2xl font-bold text-purple-400">
                  {params.birthRate.toFixed(2)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Life Expectancy (years)</label>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="1"
                  value={params.lifeExpectancy}
                  onChange={(e) => handleParamChange('lifeExpectancy', parseFloat(e.target.value))}
                  className="w-full mb-2"
                />
                <div className="text-center text-2xl font-bold text-blue-400">
                  {params.lifeExpectancy}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Net Immigration (K/year)</label>
                <input
                  type="range"
                  min="-100"
                  max="500"
                  step="10"
                  value={params.immigrationRate}
                  onChange={(e) => handleParamChange('immigrationRate', parseFloat(e.target.value))}
                  className="w-full mb-2"
                />
                <div className="text-center text-2xl font-bold text-green-400">
                  {params.immigrationRate >= 0 ? '+' : ''}{params.immigrationRate}
                </div>
              </div>
            </div>
          </div>
          
          {/* Results - Only show after simulation starts */}
          {hasStarted && (
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-semibold text-white mb-4">Projection Results</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Population in 2100</p>
                  <p className="text-3xl font-bold text-white">
                    {populationIn2100.toFixed(1)}M
                  </p>
                  <p className={`text-sm mt-1 ${Number(populationChange) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {Number(populationChange) > 0 ? '+' : ''}{populationChange}% from 2025
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-1">Decline Starts</p>
                  <p className="text-3xl font-bold text-orange-400">
                    {declineStartYear || 'Never'}
                  </p>
                  {declineStartYear && (
                    <p className="text-sm text-gray-400 mt-1">
                      In {declineStartYear - 2025} years
                    </p>
                  )}
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-1">Population Halves</p>
                  <p className="text-3xl font-bold text-red-400">
                    {projection.halfPoint || 'Never'}
                  </p>
                  {projection.halfPoint && (
                    <p className="text-sm text-gray-400 mt-1">
                      In {projection.halfPoint - 2025} years
                    </p>
                  )}
                </div>
              </div>
              
              {params.birthRate < 2.1 && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">
                    ⚠️ With a birth rate of {params.birthRate.toFixed(2)}, {country.name}'s population will face significant challenges. 
                    Consider policies to increase birth rates or immigration to maintain population stability.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}