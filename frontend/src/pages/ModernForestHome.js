import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import InteractiveLandingForest from '../components/InteractiveLandingForest';

const ModernForestHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  // Animate-in on mount and redirect authenticated users away from marketing page
  useEffect(() => {
    setIsVisible(true);
    
    // Redirect authenticated users to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      title: "Track Your Growth",
      description: "Build lasting habits with our intuitive tracking system. Watch your progress unfold like rings in a tree.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="24" cy="24" r="2" fill="currentColor"/>
        </svg>
      )
    },
    {
      title: "Habit Stacking",
      description: "Build powerful habit chains that grow naturally from your existing routines. Create sustainable change that lasts.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
          <path d="M8 12h8v8H8V12zm0 12h8v8H8v-8zm0 12h8v8H8v-8zm12-24h20v8H20V12zm0 12h20v8H20v-8zm0 12h20v8H20v-8z"/>
        </svg>
      )
    },
    {
      title: "Progress Analytics",
      description: "Gain insights into your habit patterns with beautiful, actionable analytics. See your forest of habits flourish.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
          <path d="M6 42V18l8-8 8 8 8-8 8 8v24H6zm8-18v12h4V24h-4zm8 12h4V20h-4v16zm8-8v8h4v-8h-4z"/>
        </svg>
      )
    },
    {
      title: "Community Support",
      description: "Join a thriving community of habit builders. Share achievements, get motivated, and grow together.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
          <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-4 30l-8-8 2.83-2.83L20 28.34l13.17-13.17L36 18l-16 16z"/>
        </svg>
      )
    }
  ];

  const testimonials = [
    {
      quote: "HabitFlow transformed how I approach personal growth. The forest metaphor makes building habits feel natural and sustainable.",
      author: "Sarah Chen",
      role: "Product Designer"
    },
    {
      quote: "The habit stacking feature helped me build a morning routine that actually stuck. I've never been more consistent.",
      author: "Marcus Rodriguez", 
      role: "Software Engineer"
    },
    {
      quote: "Beautiful design meets powerful functionality. This app makes habit tracking enjoyable rather than a chore.",
      author: "Dr. Emily Watson",
      role: "Behavioral Psychologist"
    }
  ];

  return (
    <div className="modern-forest-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Grow Your Habits,
                <span className="text-accent"> Cultivate Your Future</span>
              </h1>
              <p className="hero-subtitle">
                Transform your life one habit at a time with HabitFlow's 
                forest-inspired approach to personal growth. Build sustainable 
                routines that flourish like a thriving woodland.
              </p>
              
              {/* Statistics Cards */}
              <div className="hero-stats">
                <div className="stat-card">
                  <div className="stat-value">50K+</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">2M+</div>
                  <div className="stat-label">Habits Tracked</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">94%</div>
                  <div className="stat-label">Success Rate</div>
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Your Forest Journey
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Explore the Forest
                </Link>
              </div>
            </div>
            <div className="hero-visual">
              <InteractiveLandingForest key={Date.now()} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need to Grow</h2>
            <p className="section-subtitle">
              Powerful features designed to make habit building intuitive and sustainable
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card ${isVisible ? 'animate-in' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How Your Forest Grows</h2>
            <p className="section-subtitle">
              Simple steps to build habits that last a lifetime
            </p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Plant Your Seeds</h3>
                <p className="step-description">
                  Choose habits you want to build and set realistic, achievable goals. 
                  Start small and let them grow naturally.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Tend Daily</h3>
                <p className="step-description">
                  Track your progress with our intuitive interface. Each completion 
                  adds another ring to your growth tree.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Watch It Flourish</h3>
                <p className="step-description">
                  Watch your habit forest grow as consistency becomes second nature. 
                  Celebrate milestones and unlock achievements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Community Says</h2>
            <p className="section-subtitle">
              Real stories from people transforming their lives
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <blockquote className="testimonial-quote">
                  "{testimonial.quote}"
                </blockquote>
                <div className="testimonial-author">
                  <div className="author-name">{testimonial.author}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Grow Your Forest?</h2>
            <p className="cta-subtitle">
              Join thousands of people building better habits with HabitFlow. 
              Start your journey today.
            </p>
            <Link to="/register" className="btn btn-primary btn-xl">
              Start Growing Now
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* ===== MODERN FOREST HOME STYLES ===== */
        .modern-forest-home {
          min-height: 100vh;
        }

        /* ===== HERO SECTION ===== */
        .hero-section {
          background: linear-gradient(135deg, var(--forest-50) 0%, var(--wood-50) 100%);
          padding: var(--space-20) 0 var(--space-16);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="%23000" opacity="0.02"/><circle cx="80" cy="80" r="1" fill="%23000" opacity="0.02"/><circle cx="40" cy="60" r="1" fill="%23000" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          pointer-events: none;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-16);
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .hero-text {
          text-align: center;
        }

        .hero-title {
          font-size: var(--text-5xl);
          font-weight: var(--font-weight-bold);
          line-height: var(--leading-tight);
          color: var(--stone-900);
          margin: 0 0 var(--space-6) 0;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }

        .text-accent {
          color: var(--forest-600);
        }

        .hero-subtitle {
          font-size: var(--text-lg);
          line-height: var(--leading-relaxed);
          color: var(--stone-800);
          margin: 0 auto var(--space-8) auto;
          max-width: 600px;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
        }

        /* Statistics Cards */
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-6);
          margin: var(--space-8) 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .stat-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: var(--space-4) var(--space-3);
          text-align: center;
          transition: all var(--duration-300) var(--ease-out);
          box-shadow: var(--shadow-sm);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--forest-300);
        }

        .stat-value {
          font-size: var(--text-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--forest-700);
          line-height: 1;
          margin-bottom: var(--space-1);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--stone-700);
          font-weight: var(--font-weight-medium);
        }

        /* Call-to-Action Buttons */
        .hero-actions {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
          margin-top: var(--space-8);
          flex-wrap: wrap;
        }

        /* Hero Visual */
        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 600px;
          width: 100%;
        }

        /* ===== FEATURES SECTION ===== */
        .features-section {
          padding: var(--space-20) 0;
          background: var(--bg-primary);
        }

        .section-header {
          text-align: center;
          margin-bottom: var(--space-16);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .section-title {
          font-size: var(--text-4xl);
          font-weight: var(--font-weight-bold);
          color: var(--stone-900);
          margin: 0 0 var(--space-4) 0;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
        }

        .section-subtitle {
          font-size: var(--text-lg);
          color: var(--stone-700);
          line-height: var(--leading-relaxed);
          margin: 0;
          text-shadow: 0 1px 1px rgba(255, 255, 255, 0.4);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-8);
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          text-align: center;
          transition: all var(--duration-300) var(--ease-out);
          transform: translateY(20px);
          opacity: 0;
        }

        .feature-card.animate-in {
          transform: translateY(0);
          opacity: 1;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
          border-color: var(--forest-200);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          background: var(--gradient-canopy);
          border-radius: var(--radius-2xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--forest-600);
          margin: 0 auto var(--space-6);
        }

        .feature-title {
          font-size: var(--text-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--stone-900);
          margin: 0 0 var(--space-4) 0;
        }

        .feature-description {
          font-size: var(--text-base);
          color: var(--stone-700);
          line-height: var(--leading-relaxed);
          margin: 0;
        }

        /* ===== HOW IT WORKS SECTION ===== */
        .how-it-works-section {
          padding: var(--space-20) 0;
          background: var(--bg-primary);
          position: relative;
        }

        .how-it-works-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--gradient-canopy);
          opacity: 0.3;
          pointer-events: none;
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .step {
          display: flex;
          gap: var(--space-6);
          align-items: flex-start;
        }

        .step-number {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          background: var(--gradient-forest-primary);
          color: var(--text-inverse);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xl);
          font-weight: var(--font-weight-bold);
        }

        .step-content {
          flex: 1;
        }

        .step-title {
          font-size: var(--text-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--stone-900);
          margin: 0 0 var(--space-3) 0;
        }

        .step-description {
          font-size: var(--text-base);
          color: var(--stone-700);
          line-height: var(--leading-relaxed);
          margin: 0;
        }

        /* ===== TESTIMONIALS SECTION ===== */
        .testimonials-section {
          padding: var(--space-20) 0;
          background: var(--bg-primary);
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--space-8);
          max-width: 1200px;
          margin: 0 auto;
        }

        .testimonial-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          transition: all var(--duration-300) var(--ease-out);
        }

        .testimonial-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--forest-200);
        }

        .testimonial-quote {
          font-size: var(--text-lg);
          line-height: var(--leading-relaxed);
          color: var(--stone-800);
          font-style: italic;
          margin: 0 0 var(--space-6) 0;
        }

        .testimonial-author {
          border-top: 1px solid var(--border-primary);
          padding-top: var(--space-4);
        }

        .author-name {
          font-size: var(--text-base);
          font-weight: var(--font-weight-semibold);
          color: var(--stone-900);
        }

        .author-role {
          font-size: var(--text-sm);
          color: var(--stone-600);
          margin-top: var(--space-1);
        }

        /* ===== CTA SECTION ===== */
        .cta-section {
          padding: var(--space-20) 0;
          background: var(--gradient-forest-primary);
          text-align: center;
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: var(--text-4xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-inverse);
          margin: 0 0 var(--space-4) 0;
        }

        .cta-subtitle {
          font-size: var(--text-lg);
          color: rgba(255, 255, 255, 0.9);
          line-height: var(--leading-relaxed);
          margin: 0 0 var(--space-8) 0;
        }

        .btn-xl {
          background: var(--bg-primary);
          color: var(--forest-600);
          border-color: var(--bg-primary);
        }

        .btn-xl:hover {
          background: var(--wood-50);
          color: var(--forest-700);
          transform: translateY(-2px);
          box-shadow: var(--shadow-xl);
        }

        /* ===== RESPONSIVE DESIGN ===== */
        @media (max-width: 1023px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: var(--space-12);
            text-align: center;
          }

          .hero-actions {
            justify-content: center;
          }

          .hero-stats {
            justify-content: center;
          }

          .step {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 767px) {
          .hero-section {
            padding: var(--space-16) 0 var(--space-12);
          }

          .hero-title {
            font-size: var(--text-3xl);
            margin-bottom: var(--space-4);
          }

          .hero-subtitle {
            font-size: var(--text-base);
            margin-bottom: var(--space-6);
          }

          /* Mobile Statistics Cards - Single Horizontal Row */
          .hero-stats {
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-2);
            margin: var(--space-6) auto;
            max-width: 100%;
            padding: 0 var(--space-4);
          }

          .stat-card {
            padding: var(--space-2) var(--space-1);
            min-height: 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .stat-value {
            font-size: var(--text-lg);
            margin-bottom: var(--space-1);
          }

          .stat-label {
            font-size: var(--text-xs);
            text-align: center;
            line-height: 1.2;
          }

          /* Mobile CTA Buttons */
          .hero-actions {
            flex-direction: column;
            align-items: center;
            gap: var(--space-3);
            margin-top: var(--space-6);
          }

          .hero-actions .btn {
            width: 100%;
            max-width: 280px;
            padding: var(--space-3) var(--space-6);
          }

          .hero-visual {
            min-height: 400px;
            order: -1;
          }

          .features-grid,
          .testimonials-grid {
            grid-template-columns: 1fr;
          }

          .section-title {
            font-size: var(--text-3xl);
          }

          .cta-title {
            font-size: var(--text-3xl);
          }
        }

        /* ===== REDUCED MOTION ===== */
        @media (prefers-reduced-motion: reduce) {
          .feature-card {
            animation: none;
            transform: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernForestHome;