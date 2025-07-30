import React from 'react';
import { ExperimentResult } from '../types';

interface AssignmentDashboardProps {
  experiment: ExperimentResult;
}

const AssignmentDashboard: React.FC<AssignmentDashboardProps> = ({ experiment }) => {
  if (!experiment || !experiment.results) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">Create a comparison to see rankings</p>
      </div>
    );
  }

  const brands = experiment.companies;
  const categories = experiment.categories;
  const averageRanks = experiment.average_ranks;

  // Find the best performing brand (lowest average rank)
  const bestBrand = Object.entries(averageRanks).reduce((best, [brand, rank]) => 
    rank < best.rank ? { brand, rank } : best
  , { brand: '', rank: Infinity });

  // Sort brands by average rank (best first)
  const sortedBrands = brands.sort((a, b) => (averageRanks[a] || 0) - (averageRanks[b] || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Brand Ranker Analysis</h1>
        <p className="text-gray-600">
          Comparing {brands.length} brands across {categories.length} categories using Perplexity AI
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <span>🏆 {bestBrand.brand} is the best overall performer</span>
          <span>•</span>
          <span>Average rank: {bestBrand.rank.toFixed(1)}</span>
        </div>
      </div>

      {/* Main Ranking Table - Assignment Format */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Brand Rankings</h2>
          <p className="text-sm text-gray-600">Lower rank = Better performance</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                {categories.map(category => (
                  <th key={category} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {category}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Rank
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedBrands.map((brand, index) => {
                const isBest = brand === bestBrand.brand;
                
                return (
                  <tr key={brand} className={isBest ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{brand}</span>
                        {isBest && <span className="text-green-600">🏆</span>}
                        {index === 0 && !isBest && <span className="text-blue-600">🥈</span>}
                        {index === 1 && !isBest && index > 0 && <span className="text-yellow-600">🥉</span>}
                      </div>
                    </td>
                    {categories.map(category => {
                      const categoryData = experiment.results[category];
                      const rank = categoryData && categoryData.rankings ? categoryData.rankings[brand] || 0 : 0;
                      
                      return (
                        <td key={category} className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rank === 1 ? 'bg-green-100 text-green-800' :
                            rank === 2 ? 'bg-blue-100 text-blue-800' :
                            rank === 3 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rank > 0 ? rank : '-'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        isBest ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {averageRanks[brand]?.toFixed(1) || '0.0'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar Chart - Assignment Requirement */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Average Ranks Chart</h2>
        <div className="space-y-4">
          {sortedBrands.map((brand, index) => {
            const avgRank = averageRanks[brand] || 0;
            const isBest = brand === bestBrand.brand;
            const percentage = ((Math.max(...Object.values(averageRanks)) - avgRank) / Math.max(...Object.values(averageRanks))) * 100;
            
            return (
              <div key={brand} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{brand}</span>
                    {isBest && <span className="text-green-600">🏆</span>}
                    {index === 0 && !isBest && <span className="text-blue-600">🥈</span>}
                    {index === 1 && !isBest && index > 0 && <span className="text-yellow-600">🥉</span>}
                  </div>
                  <span className="text-sm font-medium text-gray-600">{avgRank.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isBest ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.max(percentage, 10)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>📊 Chart Explanation:</strong> Lower bars indicate better performance. {bestBrand.brand} has the lowest average rank ({bestBrand.rank.toFixed(1)}).
          </p>
        </div>
      </div>

      {/* Perplexity AI Branding */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-purple-900">Powered by Perplexity AI</h3>
            <p className="text-xs text-purple-700">Real-time brand analysis using advanced AI</p>
          </div>
          <div className="text-purple-600">
            <span className="text-lg">🤖</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDashboard; 