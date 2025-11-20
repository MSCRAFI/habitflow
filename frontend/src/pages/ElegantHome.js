// Import order: React -> third-party -> local hooks/components/styles
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ElegantHome = () => {
  const { user } = useAuth();

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <section className="hero-section" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.1"><circle cx="30" cy="30" r="4"/></g></svg>") repeat',
          animation: 'float 6s ease-in-out infinite'
        }} />

        <div className="container">
          <div className="text-center animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Hero Title */}
            <h1 style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'white',
              marginBottom: 'var(--space-xl)',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              lineHeight: '1.1'
            }}>
              <span className="animate-bounce" style={{ display: 'inline-block', marginRight: 'var(--space-md)' }}>🌱</span>
              HabitFlow
            </h1>
            
            {/* Hero Subtitle */}
            <p style={{
              fontSize: 'var(--font-size-xl)',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: 'var(--space-3xl)',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto var(--space-3xl)'
            }} className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Transform your daily routines into powerful habits that lead to lasting success. 
              Track, build, and maintain habits with our elegant platform.
            </p>

            {/* Hero CTAs */}
            <div className="flex gap-4 justify-center flex-wrap animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {user ? (
                <Link to="/dashboard" className="btn btn-xl" style={{
                  background: 'white',
                  color: 'var(--color-primary-700)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}>
                  <span>🚀</span>
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-xl" style={{
                    background: 'white',
                    color: 'var(--color-primary-700)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>
                    <span>✨</span>
                    Start Your Journey
                  </Link>
                  
                  <Link to="/login" className="btn btn-xl btn-ghost" style={{
                    background: 'transparent',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.8)'
                  }}>
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" style={{
        padding: 'var(--space-5xl) 0',
        background: 'var(--bg-primary)'
      }}>
        <div className="container">
          <div className="page-header">
            <h2 className="page-title animate-fade-in-up">
              Why Choose HabitFlow?
            </h2>
            <p className="page-subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Everything you need to build lasting habits and achieve your goals
            </p>
          </div>

          <div className="grid grid-3 stagger-animation" style={{ gap: 'var(--space-2xl)' }}>
            <div className="card card-elevated hover-lift">
              <div className="card-body text-center">
                <div className="stat-icon animate-float" style={{ animationDelay: '0s' }}>
                  <span style={{ fontSize: 'var(--font-size-2xl)' }}>📊</span>
                </div>
                <h3 className="card-title">Smart Tracking</h3>
                <p className="card-text">
                  Visualize your progress with beautiful charts and insights that motivate you to keep going every day.
                </p>
              </div>
            </div>

            <div className="card card-elevated hover-lift">
              <div className="card-body text-center">
                <div className="stat-icon animate-float" style={{ animationDelay: '0.5s' }}>
                  <span style={{ fontSize: 'var(--font-size-2xl)' }}>🔥</span>
                </div>
                <h3 className="card-title">Streak Building</h3>
                <p className="card-text">
                  Build momentum with streak tracking that encourages consistency and celebrates your daily wins.
                </p>
              </div>
            </div>

            <div className="card card-elevated hover-lift">
              <div className="card-body text-center">
                <div className="stat-icon animate-float" style={{ animationDelay: '1s' }}>
                  <span style={{ fontSize: 'var(--font-size-2xl)' }}>👥</span>
                </div>
                <h3 className="card-title">Social Community</h3>
                <p className="card-text">
                  Connect with others, join challenges, and stay motivated through community support and accountability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: 'var(--space-5xl) 0',
        background: 'var(--bg-secondary)'
      }}>
        <div className="container">
          <div className="grid grid-4 stagger-animation">
            <div className="stat-card">
              <div className="stat-value animate-pulse">10K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value animate-pulse">500K+</div>
              <div className="stat-label">Habits Tracked</div>
            </div>
            <div className="stat-card">
              <div className="stat-value animate-pulse">95%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-value animate-pulse">180</div>
              <div className="stat-label">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        padding: 'var(--space-5xl) 0',
        background: 'var(--bg-primary)'
      }}>
        <div className="container">
          <div className="page-header">
            <h2 className="page-title animate-fade-in-up">
              How It Works
            </h2>
            <p className="page-subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Simple steps to transform your daily routine
            </p>
          </div>

          <div className="grid grid-3 stagger-animation">
            <div className="text-center">
              <div className="stat-icon" style={{
                background: 'var(--color-primary)',
                color: 'white',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--space-lg)'
              }}>
                1
              </div>
              <h3 className="card-title">Set Your Goals</h3>
              <p className="card-text">
                Define the habits you want to build with our intuitive goal-setting tools.
              </p>
            </div>

            <div className="text-center">
              <div className="stat-icon" style={{
                background: 'var(--color-success)',
                color: 'white',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--space-lg)'
              }}>
                2
              </div>
              <h3 className="card-title">Track Progress</h3>
              <p className="card-text">
                Log your daily progress and watch your streaks grow with visual feedback.
              </p>
            </div>

            <div className="text-center">
              <div className="stat-icon" style={{
                background: 'var(--color-warning)',
                color: 'white',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--space-lg)'
              }}>
                3
              </div>
              <h3 className="card-title">Stay Motivated</h3>
              <p className="card-text">
                Celebrate achievements and stay accountable with our community features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section style={{
          padding: 'var(--space-5xl) 0',
          background: `linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))`,
          textAlign: 'center'
        }}>
          <div className="container">
            <div className="animate-fade-in-up">
              <h2 style={{
                fontSize: 'var(--font-size-4xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'white',
                marginBottom: 'var(--space-lg)'
              }}>
                Ready to Transform Your Life?
              </h2>
              <p style={{
                fontSize: 'var(--font-size-lg)',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: 'var(--space-3xl)',
                maxWidth: '500px',
                margin: '0 auto var(--space-3xl)'
              }}>
                Join thousands of people who are building better habits and achieving their goals with HabitFlow.
              </p>
              <Link to="/register" className="btn btn-xl" style={{
                background: 'white',
                color: 'var(--color-primary-700)',
                fontWeight: 'var(--font-weight-semibold)'
              }}>
                <span>🚀</span>
                Get Started Free
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ElegantHome;