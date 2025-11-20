import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NatureHome = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  // Trigger entrance animations once on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: '🌱',
      title: 'Plant Your Habits',
      description: 'Start small with micro-habits that grow into powerful routines. Every habit is a seed in your digital garden.',
      color: 'var(--color-primary-100)'
    },
    {
      icon: '🌿',
      title: 'Watch Them Flourish',
      description: 'Track your progress with beautiful visualizations. See your streaks bloom and your consistency create a thriving garden.',
      color: 'var(--color-earth-100)'
    },
    {
      icon: '🌳',
      title: 'Grow Together',
      description: 'Join challenges, share achievements, and learn from a community of fellow habit gardeners.',
      color: 'var(--color-sky-100)'
    },
    {
      icon: '🏆',
      title: 'Harvest Success',
      description: 'Earn badges, celebrate milestones, and transform your life one habit at a time.',
      color: 'var(--color-sunset-100)'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Wellness Coach',
      avatar: '🧘‍♀️',
      quote: 'HabitFlow made habit building feel natural and joyful. The garden metaphor really resonates with how personal growth actually works.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Entrepreneur',
      avatar: '👨‍💼',
      quote: 'Finally, a habit tracker that doesn\'t feel overwhelming. The nature theme keeps me motivated and the progress feels organic.',
      rating: 5
    },
    {
      name: 'Emma Thompson',
      role: 'Student',
      avatar: '👩‍🎓',
      quote: 'I love how my habits feel like they\'re growing into something beautiful. The micro-habits feature was a game-changer for me.',
      rating: 5
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Gardeners' },
    { number: '2M+', label: 'Habits Planted' },
    { number: '95%', label: 'Success Rate' },
    { number: '4.9★', label: 'User Rating' }
  ];

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <section className="hero-section" style={{ 
        background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-earth-50) 100%)',
        padding: 'var(--space-24) 0'
      }}>
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className={`animate-fade-in-up ${isVisible ? '' : 'opacity-0'}`}>
              <div className="text-6xl mb-6 animate-breathe">🌱</div>
              <h1 className="heading-1 text-6xl mb-6">
                Grow Your Best Self
                <br />
                <span className="text-primary-600">One Habit at a Time</span>
              </h1>
              <p className="body-large text-secondary mb-8 max-w-2xl mx-auto">
                Transform your life with HabitFlow's nature-inspired approach to habit building. 
                Plant small habits, nurture them daily, and watch your digital garden flourish.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg hover-grow">
                    🌱 Visit Your Garden
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg hover-grow">
                      🌱 Start Your Garden
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-lg hover-grow">
                      🏠 Welcome Back
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-surface">
        <div className="container">
          <div className="grid grid-4 gap-8 stagger-container">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="body-base text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-canvas">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">How Your Garden Grows</h2>
            <p className="body-large text-secondary max-w-2xl mx-auto">
              Our nature-inspired approach makes habit building feel natural, sustainable, and rewarding.
            </p>
          </div>
          
          <div className="grid grid-2 gap-8 grid-stagger">
            {features.map((feature, index) => (
              <div key={index} className="card card-nature hover-lift">
                <div className="card-body">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
                    style={{ background: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="heading-3 mb-4">{feature.title}</h3>
                  <p className="body-base text-secondary">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-surface">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Simple as Nature Itself</h2>
            <p className="body-large text-secondary max-w-2xl mx-auto">
              Building habits should feel natural. Follow these simple steps to grow your digital garden.
            </p>
          </div>

          <div className="grid grid-3 gap-8">
            <div className="text-center stagger-container">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-4xl mx-auto mb-6">
                🌰
              </div>
              <h3 className="heading-4 mb-4">1. Plant Seeds</h3>
              <p className="body-base text-secondary">
                Choose habits that align with your goals. Start with micro-habits for guaranteed success.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-earth-100 flex items-center justify-center text-4xl mx-auto mb-6">
                💧
              </div>
              <h3 className="heading-4 mb-4">2. Daily Nurturing</h3>
              <p className="body-base text-secondary">
                Water your habits with daily action. Even small steps count towards growth.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center text-4xl mx-auto mb-6">
                🌳
              </div>
              <h3 className="heading-4 mb-4">3. Watch Growth</h3>
              <p className="body-base text-secondary">
                Celebrate your progress as habits become second nature and transform your life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-canvas">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">What Gardeners Say</h2>
            <p className="body-large text-secondary max-w-2xl mx-auto">
              Join thousands of people who have transformed their lives with HabitFlow.
            </p>
          </div>

          <div className="grid grid-3 gap-8 stagger-container">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card hover-lift">
                <div className="card-body">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-primary">{testimonial.name}</div>
                      <div className="body-small text-tertiary">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="body-base text-secondary mb-4">"{testimonial.quote}"</p>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-earth-500">⭐</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24" style={{ 
        background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)' 
      }}>
        <div className="container">
          <div className="text-center text-white">
            <div className="text-5xl mb-6 animate-sway">🌱</div>
            <h2 className="heading-2 text-white mb-4">Ready to Start Growing?</h2>
            <p className="body-large mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of people who have transformed their lives with nature-inspired habit building. 
              Your garden awaits.
            </p>
            {user ? (
              <Link to="/dashboard" className="btn btn-secondary btn-lg hover-grow">
                🌱 Tend Your Garden
              </Link>
            ) : (
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/register" className="btn btn-secondary btn-lg hover-grow">
                  🌱 Plant Your First Habit
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg border-white text-white hover:bg-white hover:text-primary-600">
                  🏠 Welcome Back
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="page-footer">
        <div className="container">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-3xl">🌱</div>
              <div>
                <div className="text-xl font-bold text-primary">HabitFlow</div>
                <div className="caption text-tertiary">Your Digital Garden</div>
              </div>
            </div>
            <p className="body-small text-secondary">
              © 2025 HabitFlow. Made with 💚 for habit gardeners everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NatureHome;