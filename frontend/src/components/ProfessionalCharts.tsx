import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import { ExperimentResult } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

interface ProfessionalChartsProps {
  experiment: ExperimentResult;
  onBarClick?: (brand: string, category: string) => void;
}

const ProfessionalCharts: React.FC<ProfessionalChartsProps> = ({ experiment, onBarClick }) => {
  if (!experiment || !experiment.results) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Chart Data</h3>
          <p className="text-sm text-gray-500">Create a comparison to see visualizations</p>
        </div>
      </div>
    );
  }

  const brands = experiment.companies;
  const categories = experiment.categories;
  const averageRanks = experiment.average_ranks;

  // Generate colors for brands
  const generateColors = (count: number) => {
    const colors = [
      '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    return colors.slice(0, count);
  };

  // Prepare data for average ranks bar chart
  const averageRanksData = {
    labels: brands,
    datasets: [
      {
        label: 'Average Rank',
        data: brands.map(brand => averageRanks[brand] || 0),
        backgroundColor: brands.map((brand, index) => {
          const rank = averageRanks[brand] || 0;
          if (rank <= 1.5) return '#10B981'; // Green for winners
          if (rank <= 2.5) return '#3B82F6'; // Blue for mid
          return '#EF4444'; // Red for lower
        }),
        borderColor: brands.map((brand, index) => {
          const rank = averageRanks[brand] || 0;
          if (rank <= 1.5) return '#10B981';
          if (rank <= 2.5) return '#3B82F6';
          return '#EF4444';
        }),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  // Prepare data for grouped bar chart (per category)
  const groupedBarData = {
    labels: brands,
    datasets: categories.map((category, index) => ({
      label: category,
      data: brands.map(brand => {
        const categoryData = experiment.results[category];
        return categoryData && categoryData.rankings ? (categoryData.rankings[brand] || 0) : 0;
      }),
      backgroundColor: generateColors(categories.length)[index] + '80',
      borderColor: generateColors(categories.length)[index],
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false,
    })),
  };

  // Prepare data for radar chart (multi-category analysis)
  const radarChartData = {
    labels: categories,
    datasets: brands.map((brand, index) => ({
      label: brand,
      data: categories.map(category => {
        const categoryData = experiment.results[category];
        return categoryData && categoryData.rankings ? (categoryData.rankings[brand] || 0) : 0;
      }),
      borderColor: generateColors(brands.length)[index],
      backgroundColor: generateColors(brands.length)[index] + '20',
      borderWidth: 3,
      pointBackgroundColor: generateColors(brands.length)[index],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: generateColors(brands.length)[index],
      pointRadius: 5,
      pointHoverRadius: 8,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Brand Performance Analysis',
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#10B981',
        borderWidth: 1,
        callbacks: {
          afterLabel: function(context: any) {
            if (onBarClick) {
              return 'Click for detailed AI reasoning';
            }
            return '';
          }
        }
      }
    },
    scales: {
      y: {
        reverse: true,
        min: 0,
        max: Math.max(...Object.values(averageRanks)) + 1,
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    onClick: (event: any, elements: any) => {
      if (onBarClick && elements.length > 0) {
        const element = elements[0];
        const brand = brands[element.index];
        const category = element.datasetIndex === 0 ? 'Average' : categories[element.datasetIndex - 1];
        if (brand && category) {
          onBarClick(brand, category);
        }
      }
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Multi-Category Brand Performance',
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#10B981',
        borderWidth: 1,
        callbacks: {
          afterLabel: function(context: any) {
            if (onBarClick) {
              return 'Click for detailed AI reasoning';
            }
            return '';
          }
        }
      }
    },
    scales: {
      r: {
        reverse: true,
        min: 0,
        max: Math.max(...Object.values(averageRanks)) + 1,
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          stepSize: 1,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
      },
    },
    onClick: (event: any, elements: any) => {
      if (onBarClick && elements.length > 0) {
        const element = elements[0];
        const brand = brands[element.datasetIndex];
        const category = categories[element.index];
        if (brand && category) {
          onBarClick(brand, category);
        }
      }
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 font-['Inter']">📈 Data Visualization</h3>
            <p className="text-sm text-gray-600 mt-1">Interactive charts powered by Perplexity AI analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              {brands.length} Brands
            </span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
              {categories.length} Categories
            </span>
          </div>
        </div>
      </div>

      {/* Average Rankings Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 font-['Inter']">Overall Performance</h3>
            <p className="text-sm text-gray-600">Average rankings across all categories</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Lower = Better
            </span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Click bars for AI reasoning
            </span>
          </div>
        </div>
        <div className="h-80">
          <Bar data={averageRanksData} options={chartOptions} />
        </div>
      </div>

      {/* Radar Chart for Multi-Category Analysis */}
      {categories.length > 1 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 font-['Inter']">Multi-Category Analysis</h3>
              <p className="text-sm text-gray-600">Brand performance across different market segments</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {categories.length} Categories
              </span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                Click points for AI reasoning
              </span>
            </div>
          </div>
          <div className="h-80">
            <Radar data={radarChartData} options={radarOptions} />
          </div>
        </div>
      )}

      {/* Per-Category Rankings */}
      {categories.length > 1 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 font-['Inter']">Category-by-Category Rankings</h3>
              <p className="text-sm text-gray-600">Detailed performance breakdown by market segment</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {categories.length} Categories
              </span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                Click bars for AI reasoning
              </span>
            </div>
          </div>
          <div className="h-80">
            <Bar data={groupedBarData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Chart Legend */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded"></span>
              <span>Top Performers (Rank 1-1.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded"></span>
              <span>Mid-tier (Rank 1.5-2.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              <span>Lower Rank (Rank 2.5+)</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">Lower Rank = Better Performance</span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Powered by Perplexity AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCharts; 