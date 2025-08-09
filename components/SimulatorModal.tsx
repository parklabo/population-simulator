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
    startYear: 2025,
    ageStructure: country.ageStructure
  });
  
  // Reset parameters when country changes
  useEffect(() => {
    setParams({
      currentPopulation: country.population,
      birthRate: country.birthRate,
      lifeExpectancy: country.lifeExpectancy,
      immigrationRate: 0,
      startYear: 2025,
      ageStructure: country.ageStructure
    });
    setCurrentYear(2025);
    setIsPlaying(false);
    setHasStarted(false);
  }, [country]);
  
  const simulator = useMemo(() => new PopulationSimulator(), []);
  const projection = useMemo(() => simulator.simulate(params, 200), [params, simulator]); // 200 years to 2225
  
  // Time-lapse animation
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentYear(prev => {
        if (prev >= 2225) {
          setIsPlaying(false);
          return 2225;
        }
        return prev + 1;
      });
    }, 50); // Fixed speed: 50ms per year for 100 years
    
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
    if (!isPlaying) {
      setCurrentYear(2025);
      setHasStarted(true);
    }
    setIsPlaying(!isPlaying);
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
  
  const populationIn2225 = projection.data[projection.data.length - 1]?.totalPopulation || 0;
  const populationChange = ((populationIn2225 - country.population) / country.population * 100).toFixed(1);
  const simulationComplete = currentYear >= 2225; // Check if simulation reached end
  
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
        {/* Enhanced Backdrop with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-purple-900/20 to-black/90 backdrop-blur-md" />
        
        {/* Modal with glassmorphic design */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl rounded-3xl p-6 max-w-7xl w-full max-h-[92vh] overflow-y-auto border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{country.flag}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{country.name}</h2>
                <p className="text-xs text-gray-400">
                  {country.isCelestial ? '🚀 Colony Simulator' : 'Population Simulator'} • 2025-2225
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
                  <p className="text-xs text-gray-500 mb-2">TARGET YEAR</p>
                  <motion.div
                    key={currentYear}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    <p className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                      {currentYear}
                    </p>
                  </motion.div>
                  <div className="mt-2 h-1 bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${(currentYear - 2025) / 200 * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Control Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startTimeLapse}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>{isPlaying ? '⏸' : '▶'}</span>
                      {isPlaying ? 'Pause' : 'Run Simulation'}
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCurrentYear(2025);
                      setIsPlaying(false);
                      setHasStarted(false);
                    }}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all border border-white/10"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>↺</span>
                      Reset
                    </span>
                  </motion.button>
                </div>
                
                {/* Year Slider - Show after simulation starts */}
                {hasStarted && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <p className="text-xs text-gray-500 mb-3">TIMELINE</p>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-2 bg-gray-700 rounded-full"></div>
                        <div 
                          className="absolute h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                          style={{ width: `${(currentYear - 2025) / 200 * 100}%` }}
                        ></div>
                      </div>
                      <input
                        type="range"
                        min="2025"
                        max="2225"
                        step="1"
                        value={currentYear}
                        onChange={(e) => {
                          setCurrentYear(Number(e.target.value));
                          setIsPlaying(false);
                        }}
                        className="relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-600 mt-2">
                      <span>2025</span>
                      <span>2125</span>
                      <span>2225</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Center Panel - Visualization */}
            <div className="col-span-6">
              {/* Main Chart */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 rounded-3xl blur-xl" />
                <div className="relative bg-black/40 backdrop-blur-sm rounded-3xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Population Projection</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full" />
                      <span className="text-xs text-gray-400">Total Population</span>
                    </div>
                  </div>
            {!hasStarted ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-lg mb-4">Press "Run Simulation" to begin</p>
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
            
            {/* Enhanced Current Stats with Visual Population */}
            {hasStarted && (
              <>
                {/* Visual Population Display */}
                <div className="mt-6 p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-400">POPULATION DYNAMICS</h4>
                    <p className="text-xs text-gray-500">
                      Total: <span className="text-white font-bold">{currentData.totalPopulation.toFixed(1)}M</span>
                    </p>
                  </div>
                  
                  {/* Animated Population Icons */}
                  <div className="relative h-24">
                    <div className="absolute inset-0 flex items-center justify-center gap-1">
                      {/* Youth Icons */}
                      <motion.div 
                        className="flex flex-wrap justify-center items-center"
                        animate={{ 
                          scale: [1, 1.05, 1],
                          transition: { duration: 2, repeat: Infinity }
                        }}
                      >
                        {Array.from({ length: Math.max(1, Math.min(15, Math.round((currentData.youth / currentData.totalPopulation) * 30))) }).map((_, i) => (
                          <motion.span
                            key={`youth-${i}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className="text-2xl"
                            style={{ 
                              filter: 'hue-rotate(0deg)',
                              display: 'inline-block',
                              margin: '1px'
                            }}
                          >
                            👶
                          </motion.span>
                        ))}
                      </motion.div>
                      
                      {/* Working Age Icons */}
                      <motion.div 
                        className="flex flex-wrap justify-center items-center"
                        animate={{ 
                          scale: [1, 1.03, 1],
                          transition: { duration: 2.5, repeat: Infinity }
                        }}
                      >
                        {Array.from({ length: Math.max(1, Math.min(20, Math.round((currentData.workingAge / currentData.totalPopulation) * 30))) }).map((_, i) => (
                          <motion.span
                            key={`working-${i}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.02 + 0.3 }}
                            className="text-2xl"
                            style={{ 
                              display: 'inline-block',
                              margin: '1px'
                            }}
                          >
                            {i % 2 === 0 ? '👨‍💼' : '👩‍💼'}
                          </motion.span>
                        ))}
                      </motion.div>
                      
                      {/* Elderly Icons */}
                      <motion.div 
                        className="flex flex-wrap justify-center items-center"
                        animate={{ 
                          scale: [1, 1.02, 1],
                          transition: { duration: 3, repeat: Infinity }
                        }}
                      >
                        {Array.from({ length: Math.max(1, Math.min(15, Math.round((currentData.elderly / currentData.totalPopulation) * 30))) }).map((_, i) => (
                          <motion.span
                            key={`elderly-${i}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.02 + 0.6 }}
                            className="text-2xl"
                            style={{ 
                              display: 'inline-block',
                              margin: '1px'
                            }}
                          >
                            {i % 2 === 0 ? '👴' : '👵'}
                          </motion.span>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Progress Bars for each demographic */}
                  <div className="space-y-2 mt-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-green-400">👶 Youth</span>
                        <span className="text-green-400 font-mono">{((currentData.youth / currentData.totalPopulation) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400"
                          animate={{ width: `${(currentData.youth / currentData.totalPopulation) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-blue-400">👨‍💼 Working</span>
                        <span className="text-blue-400 font-mono">{((currentData.workingAge / currentData.totalPopulation) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                          animate={{ width: `${(currentData.workingAge / currentData.totalPopulation) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-orange-400">👴 Elderly</span>
                        <span className="text-orange-400 font-mono">{((currentData.elderly / currentData.totalPopulation) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
                          animate={{ width: `${(currentData.elderly / currentData.totalPopulation) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Compact Stats Cards */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <div className="bg-black/30 rounded-lg p-2 text-center border border-white/5">
                    <p className="text-[10px] text-gray-500">TOTAL</p>
                    <p className="text-lg font-bold text-white">
                      <CountUp end={currentData.totalPopulation} decimals={1} duration={0.5} suffix="M" />
                    </p>
                  </div>
                  <div className="bg-green-900/20 rounded-lg p-2 text-center border border-green-500/20">
                    <p className="text-[10px] text-gray-500">YOUTH</p>
                    <p className="text-lg font-bold text-green-400">
                      {currentData.youth.toFixed(1)}M
                    </p>
                  </div>
                  <div className="bg-blue-900/20 rounded-lg p-2 text-center border border-blue-500/20">
                    <p className="text-[10px] text-gray-500">WORKING</p>
                    <p className="text-lg font-bold text-blue-400">
                      {currentData.workingAge.toFixed(1)}M
                    </p>
                  </div>
                  <div className="bg-orange-900/20 rounded-lg p-2 text-center border border-orange-500/20">
                    <p className="text-[10px] text-gray-500">ELDERLY</p>
                    <p className="text-lg font-bold text-orange-400">
                      {currentData.elderly.toFixed(1)}M
                    </p>
                  </div>
                </div>
              </>
            )}
              </div>
            </div>
            </div>
            
            {/* Right Panel - Results */}
            <div className="col-span-3">
              {/* Results Section - Show after simulation completes */}
              {simulationComplete ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/5"
                >
                  <h3 className="text-sm font-semibold text-gray-400 mb-4">RESULTS</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-3 border border-purple-500/20">
                      <p className="text-[10px] text-purple-400 uppercase tracking-wider mb-1">2225 Population</p>
                      <p className="text-2xl font-bold text-white">
                        {populationIn2225.toFixed(1)}M
                      </p>
                      <p className={`text-xs mt-1 ${Number(populationChange) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {Number(populationChange) > 0 ? '↑' : '↓'} {Math.abs(Number(populationChange))}%
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 rounded-xl p-3 border border-orange-500/20">
                      <p className="text-[10px] text-orange-400 uppercase tracking-wider mb-1">Decline Starts</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {declineStartYear || 'Never'}
                      </p>
                      {declineStartYear && (
                        <p className="text-xs text-orange-400/70 mt-1">
                          In {declineStartYear - 2025} years
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl p-3 border border-red-500/20">
                      <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">50% Reduction</p>
                      <p className="text-2xl font-bold text-red-400">
                        {projection.halfPoint || 'Never'}
                      </p>
                      {projection.halfPoint && (
                        <p className="text-xs text-red-400/70 mt-1">
                          In {projection.halfPoint - 2025} years
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {params.birthRate < 2.1 && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <p className="text-xs text-red-400 leading-relaxed">
                        ⚠️ Critical: Birth rate {params.birthRate.toFixed(2)} is below replacement level
                      </p>
                    </div>
                  )}
                  
                  {country.isCelestial && (
                    <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                      <p className="text-xs text-purple-400 leading-relaxed">
                        🚀 Colony simulation factors in harsh environment conditions
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                  <h3 className="text-sm font-semibold text-gray-400 mb-4">RESULTS</h3>
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">Run simulation to see results</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Parameters Section - Below the grid */}
          <div className="relative mt-6">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 to-purple-600/5 rounded-3xl blur-xl" />
            <div className="relative bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-3xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">⚙️</span>
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Simulation Parameters</h3>
              </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="group">
                <label className="block text-sm text-gray-400 mb-3 group-hover:text-purple-400 transition-colors">
                  {country.isCelestial ? 'Colony Birth Rate' : 'Birth Rate'}
                </label>
                <div className="relative mb-4">
                  {/* Track Background */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-gray-700 rounded-full shadow-inner">
                    <div 
                      className="absolute h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-200"
                      style={{ width: `${((params.birthRate - 0.5) / 5.5) * 100}%` }}
                    />
                  </div>
                  {/* Range Input */}
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.01"
                    value={params.birthRate}
                    onChange={(e) => handleParamChange('birthRate', parseFloat(e.target.value))}
                    className="relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10"
                  />
                </div>
                <div className="bg-purple-500/10 rounded-lg p-2 border border-purple-500/20">
                  <p className="text-center text-2xl font-bold text-purple-400">
                    {params.birthRate.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="group">
                <label className="block text-sm text-gray-400 mb-3 group-hover:text-blue-400 transition-colors">Life Expectancy Age</label>
                <div className="relative mb-4">
                  {/* Track Background */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-gray-700 rounded-full shadow-inner">
                    <div 
                      className="absolute h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-200"
                      style={{ width: `${((params.lifeExpectancy - 60) / 35) * 100}%` }}
                    />
                  </div>
                  {/* Range Input */}
                  <input
                    type="range"
                    min="60"
                    max="95"
                    step="1"
                    value={params.lifeExpectancy}
                    onChange={(e) => handleParamChange('lifeExpectancy', parseFloat(e.target.value))}
                    className="relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10"
                  />
                </div>
                <div className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
                  <p className="text-center text-2xl font-bold text-blue-400">
                    {params.lifeExpectancy}
                  </p>
                </div>
              </div>
              
              <div className="group">
                <label className="block text-sm text-gray-400 mb-3 group-hover:text-green-400 transition-colors">
                  {country.isCelestial ? 'New Colonists/Year' : 'Net Immigration'}
                </label>
                <div className="relative mb-4">
                  {/* Track Background */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-gray-700 rounded-full shadow-inner">
                    <div 
                      className="absolute h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-200"
                      style={{ 
                        width: `${((params.immigrationRate + 100) / 600) * 100}%`,
                        background: params.immigrationRate < 0 ? 'linear-gradient(to right, #ef4444, #f87171)' : undefined
                      }}
                    />
                  </div>
                  {/* Range Input */}
                  <input
                    type="range"
                    min="-100"
                    max="500"
                    step="10"
                    value={params.immigrationRate}
                    onChange={(e) => handleParamChange('immigrationRate', parseFloat(e.target.value))}
                    className="relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10"
                  />
                </div>
                <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                  <p className="text-center text-2xl font-bold text-green-400">
                    {params.immigrationRate >= 0 ? '+' : ''}{params.immigrationRate}K
                  </p>
                </div>
              </div>
            </div>
            </div>
          </div>
          
          {/* Data Source */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              Data Source: UN Population Division, World Population Prospects 2024 | 200-Year Projection
              {country.ageStructure && " | Age structure data available"}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}