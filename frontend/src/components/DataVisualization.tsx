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

interface RankingData {
  [category: string]: {
    rankings: { [brand: string]: number };
    reason: string;
  };
}

interface AverageRanks {
  [brand: string]: number;
}

interface DataVisualizationProps {
  rankings: RankingData;
  averageRanks: AverageRanks;
  companies: string[];
  categories: string[];
  onCellClick?: (brand: string, category: string) => void;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({
  rankings,
  averageRanks,
  companies,
  categories,
  onCellClick,
}) => {
  // Safely handle null/undefined data
  if (!rankings || !averageRanks || !companies || !categories) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
        <p className="text-gray-500">Chart data is being processed...</p>
      </div>
    );
  }

  // Generate colors for brands
  const generateColors = (count: number) => {
    const colors = [
      '#4CAF50', '#2196F3', '#FF5722', '#9C27B0', '#FF9800',
      '#795548', '#607D8B', '#E91E63', '#00BCD4', '#8BC34A'
    ];
    return colors.slice(0, count);
  };

  // Prepare data for bar chart (first category)
  const firstCategory = categories[0];
  const barChartData = firstCategory ? {
    labels: companies,
    datasets: [
      {
        label: firstCategory,
        data: companies.map(brand => {
          const categoryData = rankings[firstCategory];
          return categoryData?.rankings?.[brand] || 0;
        }),
        backgroundColor: generateColors(companies.length),
        borderColor: generateColors(companies.length).map(color => color + '80'),
        borderWidth: 1,
      },
    ],
  } : null;

  // Prepare data for radar chart (multi-category)
  const radarChartData = {
    labels: categories,
    datasets: companies.map((brand, index) => ({
      label: brand,
      data: categories.map(category => {
        const categoryData = rankings[category];
        return categoryData?.rankings?.[brand] || 0;
      }),
      borderColor: generateColors(companies.length)[index],
      backgroundColor: generateColors(companies.length)[index] + '20',
      borderWidth: 2,
      pointBackgroundColor: generateColors(companies.length)[index],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: generateColors(companies.length)[index],
    })),
  };

  // Prepare data for average ranks bar chart
  const averageRanksData = {
    labels: companies,
    datasets: [
      {
        label: 'Average Rank',
        data: companies.map(brand => averageRanks[brand] || 0),
        backgroundColor: companies.map((_, index) => {
          const rank = averageRanks[companies[index]] || 0;
          if (rank <= 1.5) return '#4CAF50'; // Green for winners
          if (rank <= 2.5) return '#FFEB3B'; // Yellow for mid
          return '#FF5722'; // Red for low
        }),
        borderColor: companies.map((_, index) => {
          const rank = averageRanks[companies[index]] || 0;
          if (rank <= 1.5) return '#4CAF50';
          if (rank <= 2.5) return '#FFEB3B';
          return '#FF5722';
        }),
        borderWidth: 1,
      },
    ],
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
        callbacks: {
          afterLabel: function(context: any) {
            if (onCellClick && context.dataIndex !== undefined) {
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
        max: Math.max(...companies.map(brand => averageRanks[brand] || 0), 1) + 1,
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
      },
    },
    onClick: (event: any, elements: any) => {
      if (onCellClick && elements.length > 0) {
        const element = elements[0];
        const brand = companies[element.index];
        const category = firstCategory;
        if (brand && category) {
          onCellClick(brand, category);
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
        callbacks: {
          afterLabel: function(context: any) {
            if (onCellClick) {
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
        max: Math.max(...categories.map(cat => {
          const categoryData = rankings[cat];
          if (!categoryData?.rankings) return 0;
          return Math.max(...Object.values(categoryData.rankings));
        }), 1) + 1,
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
      },
    },
    onClick: (event: any, elements: any) => {
      if (onCellClick && elements.length > 0) {
        const element = elements[0];
        const brand = companies[element.datasetIndex];
        const category = categories[element.index];
        if (brand && category) {
          onCellClick(brand, category);
        }
      }
    },
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">📊 Interactive Data Visualizations</h3>
            <p className="text-sm text-gray-600">Click on chart elements to see AI reasoning</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-purple-600">Powered by Perplexity AI</div>
            <div className="text-xs text-purple-600">Real-time analysis</div>
          </div>
        </div>
      </div>

      {/* Bar Chart for First Category */}
      {barChartData && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {firstCategory} Rankings
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                Click bars for AI reasoning
              </span>
            </div>
          </div>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Radar Chart for Multi-Category */}
      {categories.length > 1 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Multi-Category Analysis
            </h3>
            <div className="flex items-center gap-2">
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

      {/* Average Ranks Bar Chart */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Average Rankings
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Lower = Better
            </span>
          </div>
        </div>
        <div className="h-64">
          <Bar data={averageRanksData} options={chartOptions} />
        </div>
      </div>

      {/* Legend with Interactive Features */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>Rank 1 = Best Performance</span>
            <span>Lower Average Rank = Better Overall</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              💡 Interactive Charts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization; 