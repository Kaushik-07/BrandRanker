import React, { useState, useEffect } from 'react';
import { ExperimentResult } from '../types';

interface InsightsPanelProps {
  experiment: ExperimentResult;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ experiment }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, [experiment]);

  // Since we're using Perplexity AI, we can hardcode the data source
  const dataSource = 'perplexity';
  const isPerplexity = dataSource === 'perplexity';

  const insights = [
    {
      title: "Companies Analyzed",
      value: experiment.companies.length.toString(),
      subtitle: "Brands compared in this experiment",
      icon: "🏢",
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Categories",
      value: experiment.categories.length.toString(),
      subtitle: "Market segments analyzed",
      icon: "📊",
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200"
    },
    {
      title: "AI Analysis Engine",
      value: "Perplexity Pro",
      subtitle: "Real-time web search & analysis",
      icon: "🔍",
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-200"
    },
    {
      title: "Analysis Depth",
      value: "Comprehensive",
      subtitle: "Market research + web data",
      icon: "📈",
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Data Freshness",
      value: "Real-time",
      subtitle: "Live web search results",
      icon: "⚡",
      color: "from-yellow-500 to-amber-600",
      bgColor: "from-yellow-50 to-amber-50",
      borderColor: "border-yellow-200"
    },
    {
      title: "Analysis Quality",
      value: "Premium",
      subtitle: "Professional market analysis",
      icon: "🎯",
      color: "from-indigo-500 to-purple-600",
      bgColor: "from-indigo-50 to-purple-50",
      borderColor: "border-indigo-200"
    }
  ];

  return (
    <div className={`bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-8 border border-white/20 transition-all duration-700 ease-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">💡</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Experiment Insights</h3>
            <p className="text-gray-600">Key information about this analysis</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
            <span className="text-sm text-green-700 font-medium">
              {insights.length} Insights
            </span>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${insight.bgColor} border ${insight.borderColor} rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${insight.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                <span className="text-white text-xl">{insight.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {insight.title}
                </h4>
                <p className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 mb-2">
                  {insight.value}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {insight.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm">ℹ️</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">About This Analysis</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="mb-2">
              <strong>Data Source:</strong> Perplexity AI uses real-time web search to provide the most current market insights and brand comparisons.
            </p>
            <p className="mb-2">
              <strong>Analysis Method:</strong> Each category is analyzed separately using AI-powered market research and consumer data.
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong>Reliability:</strong> Results are based on current market data, expert reviews, and consumer feedback.
            </p>
            <p className="mb-2">
              <strong>Freshness:</strong> Data is retrieved in real-time, ensuring up-to-date brand comparisons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel; 