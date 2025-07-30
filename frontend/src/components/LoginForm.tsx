import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Enhanced CSS animations for 10/10 design
const enhancedAnimations = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .animate-slide-in-right {
    animation: slideInRight 0.5s ease-out;
  }
  
  .animate-pulse-slow {
    animation: pulse 2s infinite;
  }
  
  .shimmer-effect {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
  
  .gradient-border {
    position: relative;
    background: linear-gradient(45deg, #667eea, #764ba2);
    padding: 2px;
    border-radius: 1rem;
  }
  
  .gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 2px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    border-radius: inherit;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
  }
  
  .floating-label {
    position: absolute;
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
    transition: all 0.3s ease;
    pointer-events: none;
    color: #9ca3af;
  }
  
  .floating-label.focused {
    top: 0;
    left: 0.75rem;
    font-size: 0.75rem;
    color: #667eea;
    background: white;
    padding: 0 0.25rem;
  }
  
  .input-focus-effect {
    position: relative;
    overflow: hidden;
  }
  
  .input-focus-effect::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: left 0.3s ease;
  }
  
  .input-focus-effect:focus-within::after {
    left: 0;
  }
`;

const LoginForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Enhanced loading animation
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        // Add subtle loading animation
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
        setSuccess('✅ Login successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          setError('❌ Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        // Simple password validation
        if (formData.password.length < 6) {
          setError('❌ Password must be at least 6 characters long');
          setIsLoading(false);
          return;
        }

        await register(formData.email, formData.username, formData.password);
        setSuccess('✅ Registration successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error: any) {
      console.log('🔍 Error caught:', error);
      console.log('🔍 Error response:', error.response);
      console.log('🔍 Error detail:', error.response?.data?.detail);
      
      // Display the exact backend error message without alert
      if (error.response?.data?.detail) {
        console.log('🔍 Setting error to:', error.response.data.detail);
        setError(error.response.data.detail);
      } else {
        console.log('🔍 Setting generic error');
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Keep error visible until user explicitly dismisses or tries again
    // This makes the error message more permanent
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      username: '',
      password: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced CSS animations */}
      <style>{enhancedAnimations}</style>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-10 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in-up">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-pulse-slow relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-75"></div>
            <span className="text-white font-bold text-3xl relative z-10">BR</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse-slow"></div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-slide-in-right">
            {isLogin ? 'Welcome Back' : 'Join Brand Ranker'}
          </h2>
          <p className="mt-3 text-gray-600 text-lg">
            {isLogin ? 'Sign in to your Brand Ranker account' : 'Create your account to get started'}
          </p>
        </div>
        
        <div className="glass-effect shadow-2xl rounded-3xl p-8 border border-white/20 relative overflow-hidden">
          {/* Subtle animated border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 animate-pulse-slow"></div>
          
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            
            <div className="space-y-6">
              {!isLogin && (
                <div className="input-focus-effect">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                  />
                </div>
              )}
              
              <div className="input-focus-effect">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('username')}
                  onBlur={handleBlur}
                />
              </div>
              
              <div className="input-focus-effect">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    className={`w-full px-4 py-4 pr-12 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                      error ? 'border-red-500 bg-red-50/80' : 'border-gray-200'
                    }`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors duration-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Enhanced Error message displayed below password field */}
                {error && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-2xl shadow-lg animate-fade-in-up">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-red-800 mb-1">Authentication Error</h4>
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                          onClick={() => setError('')}
                          className="mt-2 text-xs text-red-600 hover:text-red-800 underline transition-colors duration-200"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Success message displayed below password field */}
                {success && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-2xl shadow-lg animate-fade-in-up">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-green-800 mb-1">Success!</h4>
                        <p className="text-sm text-green-700">{success}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="input-focus-effect">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onFocus={() => handleFocus('confirmPassword')}
                      onBlur={handleBlur}
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors duration-300"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-2xl text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none relative overflow-hidden group"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {isLoading ? (
                <div className="flex items-center space-x-3 relative z-10">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3 relative z-10">
                  <span className="text-xl">{isLogin ? '🔐' : '📝'}</span>
                  <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                </div>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={switchMode}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-all duration-300 hover:scale-105"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 