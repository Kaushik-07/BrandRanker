import React, { useState, useMemo } from 'react';
import { ExperimentResult } from '../types';

interface ProfessionalRankingTableProps {
  experiment: ExperimentResult;
  onCellClick?: (brand: string, category: string) => void;
}

type SortField = 'brand' | 'avgRank' | string;
type SortDirection = 'asc' | 'desc';

interface TableRow {
  brand: string;
  avgRank: number;
  [category: string]: number | string;
}

const ProfessionalRankingTable: React.FC<ProfessionalRankingTableProps> = ({ 
  experiment, 
  onCellClick 
}) => {
  const [sortField, setSortField] = useState<SortField>('avgRank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Transform data for table display - moved before early return
  const tableData = useMemo(() => {
    if (!experiment || !experiment.results) return [];
    
    const brands = experiment.companies;
    const categories = experiment.categories;
    const data: TableRow[] = [];

    brands.forEach(brand => {
      const row: TableRow = { brand, avgRank: 0 };
      
      // Add category rankings
      categories.forEach(category => {
        const categoryData = experiment.results[category];
        if (categoryData && categoryData.rankings) {
          row[category] = categoryData.rankings[brand] || 0;
        } else {
          row[category] = 0;
        }
      });
      
      // Add average rank
      row.avgRank = experiment.average_ranks[brand] || 0;
      
      data.push(row);
    });

    return data;
  }, [experiment]);

  // Sorting logic - moved before early return
  const sortedData = useMemo(() => {
    if (!experiment || !experiment.results) return [];
    
    return [...tableData].sort((a, b) => {
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
  }, [tableData, sortField, sortDirection]);

  if (!experiment || !experiment.results) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Ranking Data</h3>
          <p className="text-sm text-gray-500">Create a comparison to see detailed rankings</p>
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
    if (rank === 1) return 'bg-green-100 text-green-800 border-green-200';
    if (rank === 2) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (rank === 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const getOverallWinner = () => {
    return sortedData.reduce((winner, current) => 
      current.avgRank < winner.avgRank ? current : winner
    );
  };

  const overallWinner = getOverallWinner();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 font-['Inter']">📊 Brand Ranking Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">Powered by Perplexity AI • Click any cell for detailed reasoning</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                🏆 {overallWinner.brand} Wins
              </span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                Avg: {overallWinner.avgRank.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 font-['Inter']">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('brand')}
              >
                <div className="flex items-center gap-2">
                  <span>BRAND</span>
                  <span className="text-gray-400">{getSortIcon('brand')}</span>
                </div>
              </th>
              {experiment.categories.map(category => (
                <th 
                  key={category} 
                  className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(category)}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>{category.toUpperCase()}</span>
                    <span className="text-gray-400">{getSortIcon(category)}</span>
                  </div>
                </th>
              ))}
              <th 
                className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('avgRank')}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>OVERALL RANK</span>
                  <span className="text-gray-400">{getSortIcon('avgRank')}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, rowIndex) => {
              const isWinner = row.avgRank === overallWinner.avgRank;
              
              return (
                <tr 
                  key={row.brand} 
                  className={`hover:bg-gray-50 transition-all duration-200 ${
                    isWinner ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isWinner ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rowIndex + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{row.brand}</div>
                        {isWinner && (
                          <div className="text-xs text-yellow-700 font-medium">🏆 Overall Winner</div>
                        )}
                      </div>
                    </div>
                  </td>
                  {experiment.categories.map(category => {
                    const rank = Number(row[category]) || 0;
                    
                    return (
                      <td key={category} className="px-6 py-4 whitespace-nowrap text-center">
                        {rank > 0 ? (
                          <button
                            onClick={() => onCellClick?.(row.brand, category)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border-2 hover:scale-105 transition-all duration-200 cursor-pointer ${getRankClass(rank)}`}
                          >
                            <span className="text-lg">{getRankBadge(rank)}</span>
                            <span className="font-bold">{rank}</span>
                            <span className="text-xs opacity-75">💡</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`px-3 py-1.5 rounded-lg font-bold text-lg ${
                        isWinner ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {row.avgRank.toFixed(1)}
                      </div>
                      {isWinner && (
                        <span className="text-yellow-600 text-xl animate-pulse">🏆</span>
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
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-100 border border-green-200 rounded"></span>
              <span>1st Place</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></span>
              <span>2nd Place</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></span>
              <span>3rd Place</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">Lower Overall Rank = Better Performance</span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Powered by Perplexity AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalRankingTable; 