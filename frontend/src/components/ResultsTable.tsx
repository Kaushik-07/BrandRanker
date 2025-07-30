import React from 'react';
import { ExperimentResult } from '../types';
import DataVisualization from './DataVisualization';
import DetailedAnalysis from './DetailedAnalysis';

interface ResultsTableProps {
  experiment: ExperimentResult | null;
  onCellClick?: (brand: string, category: string) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ experiment, onCellClick }) => {
  if (!experiment) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
          <p className="text-sm text-gray-500">Create an experiment to see rankings and visualizations</p>
        </div>
      </div>
    );
  }

  const { companies, categories, results, average_ranks } = experiment;

  // Safely handle average_ranks with null checks
  if (!average_ranks || typeof average_ranks !== 'object') {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Results</h3>
          <p className="text-sm text-gray-500">AI analysis is still in progress...</p>
        </div>
      </div>
    );
  }

  // Find the best performing brand with safe checks
  const averageRanksEntries = Object.entries(average_ranks);
  if (averageRanksEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Rankings Available</h3>
          <p className="text-sm text-gray-500">Rankings are being calculated...</p>
        </div>
      </div>
    );
  }

  const bestBrand = averageRanksEntries.reduce((a, b) => a[1] < b[1] ? a : b)[0];
  const bestRank = average_ranks[bestBrand];

  // Calculate insights
  const totalComparisons = companies.length * categories.length;

  return (
    <div className="space-y-6">
      {/* AI Analysis Header with Perplexity Branding */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-lg">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Perplexity AI Analysis Results</h2>
              <p className="text-sm text-gray-600">Real-time web search & AI-powered brand comparison</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                  🔍 Data extracted from Perplexity API
                </span>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                  📊 Detail Ranking Analysis
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Powered by</div>
            <div className="text-lg font-semibold text-purple-600">Perplexity AI</div>
            <div className="text-xs text-purple-600 mt-1">Advanced AI Analysis</div>
          </div>
        </div>
        
        {/* Analysis Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">{companies.length}</div>
            <div className="text-sm text-gray-600">Brands Analyzed</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">{categories.length}</div>
            <div className="text-sm text-gray-600">Categories Compared</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">{totalComparisons}</div>
            <div className="text-sm text-gray-600">Total Comparisons</div>
          </div>
        </div>

        {/* Winner Highlight */}
        {bestBrand && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-2xl">🏆</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Overall Winner</h3>
                <p className="text-gray-700">
                  <span className="font-bold text-yellow-700 text-xl">{bestBrand}</span> performed best across all categories 
                  with an average rank of <span className="font-bold text-yellow-700 text-xl">{bestRank.toFixed(1)}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Based on comprehensive AI analysis of {categories.length} categories
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category-by-Category Analysis */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">📊 Category-by-Category Analysis</h3>
          <p className="text-sm text-gray-600">Detailed rankings and AI reasoning for each category</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {categories.map(category => {
            const categoryData = results[category];
            if (!categoryData) return null;

            const categoryRankings = categoryData.rankings;
            const reason = categoryData.reason;
            
            if (!categoryRankings || typeof categoryRankings !== 'object') return null;
            
            const sortedBrandsInCategory = Object.entries(categoryRankings)
              .sort(([,a], [,b]) => a - b);
            const winner = sortedBrandsInCategory[0];

            return (
              <div key={category} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 capitalize">{category}</h4>
                  <span className="text-sm text-gray-500">
                    {Object.keys(categoryRankings).length} brands compared
                  </span>
                </div>
                
                {/* AI Reasoning */}
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-lg">🤖</span>
                    </div>
                    <div className="flex-1">
                      <h6 className="font-semibold text-blue-900 mb-2 text-lg">Perplexity AI Analysis</h6>
                      <p className="text-blue-800 text-base leading-relaxed">{reason}</p>
                      <div className="mt-2 text-xs text-blue-600">
                        💡 Based on real-time web search and comprehensive brand analysis
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rankings */}
                <div className="space-y-2">
                  {sortedBrandsInCategory.map(([brand, rank], index) => (
                    <div key={brand} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          rank === 1 ? 'bg-green-100 text-green-800' :
                          rank === 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rank}
                        </div>
                        <span className="font-medium text-gray-900">{brand}</span>
                        {brand === winner[0] && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🥇 Winner
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Rank {rank} of {Object.keys(categoryRankings).length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Analysis Component */}
      <DetailedAnalysis experiment={experiment} />

      {/* Data Visualization */}
      <DataVisualization
        rankings={results}
        averageRanks={average_ranks}
        companies={companies}
        categories={categories}
        onCellClick={onCellClick}
      />

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">📈 Summary Comparison Table</h3>
          <p className="text-sm text-gray-600">Average rankings across all categories</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BRAND
                </th>
                {categories.map(category => (
                  <th key={category} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {category.toUpperCase()}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OVERALL RANK
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map(company => (
                <tr key={company} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {company}
                  </td>
                  {categories.map(category => {
                    const categoryData = results[category];
                    const rank = categoryData?.rankings?.[company];
                    
                    return (
                      <td key={category} className="px-6 py-4 whitespace-nowrap text-center">
                        {rank ? (
                          <div className="flex items-center justify-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rank === 1 ? 'bg-green-100 text-green-800' :
                              rank === 2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {rank}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-purple-700">
                    {average_ranks[company] ? average_ranks[company].toFixed(1) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Perplexity AI Branding Footer */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm">🤖</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-800">Powered by Perplexity AI</p>
              <p className="text-xs text-purple-600">Advanced AI-powered brand analysis and ranking</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-purple-600">Data extracted from Perplexity API</p>
            <p className="text-xs text-purple-600">Detail ranking analysis</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Rank 1 = Best Performance</span>
          <span>Lower Average Rank = Better Overall</span>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable; 