import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { experimentsAPI } from '../services/api';
import { ExperimentForm } from '../components/ExperimentForm';
import BrandRankerDashboard from '../components/BrandRankerDashboard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { ExperimentResult, ComparisonResult } from '../types';
import '../components/ExperimentForm.css';

// Enhanced types for better data management
interface BrandResult {
  brand: string;
  avgRank?: number;
  [category: string]: number | string | undefined;
}
type ReasoningModal = { open: boolean; text: string; brand?: string; category?: string };

const Dashboard: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [experiments, setExperiments] = useState<ExperimentResult[]>([]);
  const [currentResults, setCurrentResults] = useState<ExperimentResult | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // New state for enhanced features
  const [comparisonData, setComparisonData] = useState<ComparisonResult[]>([]);
  const [reasoningModal, setReasoningModal] = useState<ReasoningModal>({ open: false, text: '' });
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [showTour, setShowTour] = useState(true);

  // Check if first-time user
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBrandRanker');
    if (!hasVisited) {
      setIsFirstTimeUser(true);
      setShowTour(true);
      localStorage.setItem('hasVisitedBrandRanker', 'true');
    }
  }, []);

  // Enhanced data transformation for charts and tables - moved to components

  // const chartData = getAverageRanks(comparisonResults); // Unused variable

  // Generate comparison data from experiment results
  const generateComparisonData = (experiment: ExperimentResult): ComparisonResult[] => {
    if (!experiment || !experiment.results) return [];
    
    const brands = experiment.companies;
    const categories = experiment.categories;
    const results: ComparisonResult[] = [];
    
    console.log('🔄 Generating comparison data for:', brands, categories);
    
    brands.forEach(brand => {
      const brandData: ComparisonResult = { brand };
      categories.forEach(category => {
        const categoryData = experiment.results[category];
        if (categoryData) {
          const rankings = categoryData.rankings || categoryData;
          brandData[category] = rankings[brand] || 0;
        }
      });
      results.push(brandData);
    });
    
    return results;
  };

  // Fetch experiments on component mount
  const fetchExperiments = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('🔍 Fetching experiments for user:', user.username);
      const data = await experimentsAPI.getExperiments();
      console.log('✅ Experiments fetched:', data.length);
      setExperiments(data);
      
      // Set the most recent experiment as current results if no current results
      if (data.length > 0) {
        const mostRecent = data[0]; // Assuming experiments are sorted by creation date
        setCurrentResults(mostRecent);
        setSelectedExperiment(mostRecent);
        
        // Generate comparison data for the most recent experiment
        const comparisonData = generateComparisonData(mostRecent);
        setComparisonData(comparisonData);
      }
    } catch (error) {
      console.error('Failed to fetch experiments:', error);
      setExperiments([]);
    }
  }, [user]);

  // Clear experiments when user changes
  useEffect(() => {
    console.log('🔄 User changed, clearing and fetching experiments');
    console.log('🔍 Current user:', user);
    console.log('🔍 Current experiments count:', experiments.length);
    
    if (user) {
      // Only clear if we don't already have experiments for this user
      if (experiments.length === 0) {
        console.log('📊 No experiments loaded yet, fetching...');
        fetchExperiments();
      } else {
        console.log('📊 Experiments already loaded, keeping existing data');
      }
    } else {
      console.log('🚫 No user, clearing experiments');
      setExperiments([]);
      setCurrentResults(null);
      setSelectedExperiment(null);
    }
  }, [user, fetchExperiments, experiments.length]);

  // Handle initial data loading when user is restored
  useEffect(() => {
    if (user && experiments.length === 0) {
      console.log('🚀 Initial data loading for restored user:', user.username);
      fetchExperiments();
    }
  }, [user, fetchExperiments, experiments.length]);

  const handleCreateExperiment = async () => {
    await fetchExperiments();
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Add a timeout to prevent the analysis overlay from getting stuck
    setTimeout(() => {
      if (isAnalyzing) {
        console.log('⚠️ Analysis timeout - resetting state');
        setIsAnalyzing(false);
        setAnalysisProgress(0);
      }
    }, 30000); // 30 second timeout
  };

  const handleAnalysisProgress = (progress: number) => {
    setAnalysisProgress(progress);
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    // Fetch experiments and set the most recent one as current
    fetchExperiments().then(() => {
      // The fetchExperiments function already sets the most recent experiment as current
      console.log('✅ Analysis complete, latest experiment should be displayed');
    });
  };

  const handleSelectExperiment = (experiment: ExperimentResult) => {
    setCurrentResults(experiment);
    setSelectedExperiment(experiment);
    // Generate comparison data for the selected experiment
    const comparisonData = generateComparisonData(experiment);
    setComparisonData(comparisonData);
    console.log('🎯 Selected experiment:', experiment);
    console.log('📊 Generated comparison data:', comparisonData);
  };

  const handleLogout = () => {
    setExperiments([]);
    setCurrentResults(null);
    setSelectedExperiment(null);
    // setComparisonResults([]); // Removed unused state
    setComparisonData([]);
    logout();
  };

  const totalExperiments = experiments.length;
  const totalRankings = experiments.reduce((sum, exp) => sum + Object.keys(exp.results).length, 0);
  const avgPerExperiment = totalExperiments > 0 ? (totalRankings / totalExperiments).toFixed(1) : '0.0';

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          <p className="text-gray-600">Checking authentication status</p>
        </div>
      </div>
    );
  }

  // Don't render if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🚀</span>
                <h1 className="text-xl font-bold text-gray-900">Brand Ranker</h1>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">AI-Powered Brand Analysis</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                    Powered by Perplexity AI
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleTimeString()}
              </div>
              <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {totalExperiments} Experiments
              </div>
              <div className="text-sm text-gray-700">
                Welcome, {user.username}.
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* AI Analysis Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="text-center w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-purple-200">
              <div className="mb-8">
                <div className="relative mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">🤖 Perplexity AI Analysis</h3>
                <p className="text-gray-600 mb-6 text-base">Analyzing brands and generating comprehensive rankings</p>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                    🔍 Data extracted from Perplexity API
                  </span>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                    📊 Detail Ranking Analysis
                  </span>
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 h-3 rounded-full transition-all duration-300 ease-out shadow-lg"
                    style={{ width: `${analysisProgress}%` }}
                  ></div>
                </div>
                <p className="text-base font-semibold text-gray-700">{analysisProgress}% Complete</p>
              </div>
              
              {/* Enhanced Analysis Steps */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className={`w-2 h-2 rounded-full ${analysisProgress >= 25 ? 'bg-green-500' : 'bg-purple-300'}`}></div>
                  <span className="text-purple-800 font-medium text-sm">Researching brand performance data</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className={`w-2 h-2 rounded-full ${analysisProgress >= 50 ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                  <span className="text-blue-800 font-medium text-sm">Comparing features and quality metrics</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className={`w-2 h-2 rounded-full ${analysisProgress >= 75 ? 'bg-green-500' : 'bg-green-300'}`}></div>
                  <span className="text-green-800 font-medium text-sm">Generating comprehensive rankings</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className={`w-2 h-2 rounded-full ${analysisProgress >= 100 ? 'bg-green-500' : 'bg-orange-300'}`}></div>
                  <span className="text-orange-800 font-medium text-sm">Creating detailed analysis reports</span>
                </div>
              </div>
              
              {/* AI Brand */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-purple-700 font-semibold">Powered by Perplexity AI</p>
                    <p className="text-xs text-purple-600">Advanced AI-powered brand analysis</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-purple-600">Data extracted from Perplexity API</p>
                    <p className="text-xs text-purple-600">Detail ranking analysis</p>
                  </div>
                </div>
              </div>
              
              {/* Manual Reset Button */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setIsAnalyzing(false);
                    setAnalysisProgress(0);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  🔄 Reset Analysis
                </button>
                <p className="text-xs text-gray-500 mt-2">Click if analysis seems stuck</p>
              </div>
            </div>
          </div>
        )}

        {/* First-Time User Welcome */}
        {isFirstTimeUser && showTour && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-2xl">🎉</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Brand Ranker!</h2>
                <p className="text-gray-600">AI-powered brand comparison and analysis</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Add Brands & Categories</h3>
                    <p className="text-sm text-gray-600">Enter the brands you want to compare and select categories</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                    <p className="text-sm text-gray-600">Perplexity AI will analyze and rank your brands</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">View Results</h3>
                    <p className="text-sm text-gray-600">Explore detailed rankings, charts, and AI reasoning</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowTour(false)}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Simple Compare Brands Form */}
          <div className="lg:col-span-1">
            <ExperimentForm 
              onExperimentCreated={handleCreateExperiment}
              onAnalysisStart={handleAnalysisStart}
              onAnalysisProgress={handleAnalysisProgress}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>

          {/* Right Column - Results and Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-500 ${currentResults ? 'scale-105 shadow-xl' : ''}`}>
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-600 text-xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Comparisons</p>
                    <p className="text-2xl font-bold text-gray-900">{totalExperiments}</p>
                  </div>
                </div>
              </div>

              <div className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-500 ${currentResults ? 'scale-105 shadow-xl' : ''}`}>
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-green-600 text-xl">🏆</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Rankings</p>
                    <p className="text-2xl font-bold text-gray-900">{totalRankings}</p>
                  </div>
                </div>
              </div>

              <div className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-500 ${currentResults ? 'scale-105 shadow-xl' : ''}`}>
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600 text-xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg per Comparison</p>
                    <p className="text-2xl font-bold text-gray-900">{avgPerExperiment}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Centered Brand Rankings Table */}
            {currentResults && (
              <div className="flex justify-center">
                <div className="w-full max-w-7xl">
                  {isAnalyzing ? (
                    <div className="space-y-6">
                      <LoadingSkeleton type="table" rows={3} columns={currentResults.categories.length} />
                      <LoadingSkeleton type="chart" />
                    </div>
                  ) : (
                    <BrandRankerDashboard experiment={currentResults} />
                  )}
                </div>
              </div>
            )}

            {/* Recent Comparisons with Click to View */}
            {experiments.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">📚 Recent Comparisons ({experiments.length})</h3>
                  <div className="text-sm text-gray-500">Click any comparison to view detailed AI analysis • Scroll to see all</div>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {experiments.map((experiment, index) => (
                    <div 
                      key={experiment.id} 
                      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedExperiment?.id === experiment.id 
                          ? 'bg-purple-50 border-2 border-purple-200' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => handleSelectExperiment(experiment)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          selectedExperiment?.id === experiment.id 
                            ? 'bg-purple-200 text-purple-800' 
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          <span className="font-medium text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {experiment.companies.join(' vs ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {experiment.categories.join(', ')}
                          </p>
                          {experiment.results && Object.keys(experiment.results).length > 0 && (
                            <div className="flex items-center mt-1">
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                🤖 AI Analysis Available
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(experiment.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {'Avg: ' + (Object.values(experiment.average_ranks).reduce((a, b) => a + b, 0) / Object.values(experiment.average_ranks).length).toFixed(1)}
                        </p>
                        {selectedExperiment?.id === experiment.id && (
                          <span className="text-xs text-purple-600 font-medium">✓ Selected</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!currentResults && experiments.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-['Inter']">Ready to Compare Brands?</h3>
                <p className="text-gray-600 mb-4">
                  Add brands and categories to see AI-powered comparisons and rankings
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                    🔍 Data extracted from Perplexity API
                  </span>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                    📊 Detail Ranking Analysis
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Powered by Perplexity AI for accurate brand analysis
                </div>
              </div>
            )}

            {/* Error State with Re-analyze Button */}
            {currentResults && comparisonData.length === 0 && !isAnalyzing && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-yellow-600 text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-['Inter']">Analysis Incomplete</h3>
                <p className="text-gray-600 mb-4">
                  Some data is missing from the analysis. Please try re-analyzing.
                </p>
                <button
                  onClick={() => {
                    const comparisonData = generateComparisonData(currentResults);
                    setComparisonData(comparisonData);
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  🔄 Re-analyze Data
                </button>
                <div className="mt-4 text-sm text-gray-500">
                  Validating Perplexity AI output...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Reasoning Modal */}
        {reasoningModal.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    🤖 AI Reasoning
                  </h3>
                  {reasoningModal.brand && reasoningModal.category && (
                    <p className="text-sm text-gray-600">
                      {reasoningModal.brand} in {reasoningModal.category}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setReasoningModal({ open: false, text: '' })}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-lg">🤖</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-purple-800 text-base leading-relaxed">
                      {reasoningModal.text}
                    </p>
                    <div className="mt-3 text-xs text-purple-600">
                      💡 Analysis powered by Perplexity AI with real-time web search
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setReasoningModal({ open: false, text: '' })}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard; 