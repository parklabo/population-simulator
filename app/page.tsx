'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { worldCountries, getCountryColor, getCrisisLevel, CountryData } from '@/lib/world-data';
import SimulatorModal from '@/components/SimulatorModal';

// Dynamic imports for client-side only components
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-white text-2xl animate-pulse">Loading Earth...</div>
    </div>
  )
});

const StarField = dynamic(() => import('@/components/StarField'), { ssr: false });

export default function Home() {
  const globeEl = useRef<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countries, setCountries] = useState<any>({ features: [] });
  
  // Load world topology
  useEffect(() => {
    fetch('https://unpkg.com/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(setCountries);
  }, []);
  
  // Auto-rotate globe
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      
      // Set initial position - focus on Asia
      globeEl.current.pointOfView({ lat: 30, lng: 100, altitude: 2.5 });
    }
  }, []);
  
  // Generate points for countries
  const countryPoints = useMemo(() => 
    worldCountries.map(country => ({
      lat: country.lat,
      lng: country.lng,
      size: Math.max(0.1, Math.log(country.population) / 10),
      color: getCountryColor(country.birthRate),
      country: country
    })), []
  );
  
  const handleCountryClick = (point: any) => {
    if (point?.country) {
      setSelectedCountry(point.country);
      // Focus on country
      if (globeEl.current) {
        globeEl.current.pointOfView({
          lat: point.lat,
          lng: point.lng,
          altitude: 1.5
        }, 1000);
      }
    }
  };
  
  const handleSimulateClick = () => {
    if (selectedCountry) {
      setIsModalOpen(true);
    }
  };
  
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Starfield Background */}
      <StarField />
      
      {/* Globe */}
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Countries layer
        hexPolygonsData={countries.features || []}
        hexPolygonResolution={3}
        hexPolygonMargin={0.3}
        hexPolygonColor={() => '#ffffff10'}
        
        // Points for countries
        pointsData={countryPoints}
        pointAltitude={0.01}
        pointColor="color"
        pointRadius="size"
        pointLabel={(d: any) => `
          <div class="bg-black/80 backdrop-blur-sm p-2 rounded-lg border border-white/20">
            <div class="text-white font-bold">${d.country.flag} ${d.country.name}</div>
            <div class="text-xs text-gray-300">Population: ${d.country.population.toFixed(1)}M</div>
            <div class="text-xs ${d.country.birthRate < 1.5 ? 'text-red-400' : 'text-green-400'}">
              Birth Rate: ${d.country.birthRate}
            </div>
          </div>
        `}
        onPointClick={handleCountryClick}
        onPointHover={(point: any) => setHoveredCountry(point?.country || null)}
        
        // Atmosphere
        showAtmosphere={true}
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.2}
      />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Header with Menu */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-8 pointer-events-auto"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Global Population Crisis Map
              </h1>
              <p className="text-gray-400 mt-2">Select a country to explore demographic futures</p>
            </div>
            
          </div>
        </motion.div>
        
        {/* Legend and Country Rankings */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-32 left-8 bg-black/60 backdrop-blur-lg rounded-xl p-4 border border-white/10 pointer-events-auto max-w-xs"
        >
          <h3 className="text-white font-semibold mb-3">Birth Rate Crisis Levels</h3>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-gray-300 text-sm">&lt; 1.0 - Extreme</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-gray-300 text-sm">1.0 - 1.5 - Severe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-300 text-sm">1.5 - 2.1 - Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-300 text-sm">&gt; 2.1 - Stable</span>
            </div>
          </div>
          
          {/* Country Rankings */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-white font-semibold mb-3">Birth Rate Rankings</h4>
            <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
              {worldCountries
                .sort((a, b) => a.birthRate - b.birthRate)
                .map((country, index) => (
                  <button
                    key={country.id}
                    onClick={() => {
                      if (globeEl.current) {
                        setSelectedCountry(country);
                        globeEl.current.pointOfView({
                          lat: country.lat,
                          lng: country.lng,
                          altitude: 1.5
                        }, 1000);
                      }
                    }}
                    className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-left"
                  >
                    <span className="text-gray-500 text-xs w-6 text-right">{index + 1}</span>
                    <span className="text-base">{country.flag}</span>
                    <span className="text-white text-xs flex-1 truncate" title={country.name}>
                      {country.name.length > 12 ? country.name.substring(0, 12) + '...' : country.name}
                    </span>
                    <span className={`text-xs font-bold ${
                      country.birthRate < 1.0 ? 'text-red-400' : 
                      country.birthRate < 1.5 ? 'text-orange-400' : 
                      country.birthRate < 2.1 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {country.birthRate}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </motion.div>
        
        {/* Country Info Panel */}
        <AnimatePresence>
          {selectedCountry && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="absolute top-32 right-8 bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 pointer-events-auto w-96"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-4xl">{selectedCountry.flag}</span>
                    {selectedCountry.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Population</p>
                    <p className="text-2xl font-bold text-white">{selectedCountry.population.toFixed(1)}M</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Birth Rate</p>
                    <p className={`text-2xl font-bold ${selectedCountry.birthRate < 1.5 ? 'text-red-400' : selectedCountry.birthRate < 2.1 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {selectedCountry.birthRate}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Life Expectancy</p>
                    <p className="text-2xl font-bold text-blue-400">{selectedCountry.lifeExpectancy}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Crisis Level</p>
                    <p className={`text-lg font-bold ${getCrisisLevel(selectedCountry.birthRate) === 'EXTREME' ? 'text-red-500' : getCrisisLevel(selectedCountry.birthRate) === 'SEVERE' ? 'text-orange-500' : getCrisisLevel(selectedCountry.birthRate) === 'CRITICAL' ? 'text-yellow-500' : 'text-green-500'}`}>
                      {getCrisisLevel(selectedCountry.birthRate)}
                    </p>
                  </div>
                </div>
                
                {selectedCountry.birthRate < 2.1 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">
                      ⚠️ Birth rate below replacement level. Population decline expected without intervention.
                    </p>
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSimulateClick}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>🚀</span>
                  Launch Population Simulator
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-lg rounded-full px-8 py-4 border border-white/10 pointer-events-auto"
        >
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-gray-400 text-xs">Countries in Crisis</p>
              <p className="text-2xl font-bold text-red-400">
                {worldCountries.filter(c => c.birthRate < 2.1).length}
              </p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">Extreme Crisis</p>
              <p className="text-2xl font-bold text-red-600">
                {worldCountries.filter(c => c.birthRate < 1.0).length}
              </p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">World Average</p>
              <p className="text-2xl font-bold text-yellow-400">2.4</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Simulator Modal */}
      {selectedCountry && (
        <SimulatorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          country={selectedCountry}
        />
      )}
    </div>
  );
}