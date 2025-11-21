# 🎮 GravityWell Usage Guide

## Quick Start

### Running the Application
```bash
# Development mode (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

The app will open at **http://localhost:3000**

## 🎛️ Controls

### Algorithm Toggle Button
- **Location**: Bottom center control panel
- **Function**: Switch between Brute Force (O(N²)) and Barnes-Hut (O(N log N))
- **Visual Feedback**:
  - Cyan border = Barnes-Hut active
  - Red border = Brute Force active

### Particle Count Slider
- **Range**: 100 - 1500 particles
- **Location**: Bottom center control panel
- **Effect**: Dynamically reinitializes simulation with new particle count
- **Tip**: Watch the interaction checks metric as you increase particles!

## 📊 Understanding the Dashboard

### Top Left Panel: Algorithm Info
```
BARNES-HUT OPTIMIZED        or    BRUTE FORCE
Complexity: O(N log N)             Complexity: O(N²)
Method: Spatial Partitioning       Method: Nested Loop
```

### Top Right Panel: Live Metrics
```
FPS: 60                    (Green = Good, Yellow = OK, Red = Bad)
Entities: 1,000            (Current particle count)

INTERACTION CHECKS PER FRAME:
Actual: 9,966              (Real measured checks)
Brute Force Would Be: 1,000,000  (Theoretical N²)
142× FASTER                (Speedup multiplier)
```

### Bottom Banner: Mathematical Proof
```
Brute Force: N² = 1,000,000 checks  →  Barnes-Hut: ~N log N ≈ 9,966 checks  →  Speedup: 100× improvement
```

## 🔬 Experimentation Guide

### Experiment 1: Performance Breaking Point
**Goal**: Find when Brute Force becomes unusable

1. Start with **Barnes-Hut** at 100 particles
2. Increase to 500 particles → Still smooth (60 FPS)
3. Increase to 1000 particles → Still smooth (60 FPS)
4. Switch to **Brute Force**
5. Watch FPS drop and red vignette appear
6. Observe "SYSTEM OVERLOAD" warning

**Expected Result**: Brute Force struggles beyond 500 particles

### Experiment 2: Quadtree Visualization
**Goal**: See how spatial partitioning adapts

1. Set particles to 200
2. Enable **Barnes-Hut** mode
3. Watch the **green grid lines** (Quadtree boundaries)
4. Increase to 1000 particles
5. Notice grid becomes more subdivided in dense areas

**Expected Result**: Grid dynamically adapts to particle density

### Experiment 3: Complexity Scaling
**Goal**: Verify O(N²) vs O(N log N) mathematically

| Particles | Brute Force Checks | Barnes-Hut Checks | Speedup |
|-----------|-------------------|-------------------|---------|
| 100       | 10,000            | ~700              | ~14×    |
| 200       | 40,000            | ~1,600            | ~25×    |
| 500       | 250,000           | ~4,500            | ~56×    |
| 1000      | 1,000,000         | ~10,000           | ~100×   |
| 1500      | 2,250,000         | ~16,000           | ~140×   |

**Expected Result**: Speedup grows as N increases (N / log N)

## 🎨 Visual Feedback System

### Barnes-Hut Mode (Optimized)
- **Particle Color**: Cyan (#00ffff)
- **Glow**: Blue-cyan gradient
- **Grid**: Neon green lines showing Quadtree structure
- **Border**: Cyan glow around canvas
- **Expected FPS**: 60 FPS up to 1500 particles

### Brute Force Mode (Unoptimized)
- **Particle Color**: Red (#ff6464)
- **Glow**: Red gradient
- **Grid**: None (doesn't use Quadtree)
- **Border**: Red glow around canvas
- **Low FPS Effect**: Red vignette + "⚠ SYSTEM OVERLOAD" text
- **Expected FPS**: Drops significantly above 500 particles

## 🐛 Expected Behaviors (Not Bugs!)

### 1. Particles Cluster at Edges
**Why**: Gravitational attraction pulls particles together. Soft walls prevent them from escaping.
**Solution**: This is realistic N-body behavior. Increase initial velocity or add repulsion.

### 2. FPS Varies Slightly
**Why**: Browser tab background throttling, other processes, particle distribution.
**Solution**: This is normal. Compare relative performance between algorithms.

### 3. Exact Check Count Varies
**Why**: Barnes-Hut uses approximation - check count depends on particle distribution.
**Solution**: The ~N log N approximation holds on average.


## 📱 Browser Compatibility

### Recommended
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

### Requirements
- Canvas API support
- ES6+ JavaScript
- requestAnimationFrame

### Performance Notes
- **Desktop**: Best performance (60 FPS at 1500 particles)
- **Laptop**: Good (60 FPS at 1000 particles)
- **Tablet**: Acceptable (60 FPS at 500 particles)
- **Mobile**: Limited (30 FPS at 300 particles)

## 🔧 Troubleshooting

### Issue: Particles disappear
**Solution**: They likely flew off screen. Refresh to reinitialize.

### Issue: FPS stuck at 0
**Solution**: Tab is in background. Focus the tab to resume animation.

### Issue: Grid not visible
**Solution**: Make sure you're in Barnes-Hut mode (cyan button).

### Issue: Build errors
**Solution**: 
```bash
rm -rf node_modules
npm install
npm run dev
```


