/**
 * PhysicsEngine.js
 * Pure functions for particle physics simulation.
 * Contains both O(N²) Brute Force and O(N log N) Barnes-Hut implementations.
 */

import { QuadTree, Rectangle } from './QuadTree.js';

/**
 * BRUTE FORCE ALGORITHM - O(N²) Complexity
 * Every particle calculates force against every other particle.
 * For N particles: N × N = N² force calculations per frame.
 * Example: 1000 particles = 1,000,000 checks per frame.
 */
export function solveBruteForce(particles, canvasWidth, canvasHeight, G = 0.8, epsilon = 5, damping = 0.99) {
  const n = particles.length;
  let totalChecks = 0;

  // O(N²): Nested loop - THE PERFORMANCE KILLER
  for (let i = 0; i < n; i++) {
    let fx = 0;
    let fy = 0;

    for (let j = 0; j < n; j++) {
      if (i === j) continue; // Don't calculate force on self

      const dx = particles[j].x - particles[i].x;
      const dy = particles[j].y - particles[i].y;
      const distSq = dx * dx + dy * dy;

      // Gravitational force with softening parameter
      // F = G * m1 * m2 / (r² + ε²)
      // ε prevents singularities when particles overlap
      const forceMagnitude =
        (G * particles[i].mass * particles[j].mass) /
        (distSq + epsilon * epsilon);

      const dist = Math.sqrt(distSq);
      if (dist > 0) {
        fx += (dx / dist) * forceMagnitude;
        fy += (dy / dist) * forceMagnitude;
      }

      totalChecks++; // Count every interaction
    }

    // Apply force to update velocity (F = ma → a = F/m)
    particles[i].vx += fx / particles[i].mass;
    particles[i].vy += fy / particles[i].mass;
  }

  // Update positions and apply damping
  for (let i = 0; i < n; i++) {
    particles[i].vx *= damping;
    particles[i].vy *= damping;
    particles[i].x += particles[i].vx;
    particles[i].y += particles[i].vy;

    // Soft wall boundaries (damping when hitting edges)
    if (particles[i].x < 0) {
      particles[i].x = 0;
      particles[i].vx *= -0.5;
    } else if (particles[i].x > canvasWidth) {
      particles[i].x = canvasWidth;
      particles[i].vx *= -0.5;
    }

    if (particles[i].y < 0) {
      particles[i].y = 0;
      particles[i].vy *= -0.5;
    } else if (particles[i].y > canvasHeight) {
      particles[i].y = canvasHeight;
      particles[i].vy *= -0.5;
    }
  }

  return {
    checks: totalChecks,
    quadTree: null // No quadtree in brute force
  };
}

/**
 * BARNES-HUT ALGORITHM - O(N log N) Complexity
 * Uses spatial partitioning (QuadTree) to approximate far-field forces.
 * Distant groups of particles are treated as a single mass at their center.
 * For N particles: ~N × log(N) force calculations per frame.
 * Example: 1000 particles ≈ 10,000 checks per frame (100× faster!)
 */
export function solveBarnesHut(
  particles,
  canvasWidth,
  canvasHeight,
  G = 0.8,
  epsilon = 5,
  damping = 0.99,
  theta = 0.5
) {
  const n = particles.length;
  let totalChecks = 0;

  // Step 1: Build QuadTree - O(N log N)
  const boundary = new Rectangle(
    canvasWidth / 2,
    canvasHeight / 2,
    canvasWidth / 2,
    canvasHeight / 2
  );
  const quadTree = new QuadTree(boundary, 1);

  // Insert all particles into the tree
  for (let i = 0; i < n; i++) {
    quadTree.insert(particles[i]);
  }

  // Step 2: Calculate forces using tree traversal - O(N log N)
  for (let i = 0; i < n; i++) {
    const force = quadTree.calculateForce(particles[i], theta, G, epsilon);

    // Apply force to update velocity
    particles[i].vx += force.fx / particles[i].mass;
    particles[i].vy += force.fy / particles[i].mass;

    totalChecks += force.checks;
  }

  // Step 3: Update positions and apply damping - O(N)
  for (let i = 0; i < n; i++) {
    particles[i].vx *= damping;
    particles[i].vy *= damping;
    particles[i].x += particles[i].vx;
    particles[i].y += particles[i].vy;

    // Soft wall boundaries
    if (particles[i].x < 0) {
      particles[i].x = 0;
      particles[i].vx *= -0.5;
    } else if (particles[i].x > canvasWidth) {
      particles[i].x = canvasWidth;
      particles[i].vx *= -0.5;
    }

    if (particles[i].y < 0) {
      particles[i].y = 0;
      particles[i].vy *= -0.5;
    } else if (particles[i].y > canvasHeight) {
      particles[i].y = canvasHeight;
      particles[i].vy *= -0.5;
    }
  }

  return {
    checks: totalChecks,
    quadTree: quadTree // Return tree for visualization
  };
}

/**
 * Initialize particles with random positions and velocities
 */
export function initializeParticles(count, canvasWidth, canvasHeight) {
  const particles = [];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      mass: 1 + Math.random() * 2, // Mass between 1 and 3
      radius: 2 + Math.random() * 2 // Visual radius
    });
  }
  
  return particles;
}
