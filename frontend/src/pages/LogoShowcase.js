import React, { useState } from 'react';
import Logo, { LinkLogo } from '../components/common/Logo';

const LogoShowcase = () => {
  const [showAnimations, setShowAnimations] = useState(false);
  
  const themes = [
    { name: 'Auto', value: 'auto' },
    { name: 'Elegant', value: 'elegant' },
    { name: 'Nature', value: 'nature' },
    { name: 'Forest', value: 'forest' },
    { name: 'Premium', value: 'premium' }
  ];
  
  const sizes = [
    { name: 'Small', value: 'small' },
    { name: 'Medium', value: 'medium' },
    { name: 'Large', value: 'large' }
  ];
  
  const variants = [
    { name: 'Full Logo', value: 'full' },
    { name: 'Compact', value: 'compact' },
    { name: 'Icon Only', value: 'icon' }
  ];

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
    }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          marginBottom: '1rem',
          color: 'var(--text-primary, #111827)'
        }}>
          HabitFlow Logo System
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: 'var(--text-secondary, #6b7280)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Professional logo implementation with theme variants, multiple sizes, and purposeful animations for the HabitFlow habit tracking platform.
        </p>
      </header>

      {/* Controls */}
      <div style={{ 
        marginBottom: '3rem', 
        padding: '1.5rem',
        background: 'var(--bg-secondary, #f9fafb)',
        borderRadius: '12px',
        border: '1px solid var(--border-primary, #e5e7eb)'
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontSize: '1rem',
          fontWeight: '500'
        }}>
          <input
            type="checkbox"
            checked={showAnimations}
            onChange={(e) => setShowAnimations(e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
          Show Animations (hover effects and entrance animations)
        </label>
      </div>

      {/* Logo Variants Grid */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '600', 
          marginBottom: '2rem',
          color: 'var(--text-primary, #111827)'
        }}>
          Logo Variants
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {variants.map(variant => (
            <div key={variant.value} style={{
              padding: '2rem',
              background: 'white',
              borderRadius: '12px',
              border: '2px solid var(--border-primary, #e5e7eb)',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '1.5rem',
                color: 'var(--text-primary, #111827)'
              }}>
                {variant.name}
              </h3>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '1rem' 
              }}>
                <Logo 
                  variant={variant.value}
                  size="large"
                  theme="auto"
                  showAnimation={showAnimations}
                />
              </div>
              
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-secondary, #6b7280)',
                marginTop: '1rem'
              }}>
                {variant.value === 'full' && 'Complete logo with icon and text'}
                {variant.value === 'compact' && 'Logo with "HF" abbreviation'}
                {variant.value === 'icon' && 'Icon only for tight spaces'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Theme Variants */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '600', 
          marginBottom: '2rem',
          color: 'var(--text-primary, #111827)'
        }}>
          Theme Variants
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {themes.map(theme => (
            <div key={theme.value} style={{
              padding: '1.5rem',
              background: 'white',
              borderRadius: '12px',
              border: '2px solid var(--border-primary, #e5e7eb)',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: 'var(--text-primary, #111827)'
              }}>
                {theme.name}
              </h3>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '1rem' 
              }}>
                <Logo 
                  variant="full"
                  size="medium"
                  theme={theme.value}
                  showAnimation={showAnimations}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Size Variants */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '600', 
          marginBottom: '2rem',
          color: 'var(--text-primary, #111827)'
        }}>
          Size Variants
        </h2>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '3rem',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          border: '2px solid var(--border-primary, #e5e7eb)'
        }}>
          {sizes.map(size => (
            <div key={size.value} style={{ textAlign: 'center' }}>
              <Logo 
                variant="full"
                size={size.value}
                theme="auto"
                showAnimation={showAnimations}
              />
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-secondary, #6b7280)',
                marginTop: '0.5rem',
                fontWeight: '500'
              }}>
                {size.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Usage Examples */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '600', 
          marginBottom: '2rem',
          color: 'var(--text-primary, #111827)'
        }}>
          Usage Examples
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gap: '2rem' 
        }}>
          {/* Navbar Example */}
          <div style={{
            padding: '1rem 2rem',
            background: 'white',
            borderRadius: '12px',
            border: '2px solid var(--border-primary, #e5e7eb)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <LinkLogo 
              variant="full"
              size="medium"
              theme="auto"
              showAnimation={showAnimations}
            />
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary, #6b7280)'
            }}>
              <span>Dashboard</span>
              <span>Habits</span>
              <span>Social</span>
              <span>Profile</span>
            </div>
          </div>
          
          {/* Mobile Header Example */}
          <div style={{
            padding: '1rem',
            background: 'white',
            borderRadius: '12px',
            border: '2px solid var(--border-primary, #e5e7eb)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Logo 
              variant="compact"
              size="small"
              theme="auto"
              showAnimation={showAnimations}
            />
            <div style={{ 
              fontSize: '0.75rem',
              color: 'var(--text-secondary, #6b7280)'
            }}>
              Mobile Navigation
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Code */}
      <section>
        <h2 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '600', 
          marginBottom: '2rem',
          color: 'var(--text-primary, #111827)'
        }}>
          Implementation
        </h2>
        
        <div style={{
          padding: '1.5rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid var(--border-primary, #e5e7eb)',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
          fontSize: '0.875rem',
          lineHeight: '1.6'
        }}>
          <pre style={{ margin: 0, overflow: 'auto' }}>{`// Basic Logo
import Logo from '../components/common/Logo';

<Logo 
  variant="full"        // 'full' | 'compact' | 'icon'
  size="medium"         // 'small' | 'medium' | 'large' 
  theme="auto"          // 'auto' | 'elegant' | 'nature' | 'forest' | 'premium'
  showAnimation={false} // Enable hover and entrance animations
/>

// Logo with Link (for navbars)
import { LinkLogo } from '../components/common/Logo';

<LinkLogo 
  to="/"
  variant="full"
  size="medium"
  theme="premium"
  className="navbar-brand"
/>`}</pre>
        </div>
      </section>
    </div>
  );
};

export default LogoShowcase;