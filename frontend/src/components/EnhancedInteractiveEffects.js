import React, { useState, useEffect, useRef } from 'react';

const EnhancedInteractiveEffects = ({ mousePos, interactions, onSoundEffect }) => {
  const [ripples, setRipples] = useState([]);
  const [fireflies, setFireflies] = useState([]);
  const [magicalTrail, setMagicalTrail] = useState([]);
  const effectsRef = useRef(null);

  // Create ripple effect on mouse move
  useEffect(() => {
    const createRipple = () => {
      const newRipple = {
        id: Date.now(),
        x: mousePos.x,
        y: mousePos.y,
        scale: 0,
        opacity: 1
      };
      
      setRipples(prev => [...prev.slice(-2), newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 1000);
    };

    if (mousePos.x > 0 && mousePos.y > 0) {
      createRipple();
    }
  }, [mousePos.x, mousePos.y]);

  // Create magical trail
  useEffect(() => {
    const trailPoint = {
      id: Date.now(),
      x: mousePos.x,
      y: mousePos.y,
      opacity: 1
    };

    setMagicalTrail(prev => [...prev.slice(-8), trailPoint]);

    const timer = setTimeout(() => {
      setMagicalTrail(prev => prev.filter(p => p.id !== trailPoint.id));
    }, 1500);

    return () => clearTimeout(timer);
  }, [mousePos]);

  // Add fireflies at night or during certain interactions
  useEffect(() => {
    if (interactions > 5) {
      const newFireflies = Array.from({ length: 3 }, (_, i) => ({
        id: `firefly-${Date.now()}-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 60 + 20,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        brightness: Math.random()
      }));

      setFireflies(newFireflies);
    }
  }, [interactions]);

  // Animate fireflies
  useEffect(() => {
    const animateFireflies = () => {
      setFireflies(prev => prev.map(firefly => ({
        ...firefly,
        x: Math.max(0, Math.min(100, firefly.x + firefly.vx)),
        y: Math.max(20, Math.min(80, firefly.y + firefly.vy)),
        vx: firefly.vx + (Math.random() - 0.5) * 0.1,
        vy: firefly.vy + (Math.random() - 0.5) * 0.1,
        brightness: Math.sin(Date.now() * 0.005 + firefly.id.length) * 0.5 + 0.5
      })));
    };

    const interval = setInterval(animateFireflies, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="enhanced-effects" ref={effectsRef}>
      {/* Mouse Ripples */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="mouse-ripple"
          style={{
            left: `${ripple.x}%`,
            top: `${ripple.y}%`,
          }}
        />
      ))}

      {/* Magical Trail */}
      {magicalTrail.map((point, index) => (
        <div
          key={point.id}
          className="trail-point"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            opacity: point.opacity * (index / magicalTrail.length),
            animationDelay: `${index * 0.1}s`
          }}
        >
          ✨
        </div>
      ))}

      {/* Fireflies */}
      {fireflies.map(firefly => (
        <div
          key={firefly.id}
          className="firefly"
          style={{
            left: `${firefly.x}%`,
            top: `${firefly.y}%`,
            opacity: firefly.brightness
          }}
        >
          🌟
        </div>
      ))}

      <style jsx>{`
        .enhanced-effects {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 15;
        }

        .mouse-ripple {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(34, 197, 94, 0.8);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: rippleExpand 1s ease-out forwards;
        }

        @keyframes rippleExpand {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
          }
        }

        .trail-point {
          position: absolute;
          font-size: 0.6rem;
          transform: translate(-50%, -50%);
          animation: trailFade 1.5s ease-out forwards;
        }

        @keyframes trailFade {
          0% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
          }
        }

        .firefly {
          position: absolute;
          font-size: 0.8rem;
          transform: translate(-50%, -50%);
          animation: fireflyGlow 2s ease-in-out infinite;
          filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.8));
        }

        @keyframes fireflyGlow {
          0%, 100% { 
            opacity: 0.3; 
            transform: translate(-50%, -50%) scale(0.8);
          }
          50% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedInteractiveEffects;