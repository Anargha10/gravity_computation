/**
 * Dashboard.jsx
 * Real-time metrics overlay - TOP LEFT CORNER ONLY
 * Clean, compact metrics panel with glassmorphism
 */

import React from 'react';

export default function Dashboard({ metrics, algorithm }) {
  const { fps, checks, particleCount } = metrics;

  // Calculate theoretical max checks for comparison
  const theoreticalBruteForce = particleCount * particleCount;

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toLocaleString('en-US');
  };

  // Determine FPS health status
  const getFpsColor = () => {
    if (fps >= 50) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Calculate actual checks display based on algorithm
  // For brute force, use actual checks from engine (N×(N-1) since it skips self)
  // For Barnes-Hut, use the tree traversal checks
  const actualChecks = checks;

  // Calculate efficiency percentage (how much less computation vs N²)
  const efficiencyPercent = algorithm === 'barneshut' && checks > 0 
    ? (((theoreticalBruteForce - checks) / theoreticalBruteForce) * 100).toFixed(1)
    : null;

  // Calculate Speedup Factor - The "WOW" number for recruiters
  const speedupFactor = algorithm === 'barneshut' && checks > 0
    ? Math.round(theoreticalBruteForce / checks)
    : null;

  return (
    <div className="absolute top-6 left-6 z-10 pointer-events-none">
      {/* Single Compact Metrics Panel - Top Left */}
      <div className="glass-panel-cyber p-5 pointer-events-auto w-[320px]">
        <h3 className="text-sm font-bold mb-4 text-gray-400 font-mono tracking-widest uppercase">
          LIVE METRICS
        </h3>
        
        {/* System Stress Warning - Shows when FPS drops critically low */}
        {fps < 15 && algorithm === 'bruteforce' && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border-2 border-red-400 rounded animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-lg">⚠️</span>
              <div>
                <div className="text-red-400 font-mono font-bold text-xs uppercase">
                  System Stress Detected
                </div>
                <div className="text-red-300 text-[10px] font-mono">
                  {formatNumber(theoreticalBruteForce)} checks/frame
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Excellence Badge - Shows when Barnes-Hut is crushing it */}
        {fps >= 50 && algorithm === 'barneshut' && particleCount >= 2000 && (
          <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border-2 border-green-400 rounded">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">⚡</span>
              <div>
                <div className="text-green-400 font-mono font-bold text-xs uppercase">
                  Optimal Performance
                </div>
                <div className="text-green-300 text-[10px] font-mono">
                  Handling {formatNumber(particleCount)} particles smoothly
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {/* FPS Counter */}
          <div className="flex justify-between items-baseline">
            <span className="text-gray-400 font-mono text-xs uppercase">FPS:</span>
            <span className={`font-mono text-3xl font-bold ${getFpsColor()}`}>
              {fps}
            </span>
          </div>

          {/* Entity Count */}
          <div className="flex justify-between items-baseline">
            <span className="text-gray-400 font-mono text-xs uppercase">Entities:</span>
            <span className="text-white font-mono text-xl font-bold">
              {formatNumber(particleCount)}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 my-3"></div>

          {/* SPEEDUP FACTOR - The WOW Metric (Barnes-Hut only) */}
          {algorithm === 'barneshut' && speedupFactor && (
            <div className="mb-3 p-3 bg-yellow-500 bg-opacity-10 border-2 border-yellow-400 rounded">
              <div className="text-center">
                <div className="text-yellow-400 text-[10px] font-mono uppercase tracking-widest mb-1">
                  Speedup Factor
                </div>
                <div className="text-yellow-400 font-mono text-4xl font-bold">
                  {speedupFactor}X
                </div>
                <div className="text-yellow-300 text-[9px] font-mono mt-1 opacity-70">
                  COMPLEXITY RATIO (N²/N log N)
                </div>
              </div>
            </div>
          )}

          {/* THE KEY METRIC: Interaction Checks */}
          <div>
            <div className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-wide">
              Interaction Checks/Frame:
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-gray-400 font-mono text-xs">Actual:</span>
              <span className={`font-mono text-2xl font-bold ${
                algorithm === 'barneshut' ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatNumber(actualChecks)}
              </span>
            </div>
            
            {/* Show efficiency for Barnes-Hut */}
            {algorithm === 'barneshut' && efficiencyPercent && (
              <div className="mt-3 p-2 bg-green-500 bg-opacity-10 border border-green-400 rounded">
                <div className="text-center">
                  <div className="text-green-400 font-mono font-bold text-lg">
                    {efficiencyPercent}%
                  </div>
                  <div className="text-green-400 text-xs font-mono">
                    less computation than N²
                  </div>
                </div>
              </div>
            )}

            {/* Show comparison for Brute Force */}
            {algorithm === 'bruteforce' && (
              <div className="mt-3 p-2 bg-red-500 bg-opacity-10 border border-red-400 rounded">
                <div className="text-center">
                  <div className="text-xs text-gray-400 font-mono mb-1">
                    Theoretical Max (N²):
                  </div>
                  <div className="text-red-400 font-mono font-bold">
                    {formatNumber(theoreticalBruteForce)}
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-1">
                    {particleCount} × {particleCount}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
