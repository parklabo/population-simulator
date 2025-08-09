'use client';

import { useState } from 'react';
import { birthRateData, REPLACEMENT_RATE, getSeverityColor, calculateDeclineRate } from '@/lib/birth-rate-data';

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState(birthRateData[0]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Crisis Alert Header */}
      <div className="bg-red-900 border-b border-red-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <span className="animate-pulse">🚨</span>
            <p className="text-white font-semibold">
              GLOBAL DEMOGRAPHIC CRISIS: 20 countries below replacement rate of {REPLACEMENT_RATE}
            </p>
            <span className="animate-pulse">🚨</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-4">
            Population Crisis Simulator
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Visualizing the demographic crisis that threatens our future. 
            Countries worldwide are facing unprecedented population decline.
          </p>
        </div>

        {/* Critical Statistics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">World's Lowest</h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{birthRateData[0].flag}</span>
              <div>
                <p className="text-2xl font-bold text-red-500">{birthRateData[0].birthRate}</p>
                <p className="text-gray-400">{birthRateData[0].country}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">Replacement Rate</h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <p className="text-2xl font-bold text-green-500">{REPLACEMENT_RATE}</p>
                <p className="text-gray-400">Required for stability</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">Countries in Crisis</h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <p className="text-2xl font-bold text-orange-500">{birthRateData.length}</p>
                <p className="text-gray-400">Below replacement rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Country Rankings */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-10">
          <h2 className="text-2xl font-bold text-white mb-6">
            Countries with Lowest Birth Rates
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {birthRateData.map((country) => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedCountry.code === country.code 
                    ? 'bg-gray-700 border-blue-500' 
                    : 'bg-gray-900 border-gray-700 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">#{country.rank}</span>
                  <span className="text-2xl">{country.flag}</span>
                </div>
                <p className="text-white font-semibold text-left">{country.country}</p>
                <div className="flex items-center justify-between mt-2">
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: getSeverityColor(country.criticalLevel) }}
                  >
                    {country.birthRate}
                  </span>
                  <span className="text-xs text-gray-500">
                    -{calculateDeclineRate(country.birthRate)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Country Detail */}
        {selectedCountry && (
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">{selectedCountry.flag}</span>
              <div>
                <h2 className="text-3xl font-bold text-white">{selectedCountry.country}</h2>
                <p className="text-gray-400">Rank #{selectedCountry.rank} globally</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Birth Rate</p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: getSeverityColor(selectedCountry.criticalLevel) }}
                >
                  {selectedCountry.birthRate}
                </p>
                <p className="text-gray-500 text-sm mt-1">births per woman</p>
              </div>

              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Deficit from Replacement</p>
                <p className="text-3xl font-bold text-red-500">
                  -{(REPLACEMENT_RATE - selectedCountry.birthRate).toFixed(2)}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {calculateDeclineRate(selectedCountry.birthRate)}% below needed
                </p>
              </div>

              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Crisis Level</p>
                <p 
                  className="text-3xl font-bold capitalize"
                  style={{ color: getSeverityColor(selectedCountry.criticalLevel) }}
                >
                  {selectedCountry.criticalLevel}
                </p>
                <p className="text-gray-500 text-sm mt-1">demographic situation</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">
                <strong>Impact:</strong> At {selectedCountry.birthRate} births per woman, 
                {selectedCountry.country}'s population will decline by approximately{' '}
                {Math.round(calculateDeclineRate(selectedCountry.birthRate) / 2)}% per generation, 
                leading to severe economic and social challenges.
              </p>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-10 text-center">
          <p className="text-gray-400 mb-4">
            This crisis requires immediate attention and action from policymakers, businesses, and individuals.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            Share This Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}