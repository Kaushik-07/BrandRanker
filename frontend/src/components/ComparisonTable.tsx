import React, { useState, useMemo } from 'react';
import { ComparisonTableProps } from '../types';

type SortField = 'brand' | 'avgRank' | string;
type SortDirection = 'asc' | 'desc';

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data, categories, onCellClick }) => {
  const [sortField, setSortField] = useState<SortField>('avgRank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Calculate average ranks
  const getAverageRanks = (data: any[], categories: string[]) => {
    return data.map(entry => {
      const avgRank = categories.length > 0
        ? categories.reduce((acc, cat) => acc + (Number(entry[cat]) || 0), 0) / categories.length
        : 0;
      return { ...entry, avgRank: Number(avgRank.toFixed(2)) };
    });
  };

  const averageData = getAverageRanks(data || [], categories);

  // Sorting logic - moved before early return
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return [...averageData].sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortField === 'brand') {
        aValue = a.brand.toLowerCase();
        bValue = b.brand.toLowerCase();
      } else if (sortField === 'avgRank') {
        aValue = a.avgRank;
        bValue = b.avgRank;
      } else {
        aValue = Number(a[sortField]) || 0;
        bValue = Number(b[sortField]) || 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [averageData, sortField, sortDirection]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Comparison Data</h3>
          <p className="text-sm text-gray-500">Create a comparison to see rankings</p>
        </div>
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'bg-green-100 text-green-800 hover:bg-green-200';
    if (rank === 2) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    return 'bg-red-100 text-red-800 hover:bg-red-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 font-['Inter']">📊 Brand Comparison Table</h3>
            <p className="text-sm text-gray-600">Click any cell to see AI reasoning</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Powered by Perplexity AI
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 font-['Inter']">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('brand')}
              >
                <div className="flex items-center gap-1">
                  BRAND {getSortIcon('brand')}
                </div>
              </th>
              {categories.map(category => (
                <th 
                  key={category} 
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(category)}
                >
                  <div className="flex items-center justify-center gap-1">
                    {category.toUpperCase()} {getSortIcon(category)}
                  </div>
                </th>
              ))}
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('avgRank')}
              >
                <div className="flex items-center justify-center gap-1">
                  AVG RANK {getSortIcon('avgRank')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, rowIndex) => {
              const isWinner = row.avgRank === Math.min(...sortedData.map(r => r.avgRank));
              
              return (
                <tr 
                  key={row.brand} 
                  className={`hover:bg-gray-50 transition-all duration-200 ${isWinner ? 'bg-yellow-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="font-['Inter']">{row.brand}</span>
                      {isWinner && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                          🏆 Winner
                        </span>
                      )}
                    </div>
                  </td>
                  {categories.map(category => {
                    const rank = Number(row[category]) || 0;
                    const isCategoryWinner = rank === 1;
                    
                    return (
                      <td key={category} className="px-6 py-4 whitespace-nowrap text-center">
                        {rank > 0 ? (
                          <button
                            onClick={() => onCellClick?.(row.brand, category)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium hover:scale-110 transition-all duration-200 cursor-pointer shadow-sm ${getRankClass(rank)}`}
                          >
                            {rank}
                            {isCategoryWinner && (
                              <span className="ml-1 text-xs">🥇</span>
                            )}
                            <span className="ml-1 text-xs">💡</span>
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`font-bold text-lg transition-colors duration-200 ${
                        isWinner ? 'text-yellow-700' : 'text-purple-700'
                      }`}>
                        {row.avgRank}
                      </span>
                      {isWinner && (
                        <span className="text-yellow-600 text-lg animate-bounce">🏆</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Rank 1 = Best Performance</span>
            <span>Lower Average Rank = Better Overall</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              🥇 Category Winner
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              🏆 Overall Winner
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable; 