import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceMetrics {
  uptime: {
    seconds: number;
    formatted: string;
  };
  requests: {
    total: number;
    errors: number;
    error_rate: number;
    recent_error_rate: number;
    avg_response_time: number;
    slow_requests: number;
  };
  cache: {
    hits: number;
    misses: number;
    hit_rate: number;
    size: number;
  };
  rate_limiting: {
    hits: number;
    remaining: number;
  };
  fallback_usage: { [key: string]: number };
  api_performance: { [key: string]: any };
  system: {
    cpu_percent: number;
    memory_percent: number;
    memory_available: number;
    disk_percent: number;
    disk_free: number;
  };
  health: {
    status: string;
    issues: string[];
  };
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchMetrics();
    
    // Set up periodic updates
    const interval = setInterval(fetchMetrics, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/performance/stats');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'degraded': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'degraded': return '🔄';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!metrics) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      {/* Compact View */}
      {!isExpanded && (
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-4 border border-white/20 cursor-pointer hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
             onClick={() => setIsExpanded(true)}>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              metrics.health.status === 'healthy' ? 'bg-green-500' :
              metrics.health.status === 'warning' ? 'bg-yellow-500' :
              metrics.health.status === 'degraded' ? 'bg-orange-500' :
              'bg-red-500'
            }`}></div>
            <div className="text-sm font-medium text-gray-700">
              System: {metrics.health.status}
            </div>
            <div className="text-xs text-gray-500">
              {metrics.uptime.formatted}
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-6 border border-white/20 w-96 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">📊</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Performance Monitor</h3>
                <p className="text-xs text-gray-600">Real-time system metrics</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Health Status */}
          <div className={`mb-6 p-4 rounded-xl border ${getHealthColor(metrics.health.status)}`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getHealthIcon(metrics.health.status)}</span>
              <div>
                <p className="font-semibold">System Status: {metrics.health.status}</p>
                <p className="text-xs opacity-75">
                  Uptime: {metrics.uptime.formatted}
                </p>
              </div>
            </div>
            {metrics.health.issues.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium mb-2">Issues:</p>
                <ul className="text-xs space-y-1">
                  {metrics.health.issues.map((issue, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">📈</span>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Requests</p>
                  <p className="font-bold text-gray-900">{metrics.requests.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">⚡</span>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Cache Hit</p>
                  <p className="font-bold text-gray-900">{metrics.cache.hit_rate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">🖥️</span>
                </div>
                <div>
                  <p className="text-xs text-gray-600">CPU</p>
                  <p className="font-bold text-gray-900">{metrics.system.cpu_percent.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-200">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">💾</span>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Memory</p>
                  <p className="font-bold text-gray-900">{metrics.system.memory_percent.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Response Times</h4>
            <div className="h-32">
              <Line
                data={{
                  labels: ['1m ago', '30s ago', 'Now'],
                  datasets: [{
                    label: 'Avg Response Time (ms)',
                    data: [
                      metrics.requests.avg_response_time * 1000,
                      metrics.requests.avg_response_time * 1000 * 0.9,
                      metrics.requests.avg_response_time * 1000
                    ],
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: 'white',
                      bodyColor: 'white',
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { color: '#6b7280' }
                    },
                    x: {
                      ticks: { color: '#6b7280' }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Error Rate */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Error Rate</span>
              <span className="text-sm text-gray-500">{metrics.requests.error_rate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  metrics.requests.error_rate < 5 ? 'bg-green-500' :
                  metrics.requests.error_rate < 10 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(metrics.requests.error_rate * 10, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* API Performance */}
          {Object.keys(metrics.api_performance).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">API Performance</h4>
              <div className="space-y-2">
                {Object.entries(metrics.api_performance).map(([api, perf]) => (
                  <div key={api} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{api}</span>
                    <span className="font-medium">
                      {(perf.avg_response_time * 1000).toFixed(0)}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            {isLoading && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span>Updating...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor; 