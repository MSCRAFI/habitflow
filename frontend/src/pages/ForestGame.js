import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const ForestGame = () => {
  const [loading, setLoading] = useState(true);
  const [forestData, setForestData] = useState(null);
  const [trees, setTrees] = useState([]);
  const [selectedTree, setSelectedTree] = useState(null);
  const [showRewards, setShowRewards] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTree, setDraggedTree] = useState(null);
  const [showWeatherMenu, setShowWeatherMenu] = useState(false);
  const [showCareMenu, setShowCareMenu] = useState(null);
  const [creatures, setCreatures] = useState([]);
  const [weatherParticles, setWeatherParticles] = useState([]);
  const [dayNightCycle, setDayNightCycle] = useState(0); // 0-1 where 0=day, 1=night
  const forestRef = useRef(null);
  const animationRef = useRef(null);

  const fetchForestData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get both forest data and all user habits
      const [forestResponse, allHabitsResponse] = await Promise.all([
        api.getForestOverview().catch(error => {
          // Forest API not available, using fallback
          return { tree_positions: [], layout: {}, current_weather: null, active_creatures: [] };
        }),
        api.getHabits()
      ]);
      
      setForestData(forestResponse);
      
      // Get all user habits (handle paginated response)
      const userHabits = allHabitsResponse?.results || allHabitsResponse || [];
      
      // Create a map of existing tree positions
      const existingTreeMap = new Map();
      (forestResponse?.tree_positions || []).forEach(treePos => {
        existingTreeMap.set(treePos.habit.id, treePos);
      });
      
      // Create trees for all habits, auto-generating missing ones
      const allTrees = userHabits.map((habit, index) => {
        let treePosition = existingTreeMap.get(habit.id);
        
        // If no tree position exists, create a default one
        if (!treePosition) {
          // Auto-generating tree position for habit (no saved position)
          
          // Create a nice spread pattern
          const baseX = 30 + (index % 3) * 20; // 30, 50, 70
          const baseY = 40 + Math.floor(index / 3) * 15; // Rows of trees
          
          treePosition = {
            habit: habit,
            x: baseX + (Math.random() - 0.5) * 10, // Add some randomness
            y: Math.min(baseY + (Math.random() - 0.5) * 10, 80), // Keep within bounds
            health_bonus: 0,
            size_multiplier: 1,
            growth_stage: 'sapling',
            tree_type: null,
            last_watered: null,
            last_pruned: null,
            last_fertilized: null,
            is_diseased: false
          };
        }
        
        // Transform to component format
        return {
          id: habit.id,
          habitName: habit.title,
          size: Math.min(habit.current_streak || 1, 20), // Minimum size 1 for visibility
          health: Math.min((habit.completion_rate || 50) / 10, 10) + (treePosition.health_bonus || 0),
          type: getTreeType(habit.category, treePosition.tree_type),
          x: treePosition.x,
          y: treePosition.y,
          streak: habit.current_streak || 0,
          category: habit.category,
          sizeMultiplier: treePosition.size_multiplier || 1,
          healthBonus: treePosition.health_bonus || 0,
          growthStage: treePosition.growth_stage || 'sapling',
          lastWatered: treePosition.last_watered,
          lastPruned: treePosition.last_pruned,
          lastFertilized: treePosition.last_fertilized,
          isDiseased: treePosition.is_diseased || false
        };
      });
      
      // Loaded trees for habits
      setTrees(allTrees);
      setCreatures(forestResponse?.active_creatures || []);
      
      // Start day/night cycle if enabled
      if (forestResponse?.layout?.day_night_cycle) {
        startDayNightCycle();
      }
      
      // Create weather particles based on current weather
      if (forestResponse?.current_weather) {
        createWeatherParticles(forestResponse.current_weather.weather_type);
      }
      
    } catch (error) {
      console.error('Error fetching forest data:', error);
      // Fallback - just show trees for habits even if forest API fails
      try {
        const allHabitsResponse = await api.getHabits();
        const userHabits = allHabitsResponse?.results || allHabitsResponse || [];
        
        const fallbackTrees = userHabits.map((habit, index) => ({
          id: habit.id,
          habitName: habit.title,
          size: Math.min(habit.current_streak || 1, 20),
          health: 5,
          type: getTreeType(habit.category),
          x: 30 + (index % 3) * 20,
          y: 40 + Math.floor(index / 3) * 15,
          streak: habit.current_streak || 0,
          category: habit.category,
          sizeMultiplier: 1,
          healthBonus: 0,
          growthStage: 'sapling',
          lastWatered: null,
          lastPruned: null,
          lastFertilized: null,
          isDiseased: false
        }));
        
        // Fallback: created trees for habits
        setTrees(fallbackTrees);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setTrees([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForestData();
  }, [fetchForestData]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const getTreeType = (category, customType) => {
    if (customType) {
      const customTypes = {
        cherry_blossom: { emoji: '🌸', color: '#ff69b4' },
        oak: { emoji: '🌳', color: '#8b4513' },
        pine: { emoji: '🌲', color: '#228b22' },
        palm: { emoji: '🌴', color: '#32cd32' },
        willow: { emoji: '🌿', color: '#9acd32' }
      };
      if (customTypes[customType]) return customTypes[customType];
    }
    
    const treeTypes = {
      health: { emoji: '🌳', color: '#22c55e' },
      fitness: { emoji: '🌲', color: '#059669' },
      productivity: { emoji: '🌴', color: '#3b82f6' },
      learning: { emoji: '🌺', color: '#8b5cf6' },
      mindfulness: { emoji: '🌸', color: '#ec4899' },
      social: { emoji: '🌻', color: '#f59e0b' },
      other: { emoji: '🌱', color: '#6b7280' }
    };
    return treeTypes[category] || treeTypes.other;
  };

  const startDayNightCycle = () => {
    const updateCycle = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeDecimal = hours + minutes / 60;
      
      // Calculate day/night cycle (0 = day, 1 = night)
      // Day: 6am-6pm, Night: 6pm-6am
      let cycle = 0;
      if (timeDecimal >= 18 || timeDecimal < 6) {
        // Night time
        cycle = timeDecimal >= 18 
          ? (timeDecimal - 18) / 12 
          : (timeDecimal + 6) / 12;
      }
      
      setDayNightCycle(cycle);
      animationRef.current = requestAnimationFrame(updateCycle);
    };
    updateCycle();
  };

  const createWeatherParticles = (weatherType) => {
    // Creating weather particles
    
    // Clear existing particles first
    setWeatherParticles([]);
    
    let particles = [];
    let particleCount = 0;
    
    switch (weatherType) {
      case 'rainy':
        particleCount = 60;
        break;
      case 'stormy':
        particleCount = 80;
        break;
      case 'snowy':
        particleCount = 40;
        break;
      case 'cloudy':
        particleCount = 20;
        break;
      default: // sunny
        particleCount = 0;
    }
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: -5 - Math.random() * 10, // Start above screen
        speed: weatherType === 'stormy' ? Math.random() * 4 + 3 : Math.random() * 2 + 1,
        size: weatherType === 'stormy' ? Math.random() * 4 + 2 : Math.random() * 3 + 1,
        opacity: weatherType === 'stormy' ? Math.random() * 0.8 + 0.4 : Math.random() * 0.6 + 0.3,
        rotation: Math.random() * 360
      });
    }
    
    setWeatherParticles(particles);
    // Created weather particles
    
    // Animate particles continuously
    if (particleCount > 0) {
      const animateParticles = () => {
        setWeatherParticles(prev => {
          if (prev.length === 0) return prev; // Stop if cleared
          
          return prev.map(particle => {
            let newY = particle.y + particle.speed;
            let newX = particle.x;
            
            // Add wind effect for stormy weather
            if (weatherType === 'stormy') {
              newX = particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 1.5;
            } else if (weatherType === 'rainy') {
              newX = particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 0.5;
            }
            
            // Reset particle when it goes off screen
            if (newY > 105) {
              newY = -5;
              newX = Math.random() * 100;
            }
            
            return {
              ...particle,
              x: newX,
              y: newY,
              rotation: particle.rotation + 2
            };
          });
        });
        
        // Continue animation
        setTimeout(() => requestAnimationFrame(animateParticles), 50);
      };
      
      animateParticles();
    }
  };

  const performTreeAction = async (treeId, actionType, waterType = 'normal') => {
    try {
      let result;
      
      switch (actionType) {
        case 'water':
          result = await api.waterTree(treeId, waterType);
          break;
        case 'prune':
          result = await api.pruneTree(treeId);
          break;
        case 'fertilize':
          result = await api.fertilizeTree(treeId);
          break;
        default:
          throw new Error('Invalid action type');
      }
      
      if (result.success) {
        // Update local tree state
        setTrees(prev => prev.map(tree => {
          if (tree.id === treeId) {
            const updated = { ...tree };
            
            if (actionType === 'water') {
              updated.size = Math.min(updated.size + 1, 20);
              updated.streak = updated.streak + 1;
              updated.lastWatered = new Date().toISOString();
            } else if (actionType === 'prune') {
              updated.health = Math.min(updated.health + 0.2, 10);
              updated.lastPruned = new Date().toISOString();
            } else if (actionType === 'fertilize') {
              updated.sizeMultiplier = (updated.sizeMultiplier || 1) + 0.3;
              updated.lastFertilized = new Date().toISOString();
            }
            
            return updated;
          }
          return tree;
        }));
        
        // Update forest data
        if (forestData?.layout) {
          setForestData(prev => ({
            ...prev,
            layout: {
              ...prev.layout,
              total_points: prev.layout.total_points + result.points_earned
            }
          }));
        }
        
        // Show reward animation
        setRewardMessage(result.message || `+${result.points_earned} points!`);
        setShowRewards(true);
        setTimeout(() => setShowRewards(false), 3000);
        
        // Close care menu
        setShowCareMenu(null);
        
        // Refresh forest data to get any new creatures or effects
        setTimeout(() => fetchForestData(), 1000);
      }
      
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      setRewardMessage(error.response?.data?.error || `Failed to ${actionType} tree`);
      setShowRewards(true);
      setTimeout(() => setShowRewards(false), 3000);
    }
  };

  const handleTreeDragStart = (tree, event) => {
    setIsDragging(true);
    setDraggedTree(tree);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleTreeDrop = async (event) => {
    event.preventDefault();
    
    if (!draggedTree || !forestRef.current) return;
    
    const rect = forestRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    try {
      await api.moveTree(draggedTree.id, x, y);
      
      // Update local tree position
      setTrees(prev => prev.map(tree => 
        tree.id === draggedTree.id 
          ? { ...tree, x, y }
          : tree
      ));
      
      setRewardMessage('Tree moved successfully!');
      setShowRewards(true);
      setTimeout(() => setShowRewards(false), 2000);
      
    } catch (error) {
      console.error('Error moving tree:', error);
    } finally {
      setIsDragging(false);
      setDraggedTree(null);
    }
  };

  const changeWeather = async (weatherType) => {
    try {
      // Update weather immediately for visual feedback (even if API fails)
      const newWeatherData = {
        weather_type: weatherType,
        intensity: 1.0,
        duration: 3600 // 1 hour
      };
      
      setForestData(prev => ({
        ...prev,
        layout: {
          ...prev.layout,
          weather_state: weatherType
        },
        current_weather: newWeatherData
      }));
      
      // Create weather particles immediately
      createWeatherParticles(weatherType);
      setShowWeatherMenu(false);
      
      // Try to update backend
      try {
        const result = await api.changeWeather(weatherType);
        if (result.success) {
          setRewardMessage(result.message || `Weather changed to ${weatherType}!`);
        }
      } catch (apiError) {
        // Weather API not available, using visual-only mode
        setRewardMessage(`Weather changed to ${weatherType}! (Visual mode)`);
      }
      
      setShowRewards(true);
      setTimeout(() => setShowRewards(false), 2000);
      
    } catch (error) {
      console.error('Error changing weather:', error);
      setRewardMessage('Failed to change weather');
      setShowRewards(true);
      setTimeout(() => setShowRewards(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="forest-game-container">
        <div className="forest-loading">
          <div className="loading-animation">
            <div className="tree-loading">🌱</div>
            <p>Growing your forest...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forest-game-container">
      {/* Header */}
      <div className="forest-header">
        <div className="forest-stats">
          <div className="stat-item">
            <span className="stat-emoji">🌲</span>
            <div className="stat-content">
              <div className="stat-number">Level {forestData?.layout?.forest_level || 1}</div>
              <div className="stat-label">Forest Level</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-emoji">⭐</span>
            <div className="stat-content">
              <div className="stat-number">{forestData?.layout?.total_points || 0}</div>
              <div className="stat-label">Growth Points</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-emoji">🌳</span>
            <div className="stat-content">
              <div className="stat-number">{trees.length}</div>
              <div className="stat-label">Trees Planted</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-emoji">🌤️</span>
            <div className="stat-content">
              <div className="stat-number">{forestData?.current_weather?.weather_type || 'Sunny'}</div>
              <div className="stat-label">Weather</div>
            </div>
          </div>
        </div>
        
        <div className="forest-info">
          <h1>🌲 Your Personal Forest 🌲</h1>
          <p>Care for your trees with watering, pruning, and fertilizing. Drag to move them around!</p>
        </div>

        {/* Forest Controls */}
        <div className="forest-controls">
          <button 
            className="control-btn weather-btn-modern"
            onClick={() => setShowWeatherMenu(!showWeatherMenu)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.74 5.47c-.18-.38-.73-.38-.91 0l-1.26 2.68-2.74.39c-.44.06-.61.6-.28.91l1.98 1.97-.47 2.91c-.08.42.37.75.75.55L12 13.47l2.49 1.41c.38.2.83-.13.75-.55l-.47-2.91 1.98-1.97c.33-.31.16-.85-.28-.91l-2.74-.39-1.26-2.68z"/>
            </svg>
            Weather Control
          </button>
          <button 
            className="control-btn refresh-btn-modern"
            onClick={fetchForestData}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4V2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.57 0 3.04-.34 4.39-.94l-1.39-1.39C14.5 19.85 13.28 20 12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8v2l4-3-4-3z"/>
            </svg>
            Refresh Forest
          </button>
          {forestData?.daily_challenge && !forestData.daily_challenge.completed && (
            <div className="daily-challenge">
              <span className="challenge-icon">🎯</span>
              <span className="challenge-text">{forestData.daily_challenge.challenge.title}</span>
              <span className="challenge-progress">
                {forestData.daily_challenge.progress}/{forestData.daily_challenge.challenge.target_value}
              </span>
            </div>
          )}
        </div>

        {/* Weather Menu */}
        {showWeatherMenu && (
          <div className="weather-menu-overlay" onClick={() => setShowWeatherMenu(false)}>
            <div className="weather-menu" onClick={(e) => e.stopPropagation()}>
              <h3>🌤️ Weather Control Center</h3>
              <p>Choose the weather for your forest</p>
              <div className="weather-options">
                {['sunny', 'cloudy', 'rainy', 'stormy'].map(weather => (
                  <button
                    key={weather}
                    className="weather-btn"
                    onClick={() => changeWeather(weather)}
                  >
                    {weather === 'sunny' && '☀️'}
                    {weather === 'cloudy' && '☁️'}
                    {weather === 'rainy' && '🌧️'}
                    {weather === 'stormy' && '⛈️'}
                    <span>{weather.charAt(0).toUpperCase() + weather.slice(1)}</span>
                  </button>
                ))}
              </div>
              <button 
                className="close-menu-btn"
                onClick={() => setShowWeatherMenu(false)}
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Forest Background */}
      <div 
        className="forest-background"
        ref={forestRef}
        onDrop={handleTreeDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          filter: `brightness(${1 - dayNightCycle * 0.6})`,
        }}
      >
        <div className="sky">
          <div 
            className={`sun ${dayNightCycle > 0.5 ? 'moon' : ''}`}
            style={{
              opacity: dayNightCycle > 0.5 ? 0.8 : 1,
              background: dayNightCycle > 0.5 ? '#f0f0f0' : '#FFD700',
            }}
          ></div>
          <div className="clouds">
            <div className="cloud cloud1">☁️</div>
            <div className="cloud cloud2">☁️</div>
            <div className="cloud cloud3">☁️</div>
          </div>
          
          {/* Weather Particles */}
          {weatherParticles.map(particle => (
            <div
              key={particle.id}
              className="weather-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                fontSize: `${particle.size}px`,
                opacity: particle.opacity,
                transform: `rotate(${particle.rotation}deg)`,
              }}
            >
              {forestData?.current_weather?.weather_type === 'rainy' && '💧'}
              {forestData?.current_weather?.weather_type === 'stormy' && '⚡'}
              {forestData?.current_weather?.weather_type === 'snowy' && '❄️'}
              {forestData?.current_weather?.weather_type === 'cloudy' && '☁️'}
            </div>
          ))}
          
          {/* Sky Color Overlay for Weather Effects */}
          {forestData?.current_weather?.weather_type && (
            <div 
              className="weather-overlay"
              style={{
                background: 
                  forestData.current_weather.weather_type === 'stormy' ? 'rgba(30, 30, 60, 0.4)' :
                  forestData.current_weather.weather_type === 'rainy' ? 'rgba(100, 100, 120, 0.3)' :
                  forestData.current_weather.weather_type === 'cloudy' ? 'rgba(150, 150, 150, 0.2)' :
                  'transparent'
              }}
            />
          )}
        </div>
        
        {/* Ground */}
        <div className="ground">
          {/* Trees */}
          {trees.map((tree) => (
            <div
              key={tree.id}
              className={`tree-container ${tree.isDiseased ? 'diseased' : ''} ${tree.growthStage}`}
              draggable
              onDragStart={(e) => handleTreeDragStart(tree, e)}
              style={{
                left: `${tree.x}%`,
                top: `${tree.y}%`,
                transform: `scale(${(0.5 + tree.size * 0.05) * (tree.sizeMultiplier || 1)})`,
                filter: tree.health > 8 ? 'brightness(1.2)' : tree.health < 3 ? 'brightness(0.8)' : 'none'
              }}
              onClick={() => setSelectedTree(tree)}
            >
              <div className="tree" style={{ color: tree.type.color }}>
                <div 
                  className="tree-emoji" 
                  style={{ 
                    fontSize: `${20 + tree.size * 2}px`,
                    filter: tree.isDiseased ? 'saturate(0.3)' : 'none'
                  }}
                >
                  {tree.type.emoji}
                </div>
                <div className="tree-trunk">🟫</div>
                
                {/* Status Indicators */}
                {tree.streak > 0 && (
                  <div className="streak-badge">
                    🔥{tree.streak}
                  </div>
                )}
                {tree.health > 8 && (
                  <div className="health-indicator healthy">💚</div>
                )}
                {tree.isDiseased && (
                  <div className="health-indicator diseased">🤒</div>
                )}
                {tree.lastFertilized && new Date(tree.lastFertilized) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                  <div className="fertilized-indicator">✨</div>
                )}
              </div>
              
              <div className="tree-label">{tree.habitName}</div>
              
              {/* Enhanced Care Buttons */}
              <div className="tree-actions">
                <button
                  className="care-button primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCareMenu(showCareMenu === tree.id ? null : tree.id);
                  }}
                >
                  🌿 Care
                </button>
                
                {/* Care Menu */}
                {showCareMenu === tree.id && (
                  <div className="care-menu">
                    <div className="care-options">
                      <button
                        className="care-option water"
                        onClick={(e) => {
                          e.stopPropagation();
                          performTreeAction(tree.id, 'water', 'normal');
                        }}
                      >
                        💧 Water (10pts)
                      </button>
                      <button
                        className="care-option water-heavy"
                        onClick={(e) => {
                          e.stopPropagation();
                          performTreeAction(tree.id, 'water', 'heavy');
                        }}
                      >
                        🌊 Heavy Water (15pts)
                      </button>
                      <button
                        className="care-option prune"
                        onClick={(e) => {
                          e.stopPropagation();
                          performTreeAction(tree.id, 'prune');
                        }}
                        disabled={tree.lastPruned && new Date(tree.lastPruned) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                      >
                        ✂️ Prune (25pts)
                      </button>
                      <button
                        className="care-option fertilize"
                        onClick={(e) => {
                          e.stopPropagation();
                          performTreeAction(tree.id, 'fertilize');
                        }}
                        disabled={tree.lastFertilized && new Date(tree.lastFertilized) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                      >
                        🌱 Fertilize (50pts)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Forest Creatures */}
          {creatures.map((creature) => (
            <div
              key={creature.id}
              className={`forest-creature ${creature.creature_type}`}
              style={{
                left: `${creature.tree_position?.x || 0}%`,
                top: `${creature.tree_position?.y || 0}%`,
                transform: `translate(${creature.x_offset}px, ${creature.y_offset}px)`,
                animation: `${creature.animation_state} 2s infinite`
              }}
            >
              {creature.creature_type === 'rabbit' && '🐰'}
              {creature.creature_type === 'bird' && '🐦'}
              {creature.creature_type === 'butterfly' && '🦋'}
              {creature.creature_type === 'squirrel' && '🐿️'}
            </div>
          ))}
          
          {/* Empty State */}
          {trees.length === 0 && (
            <div className="empty-forest">
              <div className="empty-forest-content">
                <div className="empty-emoji">🌱</div>
                <h3>Your forest is waiting to grow!</h3>
                <p>Create habits to plant your first trees</p>
                <a href="/habits" className="btn btn-primary btn-lg">
                  Plant Your First Tree
                </a>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Enhanced Reward Animation */}
      {showRewards && (
        <div className="reward-animation">
          <div className="reward-text">{rewardMessage || '+10 Points! 🌟'}</div>
          <div className="falling-leaves">
            <div className="leaf">🍃</div>
            <div className="leaf">🍃</div>
            <div className="leaf">🍃</div>
            <div className="leaf">✨</div>
            <div className="leaf">💚</div>
          </div>
        </div>
      )}

      {/* Enhanced Tree Modal */}
      {selectedTree && (
        <div className="modal-overlay" onClick={() => setSelectedTree(null)}>
          <div className="tree-modal enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="tree-modal-header">
              <h3>{selectedTree.type.emoji} {selectedTree.habitName}</h3>
              <button 
                className="close-button"
                onClick={() => setSelectedTree(null)}
              >
                ✕
              </button>
            </div>
            <div className="tree-modal-content">
              <div className="tree-stats-enhanced">
                <div className="stat-row">
                  <div className="tree-stat">
                    <span className="stat-icon">🔥</span>
                    <span className="stat-label">Streak</span>
                    <span className="stat-value">{selectedTree.streak} days</span>
                  </div>
                  <div className="tree-stat">
                    <span className="stat-icon">📏</span>
                    <span className="stat-label">Size</span>
                    <span className="stat-value">{selectedTree.size}/20</span>
                  </div>
                </div>
                
                <div className="stat-row">
                  <div className="tree-stat">
                    <span className="stat-icon">💪</span>
                    <span className="stat-label">Health</span>
                    <span className="stat-value">{Math.round(selectedTree.health)}/10</span>
                  </div>
                  <div className="tree-stat">
                    <span className="stat-icon">🌱</span>
                    <span className="stat-label">Stage</span>
                    <span className="stat-value">{selectedTree.growthStage || 'sapling'}</span>
                  </div>
                </div>

                {/* Care History */}
                <div className="care-history">
                  <h4>Care History</h4>
                  <div className="care-timeline">
                    {selectedTree.lastWatered && (
                      <div className="care-item">
                        <span className="care-icon">💧</span>
                        <span>Last watered: {new Date(selectedTree.lastWatered).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedTree.lastPruned && (
                      <div className="care-item">
                        <span className="care-icon">✂️</span>
                        <span>Last pruned: {new Date(selectedTree.lastPruned).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedTree.lastFertilized && (
                      <div className="care-item">
                        <span className="care-icon">🌱</span>
                        <span>Last fertilized: {new Date(selectedTree.lastFertilized).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="tree-actions-modal">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    performTreeAction(selectedTree.id, 'water', 'normal');
                    setSelectedTree(null);
                  }}
                >
                  💧 Water Tree
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    performTreeAction(selectedTree.id, 'prune');
                    setSelectedTree(null);
                  }}
                  disabled={selectedTree.lastPruned && new Date(selectedTree.lastPruned) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                >
                  ✂️ Prune Tree
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    performTreeAction(selectedTree.id, 'fertilize');
                    setSelectedTree(null);
                  }}
                  disabled={selectedTree.lastFertilized && new Date(selectedTree.lastFertilized) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                >
                  🌱 Fertilize Tree
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .forest-game-container {
          min-height: 100vh;
          background: linear-gradient(to bottom, #87ceeb 0%, #87ceeb 40%, #90EE90 40%, #228B22 100%);
          padding: var(--space-6);
          position: relative;
          overflow-x: auto;
        }

        .forest-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
        }

        .loading-animation {
          color: var(--forest-700);
        }

        .tree-loading {
          font-size: 3rem;
          animation: grow 2s ease-in-out infinite;
        }

        @keyframes grow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .forest-header {
          background: rgba(255, 255, 255, 0.9);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          margin-bottom: var(--space-8);
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow-lg);
        }

        .forest-stats {
          display: flex;
          gap: var(--space-6);
          margin-bottom: var(--space-4);
          justify-content: center;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: rgba(255, 255, 255, 0.8);
          padding: var(--space-4);
          border-radius: var(--radius-xl);
          min-width: 140px;
        }

        .stat-emoji {
          font-size: var(--text-3xl);
        }

        .stat-number {
          font-size: var(--text-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--forest-700);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .forest-info {
          text-align: center;
        }

        .forest-info h1 {
          font-size: var(--text-4xl);
          margin-bottom: var(--space-2);
          color: var(--forest-800);
        }

        .forest-info p {
          font-size: var(--text-lg);
          color: var(--forest-600);
        }

        .forest-controls {
          display: flex;
          gap: var(--space-4);
          align-items: center;
          justify-content: center;
          margin-top: var(--space-4);
          flex-wrap: wrap;
          position: relative;
          z-index: 100;
        }

        .control-btn {
          background: var(--blue-500);
          color: white;
          border: none;
          padding: var(--space-3) var(--space-5);
          border-radius: var(--radius-lg);
          cursor: pointer;
          font-size: var(--text-base);
          font-weight: var(--font-weight-medium);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          box-shadow: var(--shadow-md);
        }

        .control-btn:hover {
          background: var(--blue-600);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .weather-btn-modern {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .weather-btn-modern:hover {
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }

        .refresh-btn-modern {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
        }

        .refresh-btn-modern:hover {
          background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
        }

        .control-btn svg {
          width: 20px;
          height: 20px;
        }

        .daily-challenge {
          background: linear-gradient(45deg, #ffd700, #ffed4a);
          color: var(--text-primary);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-weight: var(--font-weight-medium);
          box-shadow: var(--shadow-md);
        }

        .challenge-progress {
          background: rgba(255, 255, 255, 0.3);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-base);
          font-size: var(--text-xs);
        }

        .weather-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .weather-menu {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.95);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 10000;
          min-width: 350px;
          border: 3px solid var(--blue-500);
          backdrop-filter: blur(15px);
        }

        .weather-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-2);
          margin: var(--space-4) 0;
        }

        .weather-btn {
          background: linear-gradient(135deg, var(--stone-100), var(--stone-200));
          border: 2px solid var(--stone-300);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          font-weight: var(--font-weight-medium);
          box-shadow: var(--shadow-md);
        }

        .weather-btn:hover {
          background: linear-gradient(135deg, var(--blue-100), var(--blue-200));
          border-color: var(--blue-400);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .weather-btn span {
          font-size: var(--text-sm);
          color: var(--text-primary);
        }

        .close-menu-btn {
          width: 100%;
          background: var(--red-500);
          color: white;
          border: none;
          padding: var(--space-2);
          border-radius: var(--radius-lg);
          cursor: pointer;
        }

        .forest-background {
          position: relative;
          min-height: 600px;
          border-radius: var(--radius-2xl);
          overflow: hidden;
          background: linear-gradient(to bottom, 
            #87ceeb 0%, 
            #b0e0e6 30%, 
            #90EE90 50%, 
            #228B22 100%);
        }

        .sky {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 200px;
        }

        .sun {
          position: absolute;
          top: 20px;
          right: 40px;
          width: 60px;
          height: 60px;
          background: #FFD700;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
          animation: sunGlow 4s ease-in-out infinite alternate;
        }

        @keyframes sunGlow {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }

        .clouds {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
        }

        .cloud {
          position: absolute;
          font-size: 2rem;
          animation: float 6s ease-in-out infinite;
        }

        .cloud1 { top: 30px; left: 20%; animation-delay: 0s; }
        .cloud2 { top: 60px; left: 60%; animation-delay: 2s; }
        .cloud3 { top: 40px; left: 80%; animation-delay: 4s; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .ground {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          top: 200px;
          background: linear-gradient(to bottom, #90EE90, #228B22);
        }

        .weather-particle {
          position: absolute;
          pointer-events: none;
          z-index: 10;
          animation: fall linear infinite;
        }

        .weather-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 5;
          transition: background 1s ease;
        }

        @keyframes fall {
          0% { transform: translateY(-10px); }
          100% { transform: translateY(10px); }
        }

        .tree-container {
          position: absolute;
          cursor: pointer;
          transition: transform 0.3s ease;
          text-align: center;
          user-select: none;
        }

        .tree-container:hover {
          transform: scale(1.1) !important;
        }

        .tree-container.diseased {
          filter: sepia(0.3) hue-rotate(-30deg);
        }

        .tree-container.ancient .tree-emoji {
          font-size: 1.5em !important;
          filter: drop-shadow(0 0 10px gold);
        }

        .forest-creature {
          position: absolute;
          pointer-events: none;
          z-index: 20;
          font-size: 1.2rem;
        }

        .forest-creature.rabbit {
          animation: hop 3s infinite ease-in-out;
        }

        .forest-creature.bird {
          animation: fly 4s infinite linear;
        }

        .forest-creature.butterfly {
          animation: flutter 2s infinite ease-in-out;
        }

        .forest-creature.squirrel {
          animation: scurry 3s infinite ease-in-out;
        }

        @keyframes hop {
          0%, 50%, 100% { transform: translateY(0); }
          25% { transform: translateY(-10px); }
        }

        @keyframes fly {
          0% { transform: translateX(-20px) translateY(0); }
          50% { transform: translateX(0) translateY(-15px); }
          100% { transform: translateX(20px) translateY(0); }
        }

        @keyframes flutter {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }

        @keyframes scurry {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(15px); }
        }

        .tree {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .tree-emoji {
          transition: all 0.3s ease;
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
        }

        .tree-trunk {
          font-size: 1rem;
          margin-top: -5px;
        }

        .streak-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #ff4444;
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: bold;
        }

        .tree-label {
          margin-top: var(--space-2);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
          color: var(--forest-800);
          background: rgba(255, 255, 255, 0.8);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-base);
          max-width: 100px;
          word-wrap: break-word;
        }

        .health-indicator {
          position: absolute;
          top: -15px;
          left: -15px;
          font-size: 0.8rem;
          animation: pulse 2s infinite;
        }

        .fertilized-indicator {
          position: absolute;
          top: -20px;
          right: -20px;
          font-size: 0.8rem;
          animation: sparkle 3s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0.5; transform: rotate(0deg); }
          50% { opacity: 1; transform: rotate(180deg); }
        }

        .tree-actions {
          margin-top: var(--space-2);
          position: relative;
        }

        .care-button {
          background: var(--green-500);
          color: white;
          border: none;
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-lg);
          font-size: var(--text-xs);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .care-button:hover {
          background: var(--green-600);
          transform: scale(1.05);
        }

        .care-menu {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
          padding: var(--space-2);
          box-shadow: var(--shadow-xl);
          z-index: 50;
          margin-bottom: var(--space-2);
        }

        .care-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          min-width: 150px;
        }

        .care-option {
          background: var(--stone-100);
          border: none;
          padding: var(--space-2);
          border-radius: var(--radius-base);
          cursor: pointer;
          font-size: var(--text-xs);
          transition: all 0.2s ease;
          text-align: left;
        }

        .care-option:hover:not(:disabled) {
          background: var(--stone-200);
          transform: translateX(2px);
        }

        .care-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .care-option.water {
          border-left: 3px solid var(--blue-500);
        }

        .care-option.water-heavy {
          border-left: 3px solid var(--blue-700);
        }

        .care-option.prune {
          border-left: 3px solid var(--orange-500);
        }

        .care-option.fertilize {
          border-left: 3px solid var(--green-500);
        }

        .empty-forest {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }

        .empty-forest-content {
          background: rgba(255, 255, 255, 0.9);
          padding: var(--space-8);
          border-radius: var(--radius-2xl);
        }

        .empty-emoji {
          font-size: 4rem;
          margin-bottom: var(--space-4);
        }

        .tree-modal {
          background: var(--bg-surface);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          max-width: 500px;
          width: 90%;
        }

        .tree-modal.enhanced {
          max-width: 600px;
        }

        .tree-stats-enhanced {
          margin-bottom: var(--space-6);
        }

        .stat-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
          margin-bottom: var(--space-4);
        }

        .tree-stat {
          background: var(--stone-50);
          padding: var(--space-3);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .stat-icon {
          font-size: 1.2rem;
        }

        .stat-label {
          flex: 1;
          font-weight: var(--font-weight-medium);
          color: var(--text-secondary);
        }

        .stat-value {
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
        }

        .care-history {
          margin-top: var(--space-4);
          padding: var(--space-4);
          background: var(--stone-50);
          border-radius: var(--radius-lg);
        }

        .care-history h4 {
          margin: 0 0 var(--space-3) 0;
          color: var(--text-primary);
        }

        .care-timeline {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .care-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          background: white;
          border-radius: var(--radius-base);
          font-size: var(--text-sm);
        }

        .care-icon {
          font-size: 1rem;
        }

        .tree-actions-modal {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
          justify-content: center;
        }

        .tree-actions-modal .btn {
          flex: 1;
          min-width: 120px;
        }

        .tree-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }

        .close-button {
          background: none;
          border: none;
          font-size: var(--text-xl);
          cursor: pointer;
          color: var(--text-secondary);
        }

        .tree-stats {
          margin-bottom: var(--space-6);
        }

        .tree-stat {
          padding: var(--space-3);
          background: var(--stone-100);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-2);
        }

        .reward-animation {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          pointer-events: none;
        }

        .reward-text {
          font-size: var(--text-2xl);
          font-weight: var(--font-weight-bold);
          color: #FFD700;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          animation: bounceIn 0.5s ease-out;
        }

        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .falling-leaves {
          position: absolute;
          top: -20px;
          left: 0;
          right: 0;
        }

        .leaf {
          position: absolute;
          animation: fall 2s ease-in-out;
        }

        .leaf:nth-child(1) { left: -20px; animation-delay: 0.2s; }
        .leaf:nth-child(2) { left: 0px; animation-delay: 0.5s; }
        .leaf:nth-child(3) { left: 20px; animation-delay: 0.8s; }

        @keyframes fall {
          0% { 
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% { 
            transform: translateY(100px) rotate(360deg);
            opacity: 0;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .forest-game-container {
            padding: var(--space-4);
          }

          .forest-stats {
            flex-direction: column;
            align-items: center;
          }

          .stat-item {
            width: 100%;
            max-width: 200px;
          }

          .forest-info h1 {
            font-size: var(--text-3xl);
          }

          .tree-container {
            transform: scale(0.8) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ForestGame;