import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/modern-forest-design-system.css';
import './styles/modern-forest-components.css';
import PrivateRoute from './components/common/PrivateRoute';
import ModernForestNavbar from './components/layout/ModernForestNavbar';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotificationCenter from './components/common/NotificationCenter';

const Home = React.lazy(() => import('./pages/ModernForestHome'));
const Login = React.lazy(() => import('./pages/auth/ModernForestLogin'));
const Register = React.lazy(() => import('./pages/auth/ModernForestRegister'));
const Dashboard = React.lazy(() => import('./pages/ModernForestDashboard'));
const ForestGame = React.lazy(() => import('./pages/ForestGame'));
const Habits = React.lazy(() => import('./pages/habits/Habits'));
const Profile = React.lazy(() => import('./pages/Profile'));
const SocialFeed = React.lazy(() => import('./pages/SocialFeed'));
const Challenges = React.lazy(() => import('./pages/Challenges'));
const ThemeDemo = React.lazy(() => import('./pages/ThemeDemo'));
const LogoShowcase = React.lazy(() => import('./pages/LogoShowcase'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
          <div className="App">
            <ErrorBoundary>
              <ModernForestNavbar />
              <main className="main-content">
                <React.Suspense fallback={<div className="container" style={{padding: '2rem'}}><div className="loading-skeleton" style={{height: 200}} /></div>}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Private routes */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/forest" element={
                    <PrivateRoute>
                      <ForestGame />
                    </PrivateRoute>
                  } />
                  <Route path="/habits" element={
                    <PrivateRoute>
                      <Habits />
                    </PrivateRoute>
                  } />
                  <Route path="/social" element={
                    <PrivateRoute>
                      <SocialFeed />
                    </PrivateRoute>
                  } />
                  <Route path="/challenges" element={
                    <PrivateRoute>
                      <Challenges />
                    </PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />
                  <Route path="/theme-demo" element={<ThemeDemo />} />
                  <Route path="/logo-showcase" element={<LogoShowcase />} />
                  
                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </React.Suspense>
              </main>
              <NotificationCenter />
            </ErrorBoundary>
          </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;