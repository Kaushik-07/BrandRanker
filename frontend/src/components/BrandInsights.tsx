import React from 'react';
import { ExperimentResult } from '../types';

interface BrandInsightsProps {
  experiment: ExperimentResult;
}

const BrandInsights: React.FC<BrandInsightsProps> = ({ experiment }) => {
  if (!experiment || !experiment.results) {
    return null;
  }

  // Calculate insights
  const brands = experiment.companies;
  const categories = experiment.categories;
  const averageRanks = experiment.average_ranks;

  // Find overall winner
  const overallWinner = Object.entries(averageRanks).reduce((winner, [brand, rank]) => 
    rank < winner.rank ? { brand, rank } : winner
  , { brand: '', rank: Infinity });

  // Find category winners
  const categoryWinners = categories.map(category => {
    const categoryData = experiment.results[category];
    if (!categoryData || !categoryData.rankings) return null;
    
    const winner = Object.entries(categoryData.rankings).reduce((best, [brand, rank]) => 
      rank < best.rank ? { brand, rank } : best
    , { brand: '', rank: Infinity });
    
    return { category, ...winner };
  }).filter((winner): winner is { category: string; brand: string; rank: number } => winner !== null);

  // Calculate performance gaps
  const performanceGaps = Object.entries(averageRanks).map(([brand, rank]) => ({
    brand,
    rank,
    gap: rank - overallWinner.rank
  })).sort((a, b) => a.gap - b.gap);

  // Find most competitive category
  const mostCompetitiveCategory = categories.map(category => {
    const categoryData = experiment.results[category];
    if (!categoryData || !categoryData.rankings) return null;
    
    const ranks = Object.values(categoryData.rankings);
    const variance = ranks.reduce((sum, rank) => sum + Math.pow(rank - (ranks.reduce((a, b) => a + b, 0) / ranks.length), 2), 0) / ranks.length;
    
    return { category, variance };
  }).filter((item): item is { category: string; variance: number } => item !== null).sort((a, b) => b.variance - a.variance)[0];

  return (
    <div className="space-y-6">
      {/* Overall Winner Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🏆</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 font-['Inter']">Overall Winner</h3>
            <p className="text-lg font-semibold text-yellow-800">{overallWinner.brand}</p>
            <p className="text-sm text-gray-600">
              Best average performance across {categories.length} categories with rank {overallWinner.rank.toFixed(1)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-800">{overallWinner.rank.toFixed(1)}</div>
            <div className="text-xs text-gray-500">Average Rank</div>
          </div>
        </div>
      </div>

      {/* Category Winners */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 font-['Inter'] mb-4">🏅 Category Champions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryWinners.map((winner, index) => (
            <div key={winner.category} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800 capitalize">{winner.category}</h4>
                  <p className="text-sm text-gray-600">Winner: {winner.brand}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">#{winner.rank}</div>
                  <div className="text-xs text-gray-500">Rank</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 font-['Inter'] mb-4">📈 Performance Analysis</h3>
        <div className="space-y-4">
          {performanceGaps.map((item, index) => (
            <div key={item.brand} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{item.brand}</div>
                  <div className="text-sm text-gray-600">
                    {item.gap === 0 ? 'Tied for 1st' : `${item.gap.toFixed(1)} points behind leader`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-800">{item.rank.toFixed(1)}</div>
                <div className="text-xs text-gray-500">Avg Rank</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Insights */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 font-['Inter'] mb-4">🎯 Competitive Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🔥</span>
              <h4 className="font-semibold text-blue-800">Most Competitive Category</h4>
            </div>
            <p className="text-sm text-blue-700">
              {mostCompetitiveCategory?.category} shows the highest variance in rankings, 
              indicating intense competition among brands.
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📊</span>
              <h4 className="font-semibold text-green-800">Analysis Coverage</h4>
            </div>
            <p className="text-sm text-green-700">
              {brands.length} brands analyzed across {categories.length} categories 
              using Perplexity AI for comprehensive insights.
            </p>
          </div>
        </div>
      </div>

      {/* Key Takeaways */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-bold text-gray-800 font-['Inter'] mb-4">💡 Key Takeaways</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-purple-600 text-lg">•</span>
            <p className="text-sm text-gray-700">
              <strong>{overallWinner.brand}</strong> demonstrates consistent performance across all categories, 
              making it the strongest overall brand in this comparison.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-purple-600 text-lg">•</span>
            <p className="text-sm text-gray-700">
              The analysis covers {categories.length} distinct market segments, providing a comprehensive 
              view of brand positioning and competitive landscape.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-purple-600 text-lg">•</span>
            <p className="text-sm text-gray-700">
              Rankings are based on real-time market data and AI analysis, ensuring current and relevant insights 
              for strategic decision-making.
            </p>
          </div>
        </div>
      </div>

      {/* Perplexity AI Branding */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold text-sm">P</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Powered by Perplexity AI</p>
              <p className="text-xs text-gray-500">Real-time market analysis & brand intelligence</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Analysis Date</div>
            <div className="text-sm font-medium text-gray-800">
              {new Date(experiment.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandInsights; 