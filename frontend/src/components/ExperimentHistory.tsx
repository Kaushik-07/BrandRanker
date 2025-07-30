import React, { useState, useMemo } from 'react';
import { ExperimentResult } from '../types';

interface ExperimentHistoryProps {
  experiments: ExperimentResult[];
  onSelectExperiment: (experiment: ExperimentResult) => void;
  selectedExperiment: ExperimentResult | null;
}

const ExperimentHistory: React.FC<ExperimentHistoryProps> = ({
  experiments,
  onSelectExperiment,
  selectedExperiment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Filter experiments based on search and filters
  const filteredExperiments = useMemo(() => {
    return experiments
      .filter(experiment => {
        // Search term filter
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' || 
          experiment.companies.some(company => company.toLowerCase().includes(searchLower)) ||
          experiment.categories.some(category => category.toLowerCase().includes(searchLower));

        // Date filter
        const experimentDate = new Date(experiment.created_at);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        let matchesDate = true;
        switch (dateFilter) {
          case 'today':
            matchesDate = experimentDate >= today;
            break;
          case 'week':
            matchesDate = experimentDate >= weekAgo;
            break;
          case 'month':
            matchesDate = experimentDate >= monthAgo;
            break;
          default:
            matchesDate = true;
        }

        // Company filter
        const matchesCompany = companyFilter === '' || 
          experiment.companies.some(company => 
            company.toLowerCase().includes(companyFilter.toLowerCase())
          );

        // Category filter
        const matchesCategory = categoryFilter === '' || 
          experiment.categories.some(category => 
            category.toLowerCase().includes(categoryFilter.toLowerCase())
          );

        return matchesSearch && matchesDate && matchesCompany && matchesCategory;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Newest first
  }, [experiments, searchTerm, dateFilter, companyFilter, categoryFilter]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Experiment ID', 'Companies', 'Categories', 'Average Ranks', 'Created Date'];
    const csvData = filteredExperiments.map(exp => [
      exp.id,
      exp.companies.join(', '),
      exp.categories.join(', '),
      Object.entries(exp.average_ranks).map(([company, rank]) => `${company}: ${rank}`).join(', '),
      new Date(exp.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand_rankings_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const getExperimentSummary = (experiment: ExperimentResult) => {
    const avgRank = Object.values(experiment.average_ranks).reduce((sum, rank) => sum + rank, 0) / Object.keys(experiment.average_ranks).length;
    const bestBrand = Object.entries(experiment.average_ranks).reduce((best, [brand, rank]) => 
      rank < best.rank ? { brand, rank } : best, { brand: '', rank: Infinity }
    );

    return {
      avgRank: avgRank.toFixed(1),
      bestBrand: bestBrand.brand,
      bestRank: bestBrand.rank
    };
  };

  return (
    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Experiment History</h3>
          <p className="text-gray-600">View and analyze your past brand ranking experiments</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {filteredExperiments.length} of {experiments.length} experiments
          </span>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
          >
            📊 Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search companies or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <input
            type="text"
            placeholder="Filter by company..."
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            placeholder="Filter by category..."
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Experiments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredExperiments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>No experiments found matching your filters</p>
          </div>
        ) : (
          filteredExperiments.map((experiment) => {
            const summary = getExperimentSummary(experiment);
            const isSelected = selectedExperiment?.id === experiment.id;

            return (
              <div
                key={experiment.id}
                onClick={() => onSelectExperiment(experiment)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-gray-500">#{experiment.id}</span>
                      <span className="text-xs text-gray-400">{formatDate(experiment.created_at)}</span>
                    </div>
                    <div className="mb-2">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Companies: {experiment.companies.join(', ')}
                      </div>
                      <div className="text-sm text-gray-600">
                        Categories: {experiment.categories.join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-gray-600">
                        Avg Rank: <span className="font-medium">{summary.avgRank}</span>
                      </span>
                      <span className="text-gray-600">
                        Best: <span className="font-medium">{summary.bestBrand}</span> ({summary.bestRank})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      summary.bestRank <= 1.5 ? 'bg-green-500' :
                      summary.bestRank <= 2.5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-gray-400">→</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      {filteredExperiments.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{filteredExperiments.length}</div>
              <div className="text-xs text-gray-600">Total Experiments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(filteredExperiments.reduce((sum, exp) => 
                  sum + Object.values(exp.average_ranks).reduce((a, b) => a + b, 0) / Object.keys(exp.average_ranks).length, 0
                ) / filteredExperiments.length * 10) / 10}
              </div>
              <div className="text-xs text-gray-600">Avg Rank</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(filteredExperiments.flatMap(exp => exp.companies)).size}
              </div>
              <div className="text-xs text-gray-600">Unique Brands</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(filteredExperiments.flatMap(exp => exp.categories)).size}
              </div>
              <div className="text-xs text-gray-600">Unique Categories</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperimentHistory; 