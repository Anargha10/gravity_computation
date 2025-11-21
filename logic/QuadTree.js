/**
 * QuadTree.js
 * Recursive spatial partitioning data structure for Barnes-Hut algorithm.
 * Divides 2D space into quadrants to approximate far-field gravitational forces.
 * This reduces force calculation complexity from O(N²) to O(N log N).
 */

export class Rectangle {
  constructor(x, y, width, height) {
    this.x = x; // Center X
    this.y = y; // Center Y
    this.width = width; // Half-width
    this.height = height; // Half-height
  }

  contains(particle) {
    return (
      particle.x >= this.x - this.width &&
      particle.x <= this.x + this.width &&
      particle.y >= this.y - this.height &&
      particle.y <= this.y + this.height
    );
  }

  intersects(range) {
    return !(
      range.x - range.width > this.x + this.width ||
      range.x + range.width < this.x - this.width ||
      range.y - range.height > this.y + this.height ||
      range.y + range.height < this.y - this.height
    );
  }
}

export class QuadTree {
  constructor(boundary, capacity = 1) {
    this.boundary = boundary; // Rectangle defining this node's region
    this.capacity = capacity; // Max particles before subdivision (typically 1 for Barnes-Hut)
    this.particles = []; // Particles in this node
    this.divided = false; // Whether this node has been subdivided

    // Quadrant children (created on subdivision)
    this.northeast = null;
    this.northwest = null;
    this.southeast = null;
    this.southwest = null;

    // Center of mass data (for Barnes-Hut approximation)
    this.totalMass = 0;
    this.centerOfMassX = 0;
    this.centerOfMassY = 0;
  }

  /**
   * Insert a particle into the quadtree.
   * If capacity exceeded, subdivide and redistribute particles.
   */
  insert(particle) {
    // Ignore particles outside boundary
    if (!this.boundary.contains(particle)) {
      return false;
    }

    // If capacity not reached and not yet divided, add particle here
    if (this.particles.length < this.capacity && !this.divided) {
      this.particles.push(particle);
      this.updateCenterOfMass(particle);
      return true;
    }

    // Subdivide if not already divided
    if (!this.divided) {
      this.subdivide();
    }

    // Try to insert into children
    if (this.northeast.insert(particle)) {
      this.updateCenterOfMass(particle);
      return true;
    }
    if (this.northwest.insert(particle)) {
      this.updateCenterOfMass(particle);
      return true;
    }
    if (this.southeast.insert(particle)) {
      this.updateCenterOfMass(particle);
      return true;
    }
    if (this.southwest.insert(particle)) {
      this.updateCenterOfMass(particle);
      return true;
    }

    // Should never reach here
    return false;
  }

  /**
   * Subdivide this node into 4 quadrants (NE, NW, SE, SW)
   */
  subdivide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;

    const ne = new Rectangle(x + w, y - h, w, h);
    const nw = new Rectangle(x - w, y - h, w, h);
    const se = new Rectangle(x + w, y + h, w, h);
    const sw = new Rectangle(x - w, y + h, w, h);

    this.northeast = new QuadTree(ne, this.capacity);
    this.northwest = new QuadTree(nw, this.capacity);
    this.southeast = new QuadTree(se, this.capacity);
    this.southwest = new QuadTree(sw, this.capacity);

    this.divided = true;

    // Redistribute existing particles to children
    for (const particle of this.particles) {
      this.northeast.insert(particle) ||
        this.northwest.insert(particle) ||
        this.southeast.insert(particle) ||
        this.southwest.insert(particle);
    }

