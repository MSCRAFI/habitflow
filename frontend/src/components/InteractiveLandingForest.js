import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import EnhancedInteractiveEffects from './EnhancedInteractiveEffects';

const InteractiveLandingForest = () => {
  const { user } = useAuth(); // Listen for auth changes to detect logout
  const forestRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [weather, setWeather] = useState('sunny');
  const [season] = useState('spring');
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [trees, setTrees] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [particles, setParticles] = useState([]);
  const [interactions, setInteractions] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const animationRef = useRef(null);
  const touchRef = useRef({ isTouch: false, startY: 0 });
  const [resetKey, setResetKey] = useState(0);

  // Tutorial steps
  const tutorialSteps = [
    { text: "Welcome to your habit forest! Move your mouse around to explore", target: "mouse" },
    { text: "Click anywhere to plant your first habit tree", target: "click" },
    { text: "Hover over trees to see them glow with potential", target: "hover" },
    { text: "Click the sky to change the weather", target: "weather" },
    { text: "Swipe vertically on mobile to cycle day/night", target: "swipe" }
  ];

  // Listen for logout events and force complete reset (fixes Profile -> Logout animation corruption)
  useEffect(() => {
    // When user becomes null (logout), trigger a complete component reset
    if (user === null) {
      setResetKey(prev => prev + 1);
    }
  }, [user]);

  // Reset component state on mount (fixes navigation corruption)
  useEffect(() => {
    // Force complete state reset with a slight delay to ensure clean slate
    const resetComponent = () => {
      setMousePos({ x: 0, y: 0 });
      setWeather('sunny');
      setTimeOfDay('day');
      setParticles([]);
      setInteractions(0);
      setShowTutorial(true);
      setTutorialStep(0);
    };
    
    resetComponent();
    
    const demoTrees = [
      { id: 1, x: 20, y: 70, size: 1, type: 'oak', planted: false, growth: 0 },
      { id: 2, x: 45, y: 75, size: 1, type: 'pine', planted: false, growth: 0 },
      { id: 3, x: 70, y: 65, size: 1, type: 'cherry', planted: false, growth: 0 }
    ];
    setTrees(demoTrees);

    // Initialize demo animals
    const demoAnimals = [
      { id: 1, type: 'bird', x: 10, y: 20, targetX: 90, targetY: 25, speed: 0.5 },
      { id: 2, type: 'butterfly', x: 60, y: 40, targetX: 80, targetY: 50, speed: 0.3 },
      { id: 3, type: 'rabbit', x: 30, y: 80, targetX: 40, targetY: 82, speed: 0.2 }
    ];
    setAnimals(demoAnimals);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resetKey]);

  // Mouse movement tracking with parallax effect
  const handleMouseMove = useCallback((e) => {
    if (!forestRef.current) return;
    const rect = forestRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });

    // Update animals to follow mouse
    setAnimals(prev => prev.map(animal => ({
      ...animal,
      targetX: x + (Math.random() - 0.5) * 20,
      targetY: y + (Math.random() - 0.5) * 20
    })));
  }, []);

  // Click to plant trees
  const handleForestClick = useCallback((e) => {
    if (!forestRef.current) return;
    const rect = forestRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Skip if clicking on sky (top 40% for weather control)
    if (y < 40) {
      handleWeatherClick();
      return;
    }

    // Plant new tree
    const newTree = {
      id: Date.now(),
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(50, Math.min(95, y)),
      size: 1,
      type: ['oak', 'pine', 'cherry', 'willow'][Math.floor(Math.random() * 4)],
      planted: true,
      growth: 1
    };

    setTrees(prev => [...prev, newTree]);
    setInteractions(prev => prev + 1);
    
    // Create celebration particles
    createCelebrationParticles(x, y);
    
    // Advance tutorial
    if (tutorialStep === 1) {
      setTutorialStep(2);
    }
  }, [tutorialStep]);

  // Weather control
  const handleWeatherClick = useCallback(() => {
    const weatherCycle = ['sunny', 'cloudy', 'rainy', 'stormy'];
    const currentIndex = weatherCycle.indexOf(weather);
    const nextWeather = weatherCycle[(currentIndex + 1) % weatherCycle.length];
    setWeather(nextWeather);
    setInteractions(prev => prev + 1);
    
    if (tutorialStep === 3) {
      setTutorialStep(4);
    }
  }, [weather, tutorialStep]);

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    touchRef.current.isTouch = true;
    touchRef.current.startY = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!touchRef.current.isTouch) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchRef.current.startY;
    
    // Vertical swipe threshold
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        // Swipe down - day
        setTimeOfDay('day');
      } else {
        // Swipe up - night
        setTimeOfDay('night');
      }
      touchRef.current.startY = currentY;
      
      if (tutorialStep === 4) {
        setShowTutorial(false);
      }
    }
  };

  const handleTouchEnd = () => {
    touchRef.current.isTouch = false;
  };

  // Create celebration particles
  const createCelebrationParticles = (x, y) => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: `particle-${Date.now()}-${i}`,
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * -3 - 1,
      life: 1,
      type: ['✨', '🌟', '💫', '⭐'][Math.floor(Math.random() * 4)]
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 2000);
  };

  // Animation loop for smooth movement
  useEffect(() => {
    const animate = () => {
      // Animate animals
      setAnimals(prev => prev.map(animal => ({
        ...animal,
        x: animal.x + (animal.targetX - animal.x) * animal.speed * 0.02,
        y: animal.y + (animal.targetY - animal.y) * animal.speed * 0.02
      })));

      // Animate particles
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx * 0.5,
        y: particle.y + particle.vy * 0.5,
        vy: particle.vy + 0.1, // gravity
        life: particle.life - 0.02
      })).filter(p => p.life > 0));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Get tree emoji based on type and season
  const getTreeEmoji = (type, season) => {
    const treeTypes = {
      spring: { oak: '🌳', pine: '🌲', cherry: '🌸', willow: '🌿' },
      summer: { oak: '🌳', pine: '🌲', cherry: '🌳', willow: '🌿' },
      autumn: { oak: '🍂', pine: '🌲', cherry: '🍁', willow: '🌿' },
      winter: { oak: '🌳', pine: '🌲', cherry: '🌸', willow: '🌿' }
    };
    return treeTypes[season][type] || '🌱';
  };

  // Get weather emoji and effects
  const getWeatherEffect = () => {
    switch (weather) {
      case 'sunny': return { emoji: '☀️', particles: [] };
      case 'cloudy': return { emoji: '☁️', particles: ['☁️'] };
      case 'rainy': return { emoji: '🌧️', particles: ['💧', '💧', '💧'] };
      case 'stormy': return { emoji: '⛈️', particles: ['⚡', '💧', '💧'] };
      default: return { emoji: '☀️', particles: [] };
    }
  };

  const weatherEffect = getWeatherEffect();

  return (
    <div className="interactive-forest-container">
      {/* Tutorial Overlay */}
      {showTutorial && tutorialStep < tutorialSteps.length && (
        <div className="tutorial-overlay">
          <div className="tutorial-bubble">
            <p>{tutorialSteps[tutorialStep].text}</p>
            <button 
              className="tutorial-skip"
              onClick={() => setShowTutorial(false)}
            >
              Skip Tutorial
            </button>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="forest-progress">
        <div className="progress-item">
          <span>🌱</span>
          <span>{trees.filter(t => t.planted).length} Trees Planted</span>
        </div>
        <div className="progress-item">
          <span>⚡</span>
          <span>{interactions} Interactions</span>
        </div>
        <div className="progress-item">
          <span>{weatherEffect.emoji}</span>
          <span>{weather.charAt(0).toUpperCase() + weather.slice(1)}</span>
        </div>
      </div>

      {/* Interactive Forest Canvas */}
      <div 
        className={`forest-canvas ${timeOfDay}`}
        ref={forestRef}
        onMouseMove={handleMouseMove}
        onClick={handleForestClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sky Layer with Parallax */}
        <div 
          className="sky-layer"
          style={{
            transform: `translate(${mousePos.x * -0.02}%, ${mousePos.y * -0.02}%)`
          }}
        >
          {/* Weather particles */}
          {weatherEffect.particles.map((particle, index) => (
            <div
              key={`weather-${index}`}
              className="weather-particle"
              style={{
                left: `${(index * 25 + mousePos.x * 0.1) % 100}%`,
                top: `${(index * 15 + Math.sin(Date.now() * 0.001 + index) * 10) % 40}%`,
                animationDelay: `${index * 0.5}s`
              }}
            >
              {particle}
            </div>
          ))}

          {/* Clouds */}
          <div className="cloud cloud-1" style={{ transform: `translateX(${mousePos.x * 0.05}px)` }}>☁️</div>
          <div className="cloud cloud-2" style={{ transform: `translateX(${mousePos.x * -0.03}px)` }}>☁️</div>
        </div>

        {/* Background Mountains */}
        <div 
          className="mountains"
          style={{
            transform: `translate(${mousePos.x * -0.1}%, ${mousePos.y * -0.05}%)`
          }}
        >
          <div className="mountain mountain-1">🏔️</div>
          <div className="mountain mountain-2">⛰️</div>
        </div>

        {/* Forest Ground */}
        <div className="forest-ground">
          {/* Trees */}
          {trees.map((tree, index) => (
            <div
              key={tree.id}
              className={`tree ${tree.planted ? 'planted' : 'preview'} ${tree.type}`}
              style={{
                left: `${tree.x}%`,
                top: `${tree.y}%`,
                transform: `scale(${0.5 + tree.size * 0.3}) ${
                  Math.abs(mousePos.x - tree.x) < 10 && Math.abs(mousePos.y - tree.y) < 10 
                    ? 'scale(1.2)' 
                    : ''
                }`,
                filter: Math.abs(mousePos.x - tree.x) < 8 && Math.abs(mousePos.y - tree.y) < 8
                  ? 'drop-shadow(0 0 10px #22c55e)'
                  : 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={() => tutorialStep === 2 && setTutorialStep(3)}
            >
              <div className="tree-emoji">
                {getTreeEmoji(tree.type, season)}
              </div>
              {tree.planted && (
                <div className="tree-base">🟫</div>
              )}
            </div>
          ))}

          {/* Animals */}
          {animals.map((animal) => (
            <div
              key={animal.id}
              className={`forest-animal ${animal.type}`}
              style={{
                left: `${Math.max(0, Math.min(100, animal.x))}%`,
                top: `${Math.max(40, Math.min(100, animal.y))}%`,
                transition: 'all 0.5s ease'
              }}
            >
              {animal.type === 'bird' && '🐦'}
              {animal.type === 'butterfly' && '🦋'}
              {animal.type === 'rabbit' && '🐰'}
            </div>
          ))}

          {/* Particles */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="celebration-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                opacity: particle.life,
                transform: `scale(${particle.life})`
              }}
            >
              {particle.type}
            </div>
          ))}

          {/* Interactive hints */}
          {!showTutorial && trees.length < 5 && (
            <div className="hint-sparkle" style={{ left: `${Math.sin(Date.now() * 0.002) * 20 + 50}%`, top: '80%' }}>
              ✨ Click to plant more trees!
            </div>
          )}
        </div>

        {/* Enhanced Interactive Effects */}
        <EnhancedInteractiveEffects 
          mousePos={mousePos}
          interactions={interactions}
        />
      </div>

      {/* Call to Action */}
      <div className="forest-cta">
        <h3>Ready to grow your own habit forest?</h3>
        <p>You've planted {trees.filter(t => t.planted).length} trees in this demo. 
           Join HabitFlow to track real habits and watch your personal forest flourish!</p>
        <div className="cta-buttons">
          <a href="/register" className="btn btn-primary">
            Start Your Real Forest 🌱
          </a>
          <a href="/login" className="btn btn-secondary">
            Sign In
          </a>
        </div>
      </div>

      <style jsx>{`
        .interactive-forest-container {
          position: relative;
          width: 100%;
          height: 600px;
          border-radius: var(--radius-2xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          user-select: none;
        }

        .tutorial-overlay {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          pointer-events: none;
        }

        .tutorial-bubble {
          background: rgba(255, 255, 255, 0.95);
          padding: var(--space-4);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          text-align: center;
          max-width: 300px;
          border: 2px solid var(--forest-300);
          pointer-events: all;
        }

        .tutorial-bubble p {
          margin: 0 0 var(--space-2) 0;
          font-size: var(--text-sm);
          color: var(--text-primary);
        }

        .tutorial-skip {
          background: var(--forest-500);
          color: white;
          border: none;
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-lg);
          cursor: pointer;
          font-size: var(--text-xs);
        }

        .forest-progress {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          z-index: 100;
        }

        .progress-item {
          background: rgba(255, 255, 255, 0.9);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          box-shadow: var(--shadow-md);
        }

        .forest-canvas {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            #87ceeb 0%,
            #b0e0e6 30%,
            #90ee90 60%,
            #228b22 100%
          );
          cursor: crosshair;
          transition: filter 0.5s ease;
        }

        .forest-canvas.night {
          filter: brightness(0.4) hue-rotate(20deg);
        }

        .sky-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40%;
          overflow: hidden;
        }

        .weather-particle {
          position: absolute;
          font-size: 1rem;
          animation: weatherFloat 3s infinite ease-in-out;
          pointer-events: none;
        }

        @keyframes weatherFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        .cloud {
          position: absolute;
          font-size: 2rem;
          animation: cloudDrift 8s infinite ease-in-out;
        }

        .cloud-1 { top: 10%; left: 20%; animation-delay: 0s; }
        .cloud-2 { top: 20%; left: 70%; animation-delay: 4s; }

        @keyframes cloudDrift {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(20px); }
        }

        .mountains {
          position: absolute;
          bottom: 40%;
          left: 0;
          right: 0;
          height: 20%;
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
        }

        .mountain {
          font-size: 3rem;
          opacity: 0.7;
        }

        .forest-ground {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(34, 139, 34, 0.3) 100%
          );
        }

        .tree {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .tree.preview {
          opacity: 0.6;
          filter: grayscale(0.3);
        }

        .tree.planted {
          animation: treeGrow 0.8s ease-out;
        }

        @keyframes treeGrow {
          0% { transform: scale(0) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        .tree-emoji {
          font-size: 2rem;
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));
          transition: all 0.3s ease;
        }

        .tree:hover .tree-emoji {
          transform: scale(1.1);
          filter: drop-shadow(0 0 10px var(--forest-400));
        }

        .tree-base {
          font-size: 1rem;
          margin-top: -8px;
        }

        .forest-animal {
          position: absolute;
          font-size: 1.2rem;
          filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
          pointer-events: none;
        }

        .forest-animal.bird {
          animation: birdFly 4s infinite ease-in-out;
        }

        .forest-animal.butterfly {
          animation: butterflyFlutter 2s infinite ease-in-out;
        }

        .forest-animal.rabbit {
          animation: rabbitHop 3s infinite ease-in-out;
        }

        @keyframes birdFly {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        @keyframes butterflyFlutter {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          25% { transform: translateY(-5px) rotate(2deg); }
          75% { transform: translateY(-3px) rotate(-1deg); }
        }

        @keyframes rabbitHop {
          0%, 90%, 100% { transform: translateY(0px); }
          10% { transform: translateY(-8px); }
        }

        .celebration-particle {
          position: absolute;
          font-size: 1rem;
          pointer-events: none;
          animation: celebrate 2s ease-out forwards;
        }

        @keyframes celebrate {
          0% { transform: translateY(0px) scale(1); opacity: 1; }
          100% { transform: translateY(-30px) scale(0.5); opacity: 0; }
        }

        .mouse-trail {
          position: absolute;
          font-size: 0.8rem;
          pointer-events: none;
          opacity: 0.6;
          transition: all 0.1s ease;
          animation: trailSparkle 1s infinite ease-in-out;
        }

        @keyframes trailSparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }

        /* Additional forest magic */
        .forest-canvas:hover {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><text y="16" font-size="16">🌱</text></svg>') 10 10, auto;
        }

        .hint-sparkle {
          position: absolute;
          font-size: var(--text-sm);
          color: var(--forest-600);
          background: rgba(255, 255, 255, 0.9);
          padding: var(--space-2);
          border-radius: var(--radius-lg);
          animation: hintPulse 2s infinite ease-in-out;
          pointer-events: none;
        }

        @keyframes hintPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .forest-cta {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.95);
          padding: var(--space-4);
          border-radius: var(--radius-xl);
          text-align: center;
          box-shadow: var(--shadow-lg);
          max-width: 400px;
          border: 2px solid var(--forest-300);
        }

        .forest-cta h3 {
          margin: 0 0 var(--space-2) 0;
          color: var(--forest-700);
          font-size: var(--text-lg);
        }

        .forest-cta p {
          margin: 0 0 var(--space-4) 0;
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }

        .cta-buttons {
          display: flex;
          gap: var(--space-2);
          justify-content: center;
        }

        .btn {
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-lg);
          text-decoration: none;
          font-weight: var(--font-weight-medium);
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          font-size: var(--text-sm);
        }

        .btn-primary {
          background: var(--gradient-forest-primary);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .btn-secondary {
          background: white;
          color: var(--forest-600);
          border: 2px solid var(--forest-300);
        }

        .btn-secondary:hover {
          background: var(--forest-50);
          border-color: var(--forest-400);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .interactive-forest-container {
            height: 500px;
          }

          .forest-canvas {
            cursor: pointer;
          }

          .forest-progress {
            position: relative;
            top: auto;
            right: auto;
            flex-direction: row;
            justify-content: center;
            margin: var(--space-4) 0;
          }

          .progress-item {
            flex: 1;
            justify-content: center;
          }

          .tutorial-bubble {
            max-width: 250px;
          }

          .forest-cta {
            position: relative;
            bottom: auto;
            left: auto;
            transform: none;
            margin-top: var(--space-4);
          }

          .cta-buttons {
            flex-direction: column;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .tree,
          .forest-animal,
          .celebration-particle,
          .weather-particle,
          .mouse-trail {
            animation: none;
          }

          .forest-canvas {
            cursor: pointer;
          }
        }
      `}</style>
    </div>
  );
};

export default InteractiveLandingForest;