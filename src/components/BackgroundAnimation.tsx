import React, { useRef, useEffect, useState } from "react";

// Configurable parameters
const DEFAULT_CONFIG = {
  // Star count and appearance
  totalStarCount: 150, // Base number of stars
  minStarSize: 1, // Minimum star size in pixels
  maxStarSize: 6.5, // Maximum star size in pixels
  minStarOpacity: 0.2, // Minimum star opacity (0-1)
  maxStarOpacity: 0.95, // Maximum star opacity (0-1)

  // Star movement
  baseMovementSpeed: 0.3, // Base speed for autonomous movement (pixels per frame)
  minMovementSpeed: 0.1, // Minimum movement speed
  maxMovementSpeed: 0.5, // Maximum movement speed
  directionChangeChance: 0.008, // Chance of random direction change (0-1)
  directionChangeStrength: 0.5, // How strongly direction changes (0-1)
  pushRecoveryRate: 0.98, // How quickly stars recover from being pushed (lower = longer glide)

  // Mouse interaction
  cursorEffectRadius: 100, // How far the cursor affects stars in pixels
  cursorEffectPower: 1.2, // Strength of cursor push effect

  // Connections between stars
  minLineDistance: 190, // Maximum distance to draw lines between stars
  maxLineOpacity: 0.85, // Maximum opacity of connecting lines
  maxLineThickness: 3, // Maximum thickness of connecting lines

  // Colors
  darkModeStarColor: { r: 22, g: 163, b: 74 }, // Green tint for dark mode
  lightModeStarColor: { r: 0, g: 0, b: 0 }, // Black for light mode
  darkModeLineColor: { r: 22, g: 162, b: 74 }, // Line color for dark mode
  lightModeLineColor: { r: 0, g: 0, b: 0 }, // Line color for light mode

  // Star regeneration
  maxGlideDistance: 100, // Maximum distance a new star can glide from the edge
  gridDivisions: 6, // Number of divisions for density calculation
  densityRadius: 150, // Radius to check for nearby stars when calculating density

  // Performance
  optimizationThreshold: 1000, // Reduce effects when more stars than this
  mobileStarReduction: 0.5, // Reduce stars on mobile by this factor
};

// Store default values separately
export const DEFAULT_VALUES = { ...DEFAULT_CONFIG };

// Function to update default values
export const updateDefaultValues = (newValues: Partial<AnimationConfig>) => {
  Object.assign(DEFAULT_VALUES, newValues);
};

// Function to reset to default values
export const resetToDefaultValues = () => {
  // Create a new object with only the numeric properties
  const numericDefaults: Record<string, number> = {};
  
  // Copy only the numeric properties
  Object.keys(DEFAULT_CONFIG).forEach(key => {
    const value = DEFAULT_CONFIG[key as keyof typeof DEFAULT_CONFIG];
    if (typeof value === "number") {
      numericDefaults[key] = value as number;
    }
  });
  
  // Reset DEFAULT_VALUES to match DEFAULT_CONFIG
  Object.keys(DEFAULT_VALUES).forEach(key => {
    (DEFAULT_VALUES[key as keyof typeof DEFAULT_VALUES] as typeof DEFAULT_VALUES[keyof typeof DEFAULT_VALUES]) = 
      DEFAULT_CONFIG[key as keyof typeof DEFAULT_CONFIG];
  });
  
  // Return only the numeric settings
  return numericDefaults;
};

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  opacity: number;
  speed: number;
  angle: number;
  isGliding?: boolean;
  targetX?: number;
  targetY?: number;
  glideDistance?: number;
}

// Define the type for our config
interface AnimationConfig {
  totalStarCount: number;
  minStarSize: number;
  maxStarSize: number;
  minStarOpacity: number;
  maxStarOpacity: number;
  baseMovementSpeed: number;
  minMovementSpeed: number;
  maxMovementSpeed: number;
  directionChangeChance: number;
  directionChangeStrength: number;
  pushRecoveryRate: number;
  cursorEffectRadius: number;
  cursorEffectPower: number;
  minLineDistance: number;
  maxLineOpacity: number;
  maxLineThickness: number;
  darkModeStarColor: { r: number; g: number; b: number };
  lightModeStarColor: { r: number; g: number; b: number };
  darkModeLineColor: { r: number; g: number; b: number };
  lightModeLineColor: { r: number; g: number; b: number };
  maxGlideDistance: number;
  gridDivisions: number;
  densityRadius: number;
  optimizationThreshold: number;
  mobileStarReduction: number;
}

