import React from 'react';

interface AverageRanksChartProps {
  experiment: any;
}

export const AverageRanksChart: React.FC<AverageRanksChartProps> = ({ experiment }) => {
  if (!experiment || !experiment.average_ranks || Object.keys(experiment.average_ranks).length === 0) {
    return null;
  }

  // Sort brands by average rank (best first)
  const sortedBrands = Object.entries(experiment.average_ranks)
    .sort(([, a], [, b]) => Number(a) - Number(b))
    .map(([brand, avgRank]) => ({ brand, avgRank: Number(avgRank) }));

  const maxRank = Math.max(...sortedBrands.map(b => b.avgRank));
  const minRank = Math.min(...sortedBrands.map(b => b.avgRank));

  const getBarColor = (rank: number, index: number) => {
    if (rank === minRank) return 'bg-gradient-to-r from-green-500 to-emerald-500'; // Best performer
    if (rank <= minRank + 0.5) return 'bg-gradient-to-r from-blue-500 to-cyan-500'; // Good performer
    if (rank <= minRank + 1) return 'bg-gradient-to-r from-yellow-500 to-orange-500'; // Average performer
    return 'bg-gradient-to-r from-red-500 to-pink-500'; // Below average
  };

  const getRankLabel = (rank: number) => {
    if (rank <= 1.5) return 'Excellent';
    if (rank <= 2.5) return 'Good';
    if (rank <= 3.5) return 'Average';
    return 'Below Average';
  };

  return (
    <div className="enhanced-card">
      <div className="enhanced-section-header">
        <h3>📊 Average Rankings Across All Categories</h3>
        <span className="text-sm text-white/80">
          {experiment.categories?.length || 0} categories analyzed
        </span>
      </div>
      
      <div className="p-6">
        {/* Chart Header */}
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-2">
            Brand Performance Summary
          </h4>
          <p className="text-gray-600">
            Average rankings across {experiment.categories?.length || 0} categories. Lower scores indicate better performance.
          </p>
        </div>

        {/* Bar Chart */}
        <div className="space-y-4">
          {sortedBrands.map(({ brand, avgRank }, index) => (
            <div key={brand} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{brand}</h5>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        avgRank === minRank 
                          ? 'bg-green-100 text-green-800' 
                          : avgRank <= minRank + 0.5 
                          ? 'bg-blue-100 text-blue-800'
                          : avgRank <= minRank + 1
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {getRankLabel(avgRank)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {avgRank.toFixed(2)} avg rank
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">
                    {avgRank.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Average</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-6 shadow-inner">
                  <div 
                    className={`h-6 rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden ${getBarColor(avgRank, index)}`}
                    style={{ 
                      width: `${((maxRank - avgRank) / (maxRank - minRank)) * 100}%`,
                      minWidth: '20px'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                    {avgRank === minRank && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <h5 className="font-semibold text-gray-800 mb-3">Performance Legend</h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <span className="text-sm text-gray-700">Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <span className="text-sm text-gray-700">Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-500 to-orange-500"></div>
              <span className="text-sm text-gray-700">Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-pink-500"></div>
              <span className="text-sm text-gray-700">Below Average</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
          <h5 className="font-semibold text-purple-800 mb-2">💡 Key Insights</h5>
          <div className="space-y-2 text-sm text-purple-700">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>
                <strong>{sortedBrands[0]?.brand}</strong> is the top performer with an average rank of {sortedBrands[0]?.avgRank.toFixed(2)}
              </span>
            </div>
            {sortedBrands.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>
                  <strong>{sortedBrands[sortedBrands.length - 1]?.brand}</strong> needs improvement with an average rank of {sortedBrands[sortedBrands.length - 1]?.avgRank.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>
                Rank spread: {maxRank.toFixed(2)} - {minRank.toFixed(2)} = {(maxRank - minRank).toFixed(2)} points
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 