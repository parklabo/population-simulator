'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { worldCountries, CountryData, getCrisisLevel } from '@/lib/world-data';

interface MobileCountrySelectorProps {
  onSelectCountry: (country: CountryData) => void;
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: CountryData | null;
}

export default function MobileCountrySelector({ 
  onSelectCountry, 
  isOpen, 
  onClose,
  selectedCountry 
}: MobileCountrySelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'asia' | 'europe' | 'americas' | 'africa' | 'oceania'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'birthRate' | 'population'>('birthRate');

  // Define regions for filtering
  const getRegion = (country: CountryData): string => {
    const asianCountries = ['China', 'India', 'Japan', 'South Korea', 'Indonesia', 'Philippines', 'Vietnam', 'Thailand', 'Singapore', 'Malaysia', 'Bangladesh', 'Pakistan'];
    const europeanCountries = ['Germany', 'France', 'Italy', 'Spain', 'Poland', 'United Kingdom', 'Netherlands', 'Belgium', 'Greece', 'Portugal', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria'];
    const americanCountries = ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru', 'Venezuela'];
    const africanCountries = ['Nigeria', 'Egypt', 'South Africa', 'Kenya', 'Ethiopia', 'Ghana', 'Morocco', 'Algeria', 'Tunisia'];
    const oceaniaCountries = ['Australia', 'New Zealand'];

    if (asianCountries.includes(country.name)) return 'asia';
    if (europeanCountries.includes(country.name)) return 'europe';
    if (americanCountries.includes(country.name)) return 'americas';
    if (africanCountries.includes(country.name)) return 'africa';
    if (oceaniaCountries.includes(country.name)) return 'oceania';
    return 'other';
  };

  // Filter and sort countries
  const filteredCountries = useMemo(() => {
    let countries = [...worldCountries];

    // Filter by region
    if (selectedRegion !== 'all') {
      countries = countries.filter(country => getRegion(country) === selectedRegion);
    }

    // Sort
    countries.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'population':
          return b.population - a.population;
        case 'birthRate':
        default:
          return a.birthRate - b.birthRate;
      }
    });

    return countries;
  }, [selectedRegion, sortBy]);

  // Get top critical countries for quick access
  const criticalCountries = useMemo(() => {
    return worldCountries
      .filter(c => c.birthRate < 1.5)
      .sort((a, b) => a.birthRate - b.birthRate)
      .slice(0, 3);
  }, []);

  const getCrisisColor = (birthRate: number) => {
    if (birthRate < 1.0) return 'from-red-600 to-red-500';
    if (birthRate < 1.5) return 'from-orange-600 to-orange-500';
    if (birthRate < 2.1) return 'from-yellow-600 to-yellow-500';
    return 'from-green-600 to-green-500';
  };

  const getCrisisTextColor = (birthRate: number) => {
    if (birthRate < 1.0) return 'text-red-400';
    if (birthRate < 1.5) return 'text-orange-400';
    if (birthRate < 2.1) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getCrisisBgColor = (birthRate: number) => {
    if (birthRate < 1.0) return 'bg-red-500/10 border-red-500/30';
    if (birthRate < 1.5) return 'bg-orange-500/10 border-orange-500/30';
    if (birthRate < 2.1) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-green-500/10 border-green-500/30';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black rounded-t-[2rem] max-h-[95vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-2.5 pb-1.5">
            <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 pb-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🌍</span>
                Countries
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {/* Region Pills */}
              <div className="flex gap-2 flex-shrink-0">
                {[
                  { value: 'all', label: 'All Regions', emoji: '🌍' },
                  { value: 'asia', label: 'Asia', emoji: '🌏' },
                  { value: 'europe', label: 'Europe', emoji: '🇪🇺' },
                  { value: 'americas', label: 'Americas', emoji: '🌎' },
                  { value: 'africa', label: 'Africa', emoji: '🌍' },
                  { value: 'oceania', label: 'Oceania', emoji: '🏝️' }
                ].map(region => (
                  <button
                    key={region.value}
                    onClick={() => setSelectedRegion(region.value as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      selectedRegion === region.value
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    <span className="mr-1.5">{region.emoji}</span>
                    {region.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setSortBy('birthRate')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
                  sortBy === 'birthRate'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                📊 Birth Rate
              </button>
              <button
                onClick={() => setSortBy('population')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
                  sortBy === 'population'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                👥 Population
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
                  sortBy === 'name'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                🔤 Name
              </button>
            </div>

            {/* Critical Countries - Horizontal Scroll */}
            {selectedRegion === 'all' && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                  <span className="text-red-500">⚠️</span> Critical
                </p>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                  {criticalCountries.map(country => (
                    <motion.button
                      key={country.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onSelectCountry(country);
                        onClose();
                      }}
                      className={`flex-shrink-0 p-3 rounded-2xl shadow-lg border transition-all ${
                        selectedCountry?.id === country.id 
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-500/50 shadow-cyan-500/20' 
                          : `bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30 hover:scale-105 shadow-red-500/10`
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-[140px]">
                        <span className="text-3xl filter drop-shadow-md">{country.flag}</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white drop-shadow-sm">{country.name}</p>
                          <p className={`text-2xl font-black ${getCrisisTextColor(country.birthRate)} drop-shadow-lg`}>
                            {country.birthRate}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Country Grid */}
          <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: 'calc(95vh - 220px)' }}>
            <div className="grid gap-3">
              {filteredCountries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No countries found</p>
                </div>
              ) : (
                filteredCountries.map((country, index) => (
                  <motion.button
                    key={country.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.3) }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectCountry(country);
                      onClose();
                    }}
                    className={`relative overflow-hidden rounded-2xl transition-all shadow-lg ${
                      selectedCountry?.id === country.id 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-2 border-cyan-500/50 shadow-cyan-500/20' 
                        : 'bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/20 shadow-black/30'
                    }`}
                  >
                    {/* Background Gradient based on crisis level */}
                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${getCrisisColor(country.birthRate)}`} />
                    
                    <div className="relative p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <span className="text-4xl filter drop-shadow-md">{country.flag}</span>
                          <div className="text-left">
                            <p className="font-bold text-white text-lg drop-shadow-sm">{country.name}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-gray-300">
                                {country.population.toFixed(1)}M people
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-black ${getCrisisTextColor(country.birthRate)} drop-shadow-lg`}>
                            {country.birthRate}
                          </div>
                          <div className={`text-[10px] uppercase tracking-wider font-bold ${getCrisisTextColor(country.birthRate)}`}>
                            {getCrisisLevel(country.birthRate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}