interface ThemeChangedEvent extends CustomEvent {
  detail: { isDarkMode: boolean };
}

interface BackgroundAnimationProps {
  customSettings?: Partial<AnimationConfig>;
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ customSettings = {} }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const particles = useRef<Particle[]>([]);
  const dimensions = useRef({ width: 0, height: 0 });
  const animationRef = useRef<number>();
  const devicePixelRatio = useRef(1);
  const isMobile = useRef(false);
  const [themeVersion, setThemeVersion] = useState(0); // Used to force re-renders on theme change
  
  // Merge default config with custom settings
  const CONFIG = useRef<AnimationConfig>({
    ...DEFAULT_CONFIG,
    ...customSettings
  });
  
  // Update config when custom settings change
  useEffect(() => {
    CONFIG.current = {
      ...DEFAULT_CONFIG,
      ...customSettings
    };
    
    // Update default values with custom settings
    if (Object.keys(customSettings).length > 0) {
      updateDefaultValues(customSettings);
    }
    
    // Regenerate particles with new settings
    if (particles.current.length > 0) {
      regenerateAllParticles();
    }
  }, [customSettings]);

  // Calculate actual star count based on screen size and device
  const calculateStarCount = () => {
    const { width, height } = dimensions.current;
    const screenArea = width * height;
    const baseArea = 1920 * 1080; // Reference screen size

    // Adjust count based on screen area ratio
    let count = Math.floor(CONFIG.current.totalStarCount * (screenArea / baseArea));

    // Reduce on mobile devices
    if (isMobile.current) {
      count = Math.floor(count * CONFIG.current.mobileStarReduction);
    }

    // Ensure minimum number of stars
    return Math.max(count, 50);
  };

  // Create a new particle
  const createParticle = (x?: number, y?: number): Particle => {
    const { width, height } = dimensions.current;

    // If position not provided, create at random position
    const posX = x !== undefined ? x : Math.random() * width;
    const posY = y !== undefined ? y : Math.random() * height;

    const size =
      Math.random() * (CONFIG.current.maxStarSize - CONFIG.current.minStarSize) +
      CONFIG.current.minStarSize;
    const opacity =
      Math.random() * (CONFIG.current.maxStarOpacity - CONFIG.current.minStarOpacity) +
      CONFIG.current.minStarOpacity;

    // Check if dark mode is active - FORCE CHECK DIRECTLY FROM DOM
    const isDarkMode = document.documentElement.classList.contains("dark");
    
    // Select the appropriate color based on the current theme
    const baseColor = isDarkMode
      ? { ...CONFIG.current.darkModeStarColor }  // Use spread to create a new object
      : { ...CONFIG.current.lightModeStarColor };

    // Generate a color with slight variations based on the theme
    const variation = 30;
    const r = Math.min(255, Math.max(0, Math.floor(
      Math.random() * variation + baseColor.r - variation / 2
    )));
    const g = Math.min(255, Math.max(0, Math.floor(
      Math.random() * variation + baseColor.g - variation / 2
    )));
    const b = Math.min(255, Math.max(0, Math.floor(
      Math.random() * variation + baseColor.b - variation / 2
    )));

    // Create the final color string with the calculated RGB values
    const colorString = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    
    // Generate random angle for movement direction (in radians)
    const angle = Math.random() * Math.PI * 2;
    
    // Generate random speed within the configured range
    const speed = Math.random() * (CONFIG.current.maxMovementSpeed - CONFIG.current.minMovementSpeed) + CONFIG.current.minMovementSpeed;
    
    // Calculate velocity components based on angle and speed
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    return {
      x: posX,
      y: posY,
      size,
      color: colorString,
      vx: vx,
      vy: vy,
      speed: speed, // Store the base speed for reference
      angle: angle, // Store the angle for reference
      opacity,
    };
  };

  // Create a new particle at a specific edge position with glide effect
  const createEdgeParticle = (): Particle => {
    const { width, height } = dimensions.current;
    
    // Simplified approach: choose a random edge and position
    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let edgeX: number, edgeY: number;
    let inwardAngle: number;
    
    // Set position and angle based on chosen edge
    if (edge === 0) { // Top edge
      edgeX = Math.random() * width;
      edgeY = 0;
      inwardAngle = Math.PI / 2 + (Math.random() * Math.PI / 4 - Math.PI / 8); // Mostly downward
    } else if (edge === 1) { // Right edge
      edgeX = width;
      edgeY = Math.random() * height;
      inwardAngle = Math.PI + (Math.random() * Math.PI / 4 - Math.PI / 8); // Mostly leftward
    } else if (edge === 2) { // Bottom edge
      edgeX = Math.random() * width;
      edgeY = height;
      inwardAngle = 3 * Math.PI / 2 + (Math.random() * Math.PI / 4 - Math.PI / 8); // Mostly upward
    } else { // Left edge
      edgeX = 0;
      edgeY = Math.random() * height;
      inwardAngle = 0 + (Math.random() * Math.PI / 4 - Math.PI / 8); // Mostly rightward
    }
    
    // Create base particle at the edge
    const particle = createParticle(edgeX, edgeY);
    
    // Calculate glide distance (how far from edge the particle will travel before normal movement)
    const glideDistance = Math.random() * CONFIG.current.maxGlideDistance;
    
    // Calculate target position based on the inward angle and glide distance
    const targetX = edgeX + Math.cos(inwardAngle) * glideDistance;
    const targetY = edgeY + Math.sin(inwardAngle) * glideDistance;
    
    // Override base particle properties for gliding behavior
    particle.isGliding = true;
    particle.targetX = targetX;
    particle.targetY = targetY;
    particle.glideDistance = glideDistance;
    
    // Set initial velocity toward the target
    const angleToTarget = Math.atan2(targetY - edgeY, targetX - edgeX);
    const glideSpeed = CONFIG.current.baseMovementSpeed * 1.5; // Slightly faster than normal
    
    particle.vx = Math.cos(angleToTarget) * glideSpeed;
    particle.vy = Math.sin(angleToTarget) * glideSpeed;
    
    return particle;
  };

  // Regenerate all particles (e.g., after theme change or settings update)
  const regenerateAllParticles = () => {
    const starCount = calculateStarCount();
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < starCount; i++) {
      newParticles.push(createParticle());
    }
    
    particles.current = newParticles;
  };

  // Setup canvas and particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for mobile device
    isMobile.current = window.innerWidth < 768 || 
                      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Get device pixel ratio for high DPI displays
    devicePixelRatio.current = window.devicePixelRatio || 1;

    // Set up canvas dimensions
    const handleResize = () => {
      if (!canvas) return;
      
      const { width, height } = canvas.getBoundingClientRect();
      dimensions.current = { width, height };
      
      // Set canvas dimensions accounting for device pixel ratio
      canvas.width = width * devicePixelRatio.current;
      canvas.height = height * devicePixelRatio.current;
      
      // Scale the context
      if (contextRef.current) {
        contextRef.current.scale(devicePixelRatio.current, devicePixelRatio.current);
      }
      
      // Regenerate particles on resize
      if (particles.current.length === 0) {
        regenerateAllParticles();
      } else {
        // Keep existing particles but ensure we have the right count
        const currentCount = particles.current.length;
        const targetCount = calculateStarCount();
        
        if (targetCount > currentCount) {
          // Add more particles
          for (let i = 0; i < targetCount - currentCount; i++) {
            particles.current.push(createEdgeParticle());
          }
        } else if (targetCount < currentCount) {
          // Remove excess particles
          particles.current = particles.current.slice(0, targetCount);
        }
      }
    };

    // Get canvas context
    contextRef.current = canvas.getContext("2d");
    
    // Listen for theme changes
    const handleThemeChange = (e: Event) => {
      setThemeVersion(prev => prev + 1);
      
      // Wait for any DOM updates to complete
      setTimeout(() => {
        // Re-generate stars with new theme colors
        regenerateAllParticles();
      }, 0);
    };
    
    // Set initial dimensions
    handleResize();
    
    // Add event listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("themeChanged", handleThemeChange);
    
    // Mouse and touch tracking
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mousePosition.current = { 
          x: e.touches[0].clientX, 
          y: e.touches[0].clientY 
        };
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    
    // Clear position when mouse/touch leaves screen
    const handleMouseLeave = () => {
      mousePosition.current = { x: -100, y: -100 };
    };
    
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchend", handleMouseLeave);

    // Clean up event listeners when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("themeChanged", handleThemeChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchend", handleMouseLeave);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (!contextRef.current) return;
    
    // Main animation function
    const animate = () => {
      if (!contextRef.current) return;
      
      const ctx = contextRef.current;
      const { width, height } = dimensions.current;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw particles
      const particleCount = particles.current.length;
      const mouseX = mousePosition.current.x;
      const mouseY = mousePosition.current.y;
      
      // Check if dark mode is active
      const isDarkMode = document.documentElement.classList.contains("dark");
      
      // Get appropriate line color based on theme
      const lineBaseColor = isDarkMode 
        ? CONFIG.current.darkModeLineColor 
        : CONFIG.current.lightModeLineColor;
      
      // Reusable variables for calculations
      let dx, dy, distance, pushForce, pushAngle;
      let nearbyCount = 0;
      let effectRadius = CONFIG.current.cursorEffectRadius;
      let maxLineOpacity = CONFIG.current.maxLineOpacity;
      let minLineDistance = CONFIG.current.minLineDistance;
      
      // Optimization for large number of stars
      if (particleCount > CONFIG.current.optimizationThreshold) {
        const factor = Math.min(1, CONFIG.current.optimizationThreshold / particleCount);
        effectRadius *= factor;
        maxLineOpacity *= factor;
        minLineDistance *= factor;
      }
      
      // Update each particle
      for (let i = 0; i < particleCount; i++) {
        const p = particles.current[i];
        
        // Apply cursor effect (push away from cursor)
        if (mouseX >= 0 && mouseY >= 0) {
          dx = p.x - mouseX;
          dy = p.y - mouseY;
          distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < effectRadius) {
            // Calculate push force (stronger closer to cursor)
            pushForce = (1 - distance / effectRadius) * CONFIG.current.cursorEffectPower;
            pushAngle = Math.atan2(dy, dx);
            
            // Add to velocity
            p.vx += Math.cos(pushAngle) * pushForce;
            p.vy += Math.sin(pushAngle) * pushForce;
          }
        }
        
        // Handle gliding particles (new stars entering from edges)
        if (p.isGliding && p.targetX !== undefined && p.targetY !== undefined) {
          dx = p.targetX - p.x;
          dy = p.targetY - p.y;
          distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 1) {
            // Target reached, switch to normal movement
            p.isGliding = false;
          }
        }
        
        // Random direction changes (for normal particles)
        if (!p.isGliding && Math.random() < CONFIG.current.directionChangeChance) {
          const randomAngle = Math.random() * Math.PI * 2;
          const changeStrength = CONFIG.current.directionChangeStrength;
          
          // Apply random direction change, keeping original velocity magnitude
          p.vx += Math.cos(randomAngle) * p.speed * changeStrength;
          p.vy += Math.sin(randomAngle) * p.speed * changeStrength;
          
          // Re-normalize velocity to maintain consistent speed
          const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          p.vx = (p.vx / currentSpeed) * p.speed;
          p.vy = (p.vy / currentSpeed) * p.speed;
        }
        
        // Apply recovery to velocity (gradual return to base speed and direction)
        if (!p.isGliding) {
          // Calculate current velocity magnitude
          const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          
          // Only apply recovery if moving faster than base speed
          if (currentSpeed > p.speed) {
            // Apply recovery factor toward base speed
            p.vx *= CONFIG.current.pushRecoveryRate;
            p.vy *= CONFIG.current.pushRecoveryRate;
          }
        }
        
        // Move particle
        p.x += p.vx * CONFIG.current.baseMovementSpeed;
        p.y += p.vy * CONFIG.current.baseMovementSpeed;
        
        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        
        // Draw the star (circle with optional glow)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      
      // Draw connections between nearby particles
      for (let i = 0; i < particleCount; i++) {
        const p1 = particles.current[i];
        
        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles.current[j];
          
          // Calculate distance between particles
          dx = p1.x - p2.x;
          dy = p1.y - p2.y;
          distance = Math.sqrt(dx * dx + dy * dy);
          
          // Draw a line if particles are close enough
          if (distance < minLineDistance) {
            // Calculate opacity based on distance (more transparent as distance increases)
            const opacity = (1 - distance / minLineDistance) * maxLineOpacity;
            
            // Calculate line thickness (thicker for closer particles)
            const thickness = (1 - distance / minLineDistance) * CONFIG.current.maxLineThickness;
            
            // Draw the line
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${lineBaseColor.r}, ${lineBaseColor.g}, ${lineBaseColor.b}, ${opacity})`;
            ctx.lineWidth = Math.max(0.1, thickness);
            ctx.stroke();
            
            // Count nearby particles for performance optimization
            nearbyCount++;
          }
        }
      }
      
      // Request the next frame
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start the animation
    animate();
    
    // Clean up
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [themeVersion]); // Re-run when theme changes

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0" />;
};

export default BackgroundAnimation;