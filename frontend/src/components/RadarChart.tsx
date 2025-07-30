import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  experiment: any;
}

const RadarChart: React.FC<RadarChartProps> = ({ experiment }) => {
  const categories = Object.keys(experiment.results);
  const companies = experiment.companies;

  const chartData = {
    labels: categories,
    datasets: companies.map((company: string, index: number) => {
      const data = categories.map(category => {
        const rankings = experiment.results[category]?.rankings || [];
        const ranking = rankings.find((r: any) => r.company === company);
        return ranking ? ranking.rank : 0;
      });

      const colors = [
        { border: 'rgba(255, 99, 132, 1)', background: 'rgba(255, 99, 132, 0.2)' },
        { border: 'rgba(54, 162, 235, 1)', background: 'rgba(54, 162, 235, 0.2)' },
        { border: 'rgba(255, 206, 86, 1)', background: 'rgba(255, 206, 86, 0.2)' },
        { border: 'rgba(75, 192, 192, 1)', background: 'rgba(75, 192, 192, 0.2)' },
        { border: 'rgba(153, 102, 255, 1)', background: 'rgba(153, 102, 255, 0.2)' },
      ];

      return {
        label: company,
        data,
        borderColor: colors[index % colors.length].border,
        backgroundColor: colors[index % colors.length].background,
        borderWidth: 2,
        pointBackgroundColor: colors[index % colors.length].border,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors[index % colors.length].border,
      };
    }),
  };

  const options = {
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
      tooltip: {
        callbacks: {
          title: (context: any) => {
            return `Category: ${context[0].label}`;
          },
          label: (context: any) => {
            const rank = context.parsed.r;
            const company = context.dataset.label;
            return `${company}: Rank ${rank}`;
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        reverse: true,
        min: 0,
        max: Math.max(...companies.map((company: string) => {
          const maxRank = Math.max(...categories.map(category => {
            const rankings = experiment.results[category]?.rankings || [];
            const ranking = rankings.find((r: any) => r.company === company);
            return ranking ? ranking.rank : 0;
          }));
          return maxRank;
        }), 3),
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
          },
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Radar data={chartData} options={options} />
    </div>
  );
};

export default RadarChart; 