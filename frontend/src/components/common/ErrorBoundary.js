import React from 'react';
import PropTypes from 'prop-types';

/**
 * Application-wide error boundary to prevent full app crashes.
 * - Renders a friendly fallback UI
 * - Optionally reports the error via onError prop (hook up Sentry, etc.)
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In production, report to monitoring service
    if (this.props.onError) {
      this.props.onError(error, info);
    }
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" role="alert">
          <div className="card" style={{ margin: '2rem auto', maxWidth: 640 }}>
            <h2 className="card-title">Something went wrong</h2>
            <p className="card-subtitle">An unexpected error occurred. Please try refreshing the page.</p>
            <div style={{ marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func,
};

export default ErrorBoundary;
