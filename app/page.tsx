'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { worldCountries, getCountryColor, getCrisisLevel, CountryData } from '@/lib/world-data';
import SimulatorModal from '@/components/SimulatorModal';
import MarsColonyModal from '@/components/MarsColonyModal';
import MarsRTSGame from '@/components/MarsRTSGame';

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
const CelestialBodies = dynamic(() => import('@/components/CelestialBodies'), { ssr: false });

export default function Home() {
  const globeEl = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMarsModalOpen, setIsMarsModalOpen] = useState(false);
  const [isMoonRTSOpen, setIsMoonRTSOpen] = useState(false);
  const [countries, setCountries] = useState<{ features: any[] }>({ features: [] }); // eslint-disable-line @typescript-eslint/no-explicit-any
  // const [starData, setStarData] = useState<any[]>([]); // Currently unused
  
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
  
  const handleCountryClick = (point: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
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
  
  // Handle celestial body clicks
  const handleMarsClick = () => {
    setIsMarsModalOpen(true);
  };
  
  const handleMoonClick = () => {
    setIsMoonRTSOpen(true);
  };
  
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Animated Starfield Background */}
      <StarField />
      
      {/* Globe */}
      <div className="absolute inset-0">
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pointLabel={(d: any) => `
            <div class="bg-black/80 backdrop-blur-sm p-2 rounded-lg border border-white/20">
              <div class="text-white font-bold">${d.country.flag} ${d.country.name}</div>
              <div class="text-xs text-gray-300">Population: ${d.country.population.toFixed(1)}M</div>
              <div class="text-xs ${d.country.birthRate < 1.5 ? 'text-red-400' : 'text-green-400'}">
                Birth Rate: ${d.country.birthRate}
              </div>
            </div>
          `}
          onPointClick={handleCountryClick} // eslint-disable-line @typescript-eslint/no-explicit-any
          onPointHover={(point: any) => setHoveredCountry(point?.country || null)} // eslint-disable-line @typescript-eslint/no-explicit-any
          
          // Atmosphere
          showAtmosphere={true}
          atmosphereColor="#3b82f6"
          atmosphereAltitude={0.2}
        />
      </div>
      
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
                Global Population Map
              </h1>
              <p className="text-gray-400 mt-2">Select a country to explore demographic futures • 200-Year Projection</p>
            </div>
            
          </div>
        </motion.div>
        
        {/* Modern Side Panel */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-32 left-8 bg-gradient-to-br from-black/80 via-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl pointer-events-auto max-w-xs overflow-hidden"
        >
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-4 border-b border-white/10">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              Global Birth Crisis
            </h3>
            <p className="text-gray-400 text-xs mt-1">Real-time demographic data</p>
          </div>
          
          {/* Crisis Indicators */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-red-400 font-semibold">EXTREME</span>
                </div>
                <p className="text-white text-sm font-bold mt-1">&lt; 1.0</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-[10px] text-orange-400 font-semibold">SEVERE</span>
                </div>
                <p className="text-white text-sm font-bold mt-1">1.0-1.5</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-[10px] text-yellow-400 font-semibold">CRITICAL</span>
                </div>
                <p className="text-white text-sm font-bold mt-1">1.5-2.1</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-[10px] text-green-400 font-semibold">STABLE</span>
                </div>
                <p className="text-white text-sm font-bold mt-1">&gt; 2.1</p>
              </div>
            </div>
          </div>
          
          {/* Country Rankings Section */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-sm">Birth Rate Rankings</h4>
              <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                {worldCountries.length} countries
              </span>
            </div>
            
            <div className="space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar">
              {worldCountries
                .sort((a, b) => a.birthRate - b.birthRate)
                .map((country, index) => (
                  <motion.button
                    key={country.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
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
                    className="w-full group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <div className="relative flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all">
                      <span className={`text-[10px] font-mono w-5 ${index < 3 ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                        {index + 1}
                      </span>
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-white text-xs flex-1 text-left font-medium">
                        {country.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          country.birthRate < 1.0 ? 'bg-red-500 animate-pulse' : 
                          country.birthRate < 1.5 ? 'bg-orange-500' : 
                          country.birthRate < 2.1 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className={`text-xs font-mono font-bold ${
                          country.birthRate < 1.0 ? 'text-red-400' : 
                          country.birthRate < 1.5 ? 'text-orange-400' : 
                          country.birthRate < 2.1 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {country.birthRate.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
            </div>
            
          </div>
          
          {/* Footer with Data Source */}
          <div className="bg-gradient-to-r from-cyan-600/10 to-purple-600/10 border-t border-white/10 p-3">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
                <p className="text-[9px] text-gray-400 font-mono tracking-wider">
                  UN POPULATION DATA 2024 | World Insights
                </p>
              </div>
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
                  {selectedCountry.isCelestial && (
                    <p className="text-xs text-purple-400 mt-1">🚀 Future Colony Simulation</p>
                  )}
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
                  <span>📊</span>
                  Run Simulation
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
      
      {/* Simulator Modal */}
      {selectedCountry && (
        <SimulatorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          country={selectedCountry}
        />
      )}
      
      {/* Celestial Bodies - Always on top */}
      <CelestialBodies onMarsClick={handleMarsClick} onMoonClick={handleMoonClick} />
      
      {/* Mars Colony Modal */}
      <MarsColonyModal 
        isOpen={isMarsModalOpen}
        onClose={() => setIsMarsModalOpen(false)}
      />
      
      {/* Moon RTS Game - StarCraft Style */}
      <MarsRTSGame 
        isOpen={isMoonRTSOpen}
        onClose={() => setIsMoonRTSOpen(false)}
      />
    </div>
  );
}