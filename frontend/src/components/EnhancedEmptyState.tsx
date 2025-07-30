import React from 'react';

interface EnhancedEmptyStateProps {
  onStartTutorial: () => void;
  onUseExample: (companies: string[], categories: string[]) => void;
}

const EnhancedEmptyState: React.FC<EnhancedEmptyStateProps> = ({ onStartTutorial, onUseExample }) => {
  const quickExamples = [
    {
      title: 'Sneaker Battle',
      companies: ['Nike', 'Adidas', 'Puma'],
      categories: ['Sneakers'],
      icon: '👟'
    },
    {
      title: 'Tech Titans',
      companies: ['Apple', 'Samsung', 'Google'],
      categories: ['Smartphones'],
      icon: '📱'
    }
  ];

  return (
    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-12 border border-white/20 text-center">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🚀</span>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Brand Ranker!</h3>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          Discover which brands dominate different markets with AI-powered analysis. 
          Compare companies across categories and get insights that drive business decisions.
        </p>
      </div>

      {/* Value Propositions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">🤖</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h4>
          <p className="text-sm text-gray-600">
            Advanced AI considers market share, quality, innovation, and customer satisfaction
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">📊</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Detailed Insights</h4>
          <p className="text-sm text-gray-600">
            Get comprehensive rankings, charts, and actionable business insights
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">⚡</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Quick & Easy</h4>
          <p className="text-sm text-gray-600">
            Set up experiments in minutes and get results instantly
          </p>
        </div>
      </div>

      {/* Quick Start Examples */}
      <div className="mb-8">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">Try These Popular Comparisons</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {quickExamples.map((example, index) => (
            <button
              key={index}
              onClick={() => onUseExample(example.companies, example.categories)}
              className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md text-left"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{example.icon}</span>
                <div>
                  <h5 className="font-semibold text-gray-900">{example.title}</h5>
                  <p className="text-sm text-gray-600">
                    {example.companies.join(', ')} in {example.categories.join(', ')}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onStartTutorial}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          🎯 Start Tutorial
        </button>
        <button
          onClick={() => onUseExample(['Nike', 'Adidas'], ['Sneakers'])}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          ⚡ Quick Start
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>No registration required</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Instant AI analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Detailed insights & charts</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Export & share results</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEmptyState; 