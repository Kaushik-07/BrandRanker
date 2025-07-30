import React, { useState } from 'react';

interface QuickStartExample {
  title: string;
  companies: string[];
  categories: string[];
  description: string;
  icon: string;
}

interface QuickStartCardProps {
  onUseExample: (companies: string[], categories: string[]) => void;
}

const QuickStartCard: React.FC<QuickStartCardProps> = ({ onUseExample }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const examples: QuickStartExample[] = [
    {
      title: 'Sneaker Brands',
      companies: ['Nike', 'Adidas', 'Puma'],
      categories: ['Sneakers'],
      description: 'Compare top sneaker brands in the market',
      icon: '👟'
    },
    {
      title: 'Smartphone Giants',
      companies: ['Apple', 'Samsung', 'Google'],
      categories: ['Smartphones'],
      description: 'Analyze smartphone market leaders',
      icon: '📱'
    },
    {
      title: 'Coffee Chains',
      companies: ['Starbucks', 'Dunkin', 'Peet\'s'],
      categories: ['Coffee'],
      description: 'Compare coffee chain performance',
      icon: '☕'
    },
    {
      title: 'Tech Companies',
      companies: ['Apple', 'Microsoft', 'Google'],
      categories: ['Technology', 'Innovation'],
      description: 'Compare tech industry leaders',
      icon: '💻'
    },
    {
      title: 'Fast Food',
      companies: ['McDonald\'s', 'Burger King', 'Wendy\'s'],
      categories: ['Fast Food'],
      description: 'Analyze fast food market',
      icon: '🍔'
    },
    {
      title: 'Streaming Services',
      companies: ['Netflix', 'Disney+', 'Hulu'],
      categories: ['Streaming'],
      description: 'Compare streaming platform performance',
      icon: '📺'
    }
  ];

  return (
    <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-3xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">⚡</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Quick Start Examples</h3>
            <p className="text-sm text-gray-600">Try these popular comparisons</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg 
            className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 mb-4">
          {examples.map((example, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer hover:shadow-md"
              onClick={() => onUseExample(example.companies, example.categories)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{example.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{example.title}</h4>
                    <p className="text-sm text-gray-600">{example.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {example.companies.length} companies
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {example.categories.length} categories
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Use This
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
        <div className="flex items-center space-x-3">
          <span className="text-indigo-600">💡</span>
          <div>
            <p className="text-sm font-medium text-indigo-700">Pro Tip</p>
            <p className="text-xs text-indigo-600">
              Click any example above to automatically fill the form with those companies and categories!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStartCard; 