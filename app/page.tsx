export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Population Simulator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Visualize demographic futures with real-time birth rate simulations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Simulation Controls
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Rate (per 1000)
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  defaultValue="20"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Death Rate (per 1000)
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  defaultValue="10"
                  className="w-full"
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                Start Simulation
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Population Chart
            </h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart will appear here</p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-lg p-8 max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Current Population</p>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-2">Growth Rate</p>
              <p className="text-3xl font-bold text-green-600">0%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-2">Year</p>
              <p className="text-3xl font-bold text-gray-800">2024</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}