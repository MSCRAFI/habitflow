// Imports: React -> third-party -> local contexts/components -> styles
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Intentionally avoid importing global index.css here to prevent style conflicts

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-premium">
      {/* Navigation is handled by PremiumNavbar in App.js - no need for duplicate */}

      {/* Hero Section */}
      <section className="hero-premium">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge animate-fade-in">
              <span>✨</span>
              <span>Science-backed habit formation</span>
            </div>

            <h1 className="hero-title">
              Build <span className="hero-gradient-text">Life-Changing Habits</span><br />
              Through Elegant Design
            </h1>

            <p className="hero-subtitle">
              Transform your life one atomic habit at a time. Our premium habit tracker combines 
              beautiful design with proven psychology to help you build lasting routines.
            </p>

            <div className="hero-cta">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    <span>Start Building Habits</span>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  <span>Go to Dashboard</span>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              )}
            </div>

            <div className="hero-features">
              <div className="hero-feature">
                <svg className="hero-feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="hero-feature">
                <svg className="hero-feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Privacy-focused</span>
              </div>
              <div className="hero-feature">
                <svg className="hero-feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Instant setup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Habit Cards Demo */}
        <div className="hero-demo" style={{
          position: 'absolute',
          right: '5%',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          display: 'none'
        }}>
          <div className="habit-card-premium animate-scale-in" style={{
            width: '280px',
            marginBottom: '1rem',
            animationDelay: '0.2s'
          }}>
            <div className="habit-card-header">
              <div className="habit-icon">💧</div>
            </div>
            <h3 className="habit-title">Drink Water</h3>
            <p className="habit-description">Stay hydrated throughout the day</p>
            <div className="habit-progress">
              <div className="habit-progress-bar">
                <div className="habit-progress-fill" style={{width: '75%'}}></div>
              </div>
              <div className="habit-progress-text">6/8 glasses completed</div>
            </div>
            <div className="habit-stats">
              <div className="habit-streak">
                <span className="streak-flame">🔥</span>
                <span>12 day streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Show demo on larger screens */}
        <style jsx>{`
          @media (min-width: 1024px) {
            .hero-demo {
              display: block !important;
            }
          }
        `}</style>
      </section>

      {/* Features Section */}
      <section id="features" className="section" style={{background: 'var(--bg-secondary)'}}>
        <div className="container">
          <div style={{textAlign: 'center', marginBottom: 'var(--space-16)'}}>
            <h2 className="text-4xl font-bold text-primary">
              Everything you need to build <span className="hero-gradient-text">lasting habits</span>
            </h2>
            <p className="text-xl text-secondary" style={{marginTop: 'var(--space-4)', maxWidth: '600px', margin: '0 auto'}}>
              Powerful features designed with attention to detail and user experience
            </p>
          </div>

          <div className="dashboard-grid">
            {[
              {
                icon: '📊',
                title: 'Beautiful Analytics',
                description: 'Visualize your progress with stunning charts and insights that motivate you to keep going.'
              },
              {
                icon: '🎯',
                title: 'Smart Goals',
                description: 'Set meaningful goals and let our AI help you break them down into achievable daily habits.'
              },
              {
                icon: '🔥',
                title: 'Streak Tracking',
                description: 'Build momentum with streak tracking that celebrates your consistency and progress.'
              },
              {
                icon: '🏆',
                title: 'Achievement System',
                description: 'Earn badges and unlock rewards as you hit milestones in your habit-building journey.'
              },
              {
                icon: '📱',
                title: 'Cross-Platform',
                description: 'Beautiful responsive design that works perfectly on mobile, tablet, and desktop.'
              },
              {
                icon: '🔔',
                title: 'Smart Reminders',
                description: 'Intelligent notifications that help you stay on track without being overwhelming.'
              }
            ].map((feature, index) => (
              <div key={index} className="card card-premium animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="stats-icon" style={{fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)'}}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary" style={{marginBottom: 'var(--space-2)'}}>
                  {feature.title}
                </h3>
                <p className="text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section">
        <div className="container">
          <div className="dashboard-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
            {[
              { value: '50K+', label: 'Happy Users' },
              { value: '1M+', label: 'Habits Tracked' },
              { value: '95%', label: 'Success Rate' },
              { value: '4.9★', label: 'User Rating' }
            ].map((stat, index) => (
              <div key={index} className="stats-card-premium animate-scale-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="stats-value">{stat.value}</div>
                <div className="stats-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section" style={{background: 'var(--bg-secondary)'}}>
        <div className="container">
          <div style={{textAlign: 'center', marginBottom: 'var(--space-16)'}}>
            <h2 className="text-4xl font-bold text-primary">
              Loved by thousands of users
            </h2>
            <p className="text-xl text-secondary" style={{marginTop: 'var(--space-4)'}}>
              See what our community has to say about HabitFlow
            </p>
          </div>

          <div className="dashboard-grid">
            {[
              {
                name: 'Sarah Chen',
                role: 'Product Designer',
                avatar: 'S',
                content: 'HabitFlow has completely transformed my daily routine. The design is absolutely beautiful and the tracking features are incredibly intuitive.'
              },
              {
                name: 'Marcus Johnson',
                role: 'Entrepreneur',
                avatar: 'M',
                content: 'I\'ve tried many habit trackers, but HabitFlow is in a league of its own. The progress visualization keeps me motivated every day.'
              },
              {
                name: 'Emily Rodriguez',
                role: 'Software Engineer',
                avatar: 'E',
                content: 'The atomic habits approach built into HabitFlow made building new habits feel effortless. I\'ve maintained my routine for 8 months now!'
              }
            ].map((testimonial, index) => (
              <div key={index} className="card animate-fade-in" style={{
                padding: 'var(--space-6)',
                animationDelay: `${index * 0.1}s`
              }}>
                <p className="text-base text-secondary" style={{
                  marginBottom: 'var(--space-4)',
                  fontStyle: 'italic',
                  lineHeight: 'var(--leading-relaxed)'
                }}>
                  "{testimonial.content}"
                </p>
                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-3)'}}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'var(--font-weight-bold)'
                  }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-primary">{testimonial.name}</div>
                    <div className="text-sm text-secondary">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div style={{
            textAlign: 'center',
            background: 'var(--gradient-hero)',
            padding: 'var(--space-16)',
            borderRadius: 'var(--radius-3xl)',
            border: '1px solid var(--color-gray-200)'
          }}>
            <h2 className="text-4xl font-bold text-primary" style={{marginBottom: 'var(--space-4)'}}>
              Ready to transform your life?
            </h2>
            <p className="text-xl text-secondary" style={{
              marginBottom: 'var(--space-8)',
              maxWidth: '600px',
              margin: '0 auto var(--space-8)'
            }}>
              Join thousands of users who have already transformed their lives with HabitFlow. 
              Start building better habits today.
            </p>
            
            <div style={{display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap'}}>
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    <span>Start Free Today</span>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  <span>Go to Dashboard</span>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--space-8)',
              marginTop: 'var(--space-8)',
              flexWrap: 'wrap'
            }}>
              <div className="hero-feature">
                <svg className="hero-feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free forever</span>
              </div>
              <div className="hero-feature">
                <svg className="hero-feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Your data stays private</span>
              </div>
              <div className="hero-feature">
                <svg className="hero-feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Made with love</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--color-gray-200)',
        padding: 'var(--space-16) 0 var(--space-8)'
      }}>
        <div className="container">
          <div style={{textAlign: 'center'}}>
            <div className="footer-brand" style={{justifyContent: 'center', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)'}}>
              <span style={{marginRight: '0.5rem'}}>🌱</span>
              <span>HabitFlow</span>
            </div>
            <p className="text-secondary">
              Building better habits, one day at a time.
            </p>
            <div style={{
              marginTop: 'var(--space-8)',
              paddingTop: 'var(--space-8)',
              borderTop: '1px solid var(--color-gray-200)',
              color: 'var(--text-tertiary)',
              fontSize: 'var(--text-sm)'
            }}>
              © 2025 HabitFlow. Built with ❤️ for habit builders worldwide.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;