    this.particles = []; // Clear particles from internal node
  }

  /**
   * Update center of mass with new particle.
   * Uses incremental formula: COM = (m1*p1 + m2*p2) / (m1 + m2)
   */
  updateCenterOfMass(particle) {
    const totalMass = this.totalMass + particle.mass;
    this.centerOfMassX =
      (this.centerOfMassX * this.totalMass + particle.x * particle.mass) /
      totalMass;
    this.centerOfMassY =
      (this.centerOfMassY * this.totalMass + particle.y * particle.mass) /
      totalMass;
    this.totalMass = totalMass;
  }

  /**
   * Calculate gravitational force on a particle using Barnes-Hut approximation.
   * θ (theta) is the threshold for using approximation vs exact calculation.
   * Returns { fx, fy, checks } where checks counts the number of interactions.
   */
  calculateForce(particle, theta = 0.5, G = 1, epsilon = 5) {
    let fx = 0;
    let fy = 0;
    let checks = 0;

    // Don't calculate force on empty nodes
    if (this.totalMass === 0) {
      return { fx, fy, checks };
    }

    const dx = this.centerOfMassX - particle.x;
    const dy = this.centerOfMassY - particle.y;
    const distSq = dx * dx + dy * dy;

    // Skip if this is the particle itself (distance ~0)
    if (distSq < 1e-10) {
      return { fx, fy, checks };
    }

    const s = this.boundary.width * 2; // Size of region
    const d = Math.sqrt(distSq); // Distance to center of mass

    // Barnes-Hut criterion: if s/d < θ, use approximation
    // Otherwise, if this is a leaf or if s/d < θ, calculate force
    if (!this.divided || s / d < theta) {
      // Use center of mass approximation for this entire region
      // F = G * m1 * m2 / (r² + ε²)  [with softening]
      const forceMagnitude =
        (G * particle.mass * this.totalMass) / (distSq + epsilon * epsilon);
      fx = (dx / d) * forceMagnitude;
      fy = (dy / d) * forceMagnitude;
      checks = 1; // One interaction check
    } else {
      // Recursively calculate forces from children
      const neForce = this.northeast.calculateForce(particle, theta, G, epsilon);
      const nwForce = this.northwest.calculateForce(particle, theta, G, epsilon);
      const seForce = this.southeast.calculateForce(particle, theta, G, epsilon);
      const swForce = this.southwest.calculateForce(particle, theta, G, epsilon);

      fx = neForce.fx + nwForce.fx + seForce.fx + swForce.fx;
      fy = neForce.fy + nwForce.fy + seForce.fy + swForce.fy;
      checks = neForce.checks + nwForce.checks + seForce.checks + swForce.checks;
    }

    return { fx, fy, checks };
  }

  /**
   * Get all grid lines for visualization.
   * Returns array of { x1, y1, x2, y2 } representing boundary lines.
   */
  getGridLines() {
    const lines = [];
    
    // Add this node's boundary
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width;
    const h = this.boundary.height;

    // Only draw internal divisions (not the outer boundary)
    if (this.divided) {
      // Vertical line
      lines.push({
        x1: x,
        y1: y - h,
        x2: x,
        y2: y + h
      });
      // Horizontal line
      lines.push({
        x1: x - w,
        y1: y,
        x2: x + w,
        y2: y
      });

      // Recursively add children's lines
      lines.push(...this.northeast.getGridLines());
      lines.push(...this.northwest.getGridLines());
      lines.push(...this.southeast.getGridLines());
      lines.push(...this.southwest.getGridLines());
    }

    return lines;
  }

  /**
   * Find the leaf node (quadrant) containing the given point (x, y).
   * Returns the QuadTree node or null if point is outside bounds.
   * Used for interactive debugging visualization.
   */
  findNodeAtPoint(x, y) {
    // Check if point is within this node's boundary
    const point = { x, y };
    if (!this.boundary.contains(point)) {
      return null;
    }

    // If this is a leaf node, return it
    if (!this.divided) {
      return this;
    }

    // Recursively search children
    return (
      this.northeast.findNodeAtPoint(x, y) ||
      this.northwest.findNodeAtPoint(x, y) ||
      this.southeast.findNodeAtPoint(x, y) ||
      this.southwest.findNodeAtPoint(x, y)
    );
  }

  /**
   * Get the boundary and center of mass data for debugging visualization.
   * Returns { boundary, centerOfMass, totalMass }
   */
  getDebugInfo() {
    return {
      boundary: {
        x: this.boundary.x,
        y: this.boundary.y,
        width: this.boundary.width,
        height: this.boundary.height
      },
      centerOfMass: {
        x: this.centerOfMassX,
        y: this.centerOfMassY
      },
      totalMass: this.totalMass,
      particleCount: this.particles.length,
      isDivided: this.divided
    };
  }
}
