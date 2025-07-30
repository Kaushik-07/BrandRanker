import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while authentication is being initialized
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <LoadingSpinner size="lg" text="Loading application..." />
      </div>
    );
  }

  // Only redirect to login if we're not loading and there's no user
  if (!user) {
    console.log('🚫 No user found, redirecting to login');
    return <Navigate to="/login" />;
  }

  // User is authenticated, show the protected content
  console.log('✅ User authenticated, showing dashboard');
  return <>{children}</>;
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while authentication is being initialized
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <LoadingSpinner size="lg" text="Loading application..." />
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    console.log('✅ User already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" />;
  }

  // User is not authenticated, show the public content
  console.log('ℹ️ User not authenticated, showing login/register');
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <RegisterForm />
                </PublicRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
