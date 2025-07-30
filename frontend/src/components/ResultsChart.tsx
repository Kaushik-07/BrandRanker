import React, { useState, useMemo } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import RadarChart from './RadarChart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ResultsChartProps {
  experiment: any;
  animationDelay?: number;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ experiment, animationDelay = 0 }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'doughnut' | 'radar'>('bar');

  // Prepare data for different chart types
  const chartData = useMemo(() => {
    const categories = Object.keys(experiment.results);
    const companies = experiment.companies;
    
    const datasets = categories.map((category, index) => {
      const rankings = experiment.results[category]?.rankings || [];
      const data = companies.map((company: string) => {
        const ranking = rankings.find((r: any) => r.company === company);
        return ranking ? ranking.rank : 0;
      });
      
      return {
        label: category,
        data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ][index % 5],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ][index % 5],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      };
    });

    return {
      labels: companies,
      datasets,
    };
  }, [experiment]);

  // Average ranking data for line chart
  const averageData = useMemo(() => {
    const companies = experiment.companies;
    const categories = Object.keys(experiment.results);
    
    const datasets = companies.map((company: string, index: number) => {
      const data = categories.map(category => {
        const rankings = experiment.results[category]?.rankings || [];
        const ranking = rankings.find((r: any) => r.company === company);
        return ranking ? ranking.rank : 0;
      });
      
      return {
        label: company,
        data,
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ][index % 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.1)',
          'rgba(54, 162, 235, 0.1)',
          'rgba(255, 206, 86, 0.1)',
          'rgba(75, 192, 192, 0.1)',
          'rgba(153, 102, 255, 0.1)',
        ][index % 5],
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      };
    });

    return {
      labels: categories,
      datasets,
    };
  }, [experiment]);

  // Performance distribution data for doughnut chart
  const distributionData = useMemo(() => {
    const companies = experiment.companies;
    const averageRanks = Object.values(experiment.average_ranks);
    
    return {
      labels: companies,
      datasets: [{
        data: averageRanks,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
      }],
    };
  }, [experiment]);

  const getChartOptions = (type: 'bar' | 'line' | 'doughnut' | 'radar') => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            padding: 20,
            font: {
              size: 12,
              weight: 'bold' as const,
            },
          },
        },
        tooltip: {
          callbacks: {
            title: (context: any) => {
              if (type === 'bar') {
                return `Ranking: ${context[0].label}`;
              } else if (type === 'line') {
                return `Category: ${context[0].label}`;
              } else {
                return context[0].label;
              }
            },
            label: (context: any) => {
              if (type === 'bar') {
                const rank = context.parsed.y;
                const category = context.dataset.label;
                return `${category}: Rank ${rank}`;
              } else if (type === 'line') {
                const rank = context.parsed.y;
                const company = context.dataset.label;
                return `${company}: Rank ${rank}`;
              } else {
                const rank = context.parsed;
                return `Average Rank: ${rank}`;
              }
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
    };

    if (type === 'bar') {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          title: {
            display: true,
            text: 'Brand Rankings by Category',
            font: {
              size: 16,
              weight: 'bold' as const,
            },
            padding: {
              top: 10,
              bottom: 20,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            reverse: true,
            title: {
              display: true,
              text: 'Rank (1 = Best)',
              font: {
                size: 12,
                weight: 'bold' as const,
              },
            },
            ticks: {
              stepSize: 1,
              font: {
                size: 12,
              },
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Brands',
              font: {
                size: 12,
                weight: 'bold' as const,
              },
            },
            ticks: {
              font: {
                size: 12,
                weight: 'bold' as const,
              },
            },
            grid: {
              display: false,
            },
          },
        },
      };
    } else if (type === 'line') {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          title: {
            display: true,
            text: 'Brand Performance Across Categories',
            font: {
              size: 16,
              weight: 'bold' as const,
            },
            padding: {
              top: 10,
              bottom: 20,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            reverse: true,
            title: {
              display: true,
              text: 'Rank (1 = Best)',
              font: {
                size: 12,
                weight: 'bold' as const,
              },
            },
            ticks: {
              stepSize: 1,
              font: {
                size: 12,
              },
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Categories',
              font: {
                size: 12,
                weight: 'bold' as const,
              },
            },
            ticks: {
              font: {
                size: 12,
                weight: 'bold' as const,
              },
            },
            grid: {
              display: false,
            },
          },
        },
      };
    } else {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          title: {
            display: true,
            text: 'Overall Performance Distribution',
            font: {
              size: 16,
              weight: 'bold' as const,
            },
            padding: {
              top: 10,
              bottom: 20,
            },
          },
        },
      };
    }
  };

  const renderChart = () => {
    const options = getChartOptions(chartType);
    
    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={averageData} options={options} />;
      case 'doughnut':
        return <Doughnut data={distributionData} options={options} />;
      case 'radar':
        return <RadarChart experiment={experiment} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <div 
      className="h-96 relative overflow-hidden"
      style={{
        animationDelay: `${animationDelay}ms`,
        animation: 'fadeInUp 0.8s ease-out forwards',
      }}
    >
      {/* Chart Type Selector */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex space-x-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <button
            onClick={() => setChartType('bar')}
            className={`p-2 rounded-md transition-all duration-200 ${
              chartType === 'bar' 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Bar Chart"
          >
            📊
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-2 rounded-md transition-all duration-200 ${
              chartType === 'line' 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Line Chart"
          >
            📈
          </button>
          <button
            onClick={() => setChartType('doughnut')}
            className={`p-2 rounded-md transition-all duration-200 ${
              chartType === 'doughnut' 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Doughnut Chart"
          >
            🍩
          </button>
          <button
            onClick={() => setChartType('radar')}
            className={`p-2 rounded-md transition-all duration-200 ${
              chartType === 'radar' 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Radar Chart"
          >
            📊
          </button>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-sm font-semibold text-gray-700 mb-1">
            Performance Summary
          </div>
          <div className="text-xs text-gray-600">
            {experiment.companies.length} brands • {Object.keys(experiment.results).length} categories
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full h-full">
        {renderChart()}
      </div>

      {/* Detailed Legend */}
      <div className="mt-4 p-4 bg-white/50 backdrop-blur-sm rounded-lg">
        <div className="text-sm font-semibold text-gray-700 mb-2">Chart Legend</div>
        <div className="text-xs text-gray-600 space-y-1">
          {chartType === 'bar' && (
            <div>
              • <strong>Bar Chart:</strong> Shows rankings for each brand across all categories
            </div>
          )}
          {chartType === 'line' && (
            <div>
              • <strong>Line Chart:</strong> Shows how each brand performs across different categories
            </div>
          )}
          {chartType === 'doughnut' && (
            <div>
              • <strong>Doughnut Chart:</strong> Shows overall performance distribution
            </div>
          )}
          {chartType === 'radar' && (
            <div>
              • <strong>Radar Chart:</strong> Shows how each brand performs across different categories
            </div>
          )}
          <div>• <strong>Rank 1:</strong> Best performance • <strong>Higher ranks:</strong> Lower performance</div>
        </div>
      </div>
    </div>
  );
};

export default ResultsChart; 