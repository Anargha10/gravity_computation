/**
 * App.jsx
 * Main application entry point and state manager.
 * GravityWell: The Algorithm Comparator
 * 
 * A portfolio-grade demonstration of O(N²) vs O(N log N) complexity
 * in real-time physics simulation.
 */

import React, { useState, useCallback } from 'react';
import SimulationCanvas from './components/SimulationCanvas.jsx';
import Dashboard from './components/Dashboard.jsx';
import './App.css';

function App() {
  const [algorithm, setAlgorithm] = useState('barneshut'); // 'bruteforce' or 'barneshut' - Start with optimal to impress
  const [particleCount, setParticleCount] = useState(4000); // AGGRESSIVE: 4,000 particles to force brute force collapse
  const [metrics, setMetrics] = useState({
    fps: 0,
    checks: 0,
    particleCount: 4000
  });
  const [showModeSwitch, setShowModeSwitch] = useState(false);

  const handleMetricsUpdate = useCallback((newMetrics) => {
    setMetrics(newMetrics);
  }, []);

  const toggleAlgorithm = () => {
    setAlgorithm(prev => prev === 'barneshut' ? 'bruteforce' : 'barneshut');
  };

  const handleAlgorithmChange = (newAlgorithm) => {
    if (newAlgorithm !== algorithm) {
      setAlgorithm(newAlgorithm);
      // Show transition notification
      setShowModeSwitch(true);
      setTimeout(() => setShowModeSwitch(false), 3000);
    }
  };

  return (
    <div className="app-container">
      {/* Background with cyberpunk grid */}
      <div className="cyber-grid"></div>
      
      {/* Main Title - TOP CENTER */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
        <h1 className="text-5xl font-bold text-center font-mono tracking-wider">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            GRAVITY
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            WELL
          </span>
        </h1>
        <p className="text-center text-gray-500 text-sm font-mono mt-2">
          The Algorithm Comparator: O(N²) vs O(N log N)
        </p>
      </div>

      {/* Dashboard - TOP LEFT */}
      <Dashboard metrics={metrics} algorithm={algorithm} />

      {/* Mode Switch Notification - CENTER */}
      {showModeSwitch && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className={`glass-panel-cyber p-6 border-4 ${
            algorithm === 'barneshut' 
              ? 'border-green-400 shadow-lg shadow-green-400/50' 
              : 'border-red-400 shadow-lg shadow-red-400/50'
          } animate-pulse`}>
            <div className="text-center">
              <div className={`text-3xl font-bold font-mono mb-2 ${
                algorithm === 'barneshut' ? 'text-green-400' : 'text-red-400'
              }`}>
                {algorithm === 'barneshut' ? '⚡ OPTIMAL MODE' : '🔥 BRUTE FORCE MODE'}
              </div>
              <div className="text-gray-400 text-sm font-mono">
                {algorithm === 'barneshut' 
                  ? 'Barnes-Hut Algorithm Active - O(N log N)'
                  : 'Brute Force Algorithm Active - O(N²)'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Container - FULL SCREEN */}
      <div className="flex items-center justify-center min-h-screen">
        <SimulationCanvas
          algorithm={algorithm}
          particleCount={particleCount}
          onMetricsUpdate={handleMetricsUpdate}
          canvasWidth={1400}
          canvasHeight={900}
        />
      </div>

      {/* Interactive Debug Hint - BOTTOM LEFT (Barnes-Hut only) */}
      {algorithm === 'barneshut' && (
        <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
          <div className="glass-panel-cyber p-4 w-[320px] border-yellow-400 border-opacity-30">
            <div className="flex items-center gap-2 mb-2">
              <svg 
                className="w-5 h-5 text-yellow-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" 
                />
              </svg>
              <h4 className="text-yellow-400 font-mono font-bold text-xs uppercase tracking-wide">
                Interactive Debug
              </h4>
            </div>
            <p className="text-yellow-300 text-[10px] font-mono leading-relaxed">
              Hover over the canvas to highlight quadtree nodes and visualize the center of mass calculations in real-time.
            </p>
          </div>
        </div>
      )}

      {/* Control Panel - BOTTOM RIGHT */}
      <div className="absolute bottom-6 right-6 z-10">
        <div className="glass-panel-cyber p-5 w-[320px]">
          <div className="space-y-5">
            {/* Algorithm Toggle - Clean Switch */}
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-3 uppercase tracking-widest">
                Algorithm Mode:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAlgorithmChange('barneshut')}
                  className={`py-3 px-4 rounded-lg font-mono font-bold text-sm transition-all duration-300 ${
                    algorithm === 'barneshut'
                      ? 'bg-green-500 bg-opacity-20 border-2 border-green-400 text-green-400 shadow-lg shadow-green-400/20'
                      : 'bg-gray-800 bg-opacity-30 border border-gray-700 text-gray-500 hover:border-gray-600'
                  }`}
                >
                  <div className="text-xs">⚡ OPTIMAL</div>
                  <div className="text-[10px] text-gray-500 mt-1">O(N log N)</div>
                </button>
                <button
                  onClick={() => handleAlgorithmChange('bruteforce')}
                  className={`py-3 px-4 rounded-lg font-mono font-bold text-sm transition-all duration-300 ${
                    algorithm === 'bruteforce'
                      ? 'bg-red-500 bg-opacity-20 border-2 border-red-400 text-red-400 shadow-lg shadow-red-400/20'
                      : 'bg-gray-800 bg-opacity-30 border border-gray-700 text-gray-500 hover:border-gray-600'
                  }`}
                >
                  <div className="text-xs">🔥 BRUTE</div>
                  <div className="text-[10px] text-gray-500 mt-1">O(N²)</div>
                </button>
              </div>
            </div>

            {/* Particle Count Slider */}
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                  Particles:
                </label>
                <span className="text-sm font-mono text-white font-bold">
                  {particleCount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={particleCount}
                onChange={(e) => setParticleCount(parseInt(e.target.value))}
                className="w-full slider"
              />
              <div className="flex justify-between text-xs font-mono text-gray-600 mt-1">
                <span>100</span>
                <span>5,000</span>
              </div>
              
              {/* Complexity Indicator */}
              <div className="mt-2 text-center">
                <div className="text-[10px] text-gray-500 font-mono">
                  Theoretical Checks: 
                  <span className={`ml-1 font-bold ${
                    algorithm === 'barneshut' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {algorithm === 'barneshut' 
                      ? `~${Math.round(particleCount * Math.log2(particleCount)).toLocaleString()}`
                      : `${(particleCount * particleCount).toLocaleString()}`
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-black bg-opacity-50 p-3 rounded border border-gray-800">
              <p className="text-[10px] font-mono text-gray-400 leading-relaxed">
                <span className="text-cyan-400">💡 TIP:</span> At 4000 particles, 
                Optimal maintains higher FPS while Brute drops to &lt;10 FPS. Witness the collapse!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
