import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ExperimentResult } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SimpleBarChartProps {
  experiment: ExperimentResult;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ experiment }) => {
  if (!experiment || !experiment.results) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Chart Data</h3>
        <p className="text-gray-600">Create a comparison to see the chart</p>
      </div>
    );
  }

  const brands = experiment.companies;
  const averageRanks = experiment.average_ranks;

  // Find the best performing brand
  const bestBrand = Object.entries(averageRanks).reduce((best, [brand, rank]) => 
    rank < best.rank ? { brand, rank } : best
  , { brand: '', rank: Infinity });

  const chartData = {
    labels: brands,
    datasets: [
      {
        label: 'Average Rank',
        data: brands.map(brand => averageRanks[brand] || 0),
        backgroundColor: brands.map(brand => 
          brand === bestBrand.brand ? '#10B981' : '#3B82F6'
        ),
        borderColor: brands.map(brand => 
          brand === bestBrand.brand ? '#10B981' : '#3B82F6'
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Average Ranks Across All Categories',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Average Rank: ${context.parsed.y.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      y: {
        reverse: true,
        min: 0,
        max: Math.max(...Object.values(averageRanks)) + 1,
        title: {
          display: true,
          text: 'Rank (Lower is Better)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Brands',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Average Rankings Chart</h2>
        <p className="text-sm text-gray-600">
          Shows the average rank of each brand across all categories. Lower rank = better performance.
        </p>
      </div>
      
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>🏆 {bestBrand.brand}</strong> is the best overall performer with an average rank of {bestBrand.rank.toFixed(1)}
        </p>
      </div>
    </div>
  );
};

export default SimpleBarChart; 