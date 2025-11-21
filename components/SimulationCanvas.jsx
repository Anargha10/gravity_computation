/**
 * SimulationCanvas.jsx
 * The core animation engine using useRef to avoid React re-renders.
 * Handles the requestAnimationFrame loop and canvas rendering.
 */

import React, { useRef, useEffect } from 'react';
import { solveBruteForce, solveBarnesHut } from '../logic/PhysicsEngine.js';

export default function SimulationCanvas({
  algorithm,
  particleCount,
  onMetricsUpdate,
  canvasWidth = 1200,
  canvasHeight = 800
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const hoveredNodeRef = useRef(null); // Store hovered quadtree node for debugging
  const quadTreeRef = useRef(null); // Store current quadtree for mouse interaction
  const metricsRef = useRef({
    fps: 0,
    checks: 0,
    frameCount: 0,
    lastTime: performance.now()
  });

  // Initialize particles when count changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        mass: 1 + Math.random() * 2,
        radius: 2 + Math.random() * 2
      });
    }
  }, [particleCount, canvasWidth, canvasHeight]);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let lastFpsUpdate = performance.now();

    const animate = () => {
      const currentTime = performance.now();
      metricsRef.current.frameCount++;

      // Calculate FPS every 500ms
      if (currentTime - lastFpsUpdate > 500) {
        const elapsed = (currentTime - lastFpsUpdate) / 1000;
        metricsRef.current.fps = Math.round(
          metricsRef.current.frameCount / elapsed
        );
        metricsRef.current.frameCount = 0;
        lastFpsUpdate = currentTime;
      }

      // Run physics simulation based on selected algorithm
      let result;
      if (algorithm === 'bruteforce') {
        result = solveBruteForce(
          particlesRef.current,
          canvasWidth,
          canvasHeight
        );
      } else {
        result = solveBarnesHut(
          particlesRef.current,
          canvasWidth,
          canvasHeight
        );
      }

      metricsRef.current.checks = result.checks;

      // Store quadtree for mouse interaction
      quadTreeRef.current = result.quadTree;

      // Update metrics callback
      onMetricsUpdate({
        fps: metricsRef.current.fps,
        checks: result.checks,
        particleCount: particlesRef.current.length
      });

      // Render frame
      renderFrame(ctx, particlesRef.current, result.quadTree, algorithm);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [algorithm, canvasWidth, canvasHeight, onMetricsUpdate]);

  /**
   * Render the current frame
   */
  const renderFrame = (ctx, particles, quadTree, algorithm) => {
    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw Barnes-Hut quadtree grid (only in Barnes-Hut mode)
    if (algorithm === 'barneshut' && quadTree) {
      const gridLines = quadTree.getGridLines();
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)'; // Neon green #22c55e
      ctx.lineWidth = 1;

      for (const line of gridLines) {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      }
    }

    // Draw particles
    for (const particle of particles) {
      // Particle glow effect
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.radius * 3
      );

      if (algorithm === 'barneshut') {
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.9)'); // Neon green core
        gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.4)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 17, 17, 0.9)'); // INTENSE RED core #ff1111
        gradient.addColorStop(0.5, 'rgba(255, 17, 17, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 17, 17, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core particle - INTENSE RED for brute force
      ctx.fillStyle = algorithm === 'barneshut' ? '#22c55e' : '#ff1111';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // CRITICAL: Draw interactive debugging overlay LAST (on top of everything)
    // This ensures yellow highlights are always visible over particles and grid
    if (algorithm === 'barneshut' && quadTree && hoveredNodeRef.current) {
      const debugInfo = hoveredNodeRef.current.getDebugInfo();
      const b = debugInfo.boundary;
      const com = debugInfo.centerOfMass;

      // Highlight the hovered quadrant boundary in bright yellow
      ctx.strokeStyle = '#facc15'; // Bright yellow
      ctx.lineWidth = 3; // Increased from 2 for better visibility
      ctx.strokeRect(
        b.x - b.width,
        b.y - b.height,
        b.width * 2,
        b.height * 2
      );

      // Draw Center of Mass indicator (crosshair)
      if (debugInfo.totalMass > 0) {
        const crossSize = 10;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        
        // Horizontal line of crosshair
        ctx.beginPath();
        ctx.moveTo(com.x - crossSize, com.y);
        ctx.lineTo(com.x + crossSize, com.y);
        ctx.stroke();
        
        // Vertical line of crosshair
        ctx.beginPath();
        ctx.moveTo(com.x, com.y - crossSize);
        ctx.lineTo(com.x, com.y + crossSize);
        ctx.stroke();

        // Draw a glowing dot at center of mass (larger and brighter)
        const gradient = ctx.createRadialGradient(com.x, com.y, 0, com.x, com.y, 8);
        gradient.addColorStop(0, 'rgba(250, 204, 21, 1)');
        gradient.addColorStop(0.5, 'rgba(250, 204, 21, 0.7)');
        gradient.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(com.x, com.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // "System Overload" vignette for Brute Force when FPS is low
    if (algorithm === 'bruteforce' && metricsRef.current.fps < 30) {
      const vignetteGradient = ctx.createRadialGradient(
        canvasWidth / 2,
        canvasHeight / 2,
        canvasHeight * 0.3,
        canvasWidth / 2,
        canvasHeight / 2,
        canvasHeight * 0.7
      );
      vignetteGradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
      vignetteGradient.addColorStop(1, 'rgba(255, 0, 0, 0.4)');

      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Warning text
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ SYSTEM OVERLOAD', canvasWidth / 2, 50);
    }
  };

  /**
   * Handle mouse move for interactive quadtree debugging (Barnes-Hut only)
   */
  const handleMouseMove = (event) => {
    if (algorithm !== 'barneshut' || !quadTreeRef.current) {
      hoveredNodeRef.current = null;
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find the leaf node at mouse position
    hoveredNodeRef.current = quadTreeRef.current.findNodeAtPoint(x, y);
  };

  /**
   * Clear hover state when mouse leaves canvas
   */
  const handleMouseLeave = () => {
    hoveredNodeRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="border border-gray-800 rounded-lg shadow-2xl"
      style={{
        boxShadow: algorithm === 'barneshut' 
          ? '0 0 40px rgba(34, 197, 94, 0.3)'
          : '0 0 40px rgba(255, 17, 17, 0.4)'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}
