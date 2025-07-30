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
import { ComparisonChartProps } from '../types';

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

const ComparisonChart: React.FC<ComparisonChartProps> = ({ data, categories, onBarClick }) => {
  if (!data || data.length === 0) {
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

  // Calculate average ranks
  const getAverageRanks = (data: any[], categories: string[]) => {
    return data.map(entry => {
      const avgRank = categories.length > 0
        ? categories.reduce((acc, cat) => acc + (Number(entry[cat]) || 0), 0) / categories.length
        : 0;
      return { ...entry, avgRank: Number(avgRank.toFixed(2)) };
    });
  };

  const averageData = getAverageRanks(data, categories);
  const maxRank = Math.max(...categories.map(cat => 
    Math.max(...data.map(item => Number(item[cat]) || 0))
  ), 1);

  // Generate colors for brands
  const generateColors = (count: number) => {
    const colors = [
      '#4CAF50', '#2196F3', '#FF5722', '#9C27B0', '#FF9800',
      '#795548', '#607D8B', '#E91E63', '#00BCD4', '#8BC34A'
    ];
    return colors.slice(0, count);
  };

  // Prepare data for average ranks bar chart
  const averageRanksData = {
    labels: averageData.map(item => item.brand),
    datasets: [
      {
        label: 'Average Rank',
        data: averageData.map(item => item.avgRank),
        backgroundColor: averageData.map((item, index) => {
          const rank = item.avgRank;
          if (rank <= 1.5) return '#4CAF50'; // Green for winners
          if (rank <= 2.5) return '#FFEB3B'; // Yellow for mid
          return '#FF5722'; // Red for low
        }),
        borderColor: averageData.map((item, index) => {
          const rank = item.avgRank;
          if (rank <= 1.5) return '#4CAF50';
          if (rank <= 2.5) return '#FFEB3B';
          return '#FF5722';
        }),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Prepare data for grouped bar chart (per category)
  const groupedBarData = {
    labels: averageData.map(item => item.brand),
    datasets: categories.map((category, index) => ({
      label: category,
      data: averageData.map(item => Number(item[category]) || 0),
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
    datasets: averageData.map((brand, index) => ({
      label: brand.brand,
      data: categories.map(category => Number(brand[category]) || 0),
      borderColor: generateColors(averageData.length)[index],
      backgroundColor: generateColors(averageData.length)[index] + '20',
      borderWidth: 3,
      pointBackgroundColor: generateColors(averageData.length)[index],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: generateColors(averageData.length)[index],
      pointRadius: 4,
      pointHoverRadius: 6,
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
        text: 'Brand Rankings',
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#4CAF50',
        borderWidth: 1,
        callbacks: {
          afterLabel: function(context: any) {
            if (onBarClick) {
              return 'Click for AI reasoning';
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
        max: maxRank + 1,
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
        const brand = averageData[element.index]?.brand;
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
        text: 'Multi-Category Analysis',
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#4CAF50',
        borderWidth: 1,
        callbacks: {
          afterLabel: function(context: any) {
            if (onBarClick) {
              return 'Click for AI reasoning';
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
        max: maxRank + 1,
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
        const brand = averageData[element.datasetIndex]?.brand;
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
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 font-['Inter']">📈 Brand Comparison Charts</h3>
            <p className="text-sm text-gray-600">Click on bars to see AI reasoning</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-purple-600">Powered by Perplexity AI</div>
            <div className="text-xs text-purple-600">Real-time analysis</div>
          </div>
        </div>
      </div>

      {/* Average Ranks Bar Chart */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 font-['Inter']">
            Average Rankings
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Lower = Better
            </span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Click bars for AI reasoning
            </span>
          </div>
        </div>
        <div className="h-64">
          <Bar data={averageRanksData} options={chartOptions} />
        </div>
      </div>

      {/* Radar Chart for Multi-Category Analysis */}
      {categories.length > 1 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 font-['Inter']">
              Multi-Category Analysis
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {categories.length} Categories
              </span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                Click points for AI reasoning
              </span>
            </div>
          </div>
          <div className="h-64">
            <Radar data={radarChartData} options={radarOptions} />
          </div>
        </div>
      )}

      {/* Grouped Bar Chart for Categories */}
      {categories.length > 1 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 font-['Inter']">
              Per-Category Rankings
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {categories.length} Categories
              </span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                Click bars for AI reasoning
              </span>
            </div>
          </div>
          <div className="h-64">
            <Bar data={groupedBarData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>Rank 1 = Best Performance</span>
            <span>Lower Average Rank = Better Overall</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              🥇 Winners (Green)
            </span>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              🥈 Mid-tier (Yellow)
            </span>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              🥉 Lower (Red)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonChart; 