import React from 'react';
import { ExperimentResult } from '../types';

interface BrandRankingsTableProps {
  experiment: ExperimentResult;
}

const BrandRankingsTable: React.FC<BrandRankingsTableProps> = ({ experiment }) => {
  // Calculate average ranks for each brand
  const calculateAverageRanks = () => {
    const brandAverages: Record<string, number> = {};
    const brandCounts: Record<string, number> = {};

    experiment.companies.forEach(brand => {
      brandAverages[brand] = 0;
      brandCounts[brand] = 0;
    });

    experiment.categories.forEach(category => {
      const categoryData = experiment.results[category];
      if (categoryData?.rankings) {
        experiment.companies.forEach(brand => {
          const rank = categoryData.rankings[brand];
          if (rank !== undefined) {
            brandAverages[brand] += rank;
            brandCounts[brand]++;
          }
        });
      }
    });

    // Calculate averages
    experiment.companies.forEach(brand => {
      if (brandCounts[brand] > 0) {
        brandAverages[brand] = brandAverages[brand] / brandCounts[brand];
      }
    });

    return brandAverages;
  };

  const averageRanks = calculateAverageRanks();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Brand Rankings</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Brand
              </th>
              {experiment.categories.map(category => (
                <th key={category} className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  {category}
                </th>
              ))}
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Avg Rank
              </th>
            </tr>
          </thead>
          <tbody>
            {experiment.companies.map(brand => (
              <tr key={brand} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900">
                  {brand}
                </td>
                {experiment.categories.map(category => {
                  const categoryData = experiment.results[category];
                  const rank = categoryData?.rankings?.[brand];
                  
                  return (
                    <td key={`${brand}-${category}`} className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                      {rank !== undefined ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          rank === 1 ? 'bg-green-100 text-green-800' :
                          rank === 2 ? 'bg-blue-100 text-blue-800' :
                          rank === 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rank}
                          {rank === 1 && <span className="ml-1">👑</span>}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900">
                  {averageRanks[brand] ? averageRanks[brand].toFixed(1) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BrandRankingsTable; 