import React from 'react';

interface LoadingSkeletonProps {
  type?: 'table' | 'chart' | 'card';
  rows?: number;
  columns?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'card', 
  rows = 3, 
  columns = 4 
}) => {
  if (type === 'table') {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: columns + 1 }).map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: columns + 1 }).map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton; 