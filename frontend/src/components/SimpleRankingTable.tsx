import React from 'react';
import { ExperimentResult } from '../types';

interface SimpleRankingTableProps {
  experiment: ExperimentResult;
}

const SimpleRankingTable: React.FC<SimpleRankingTableProps> = ({ experiment }) => {
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

  // Find the best performing brand
  const bestBrand = Object.entries(averageRanks).reduce((best, [brand, rank]) => 
    rank < best.rank ? { brand, rank } : best
  , { brand: '', rank: Infinity });

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Brand Rankings</h2>
        <p className="text-sm text-gray-600">Powered by Perplexity AI</p>
      </div>

      {/* Table */}
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
            {brands.map(brand => {
              const isBest = brand === bestBrand.brand;
              
              return (
                <tr key={brand} className={isBest ? 'bg-green-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span>{brand}</span>
                      {isBest && <span className="text-green-600">🏆</span>}
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

      {/* Summary */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              <strong>{bestBrand.brand}</strong> is the best overall performer with an average rank of {bestBrand.rank.toFixed(1)}
            </p>
          </div>
          <div className="text-xs text-gray-500">
            Lower rank = Better performance
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleRankingTable; 