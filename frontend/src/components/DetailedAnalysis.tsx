import React from 'react';

interface DetailedAnalysisProps {
  experiment: any;
}

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ experiment }) => {
  if (!experiment || !experiment.results) return null;

  const getCategoryResults = () => {
    const categories = Object.keys(experiment.results);
    return categories.map(category => experiment.results[category]);
  };

  const categoryResults = getCategoryResults();

  return (
    <div className="space-y-6">
      {categoryResults.map((categoryData: any, categoryIndex: number) => (
        <div key={categoryIndex} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <span className="mr-2">📊</span>
              Detailed Brand Analysis
            </h3>
            <p className="text-purple-100 text-sm mt-1">
              Comprehensive analysis powered by {experiment.results[Object.keys(experiment.results)[0]]?.source || 'AI'}
            </p>
          </div>
          
          <div className="p-6">
            {categoryData.rankings?.map((ranking: any, index: number) => (
              <div key={index} className="mb-8 last:mb-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 ${
                      ranking.rank === 1 ? 'bg-yellow-500' : 
                      ranking.rank === 2 ? 'bg-gray-400' : 
                      ranking.rank === 3 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {ranking.rank}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{ranking.company}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Score: {ranking.score}/10
                        </span>
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          Rank #{ranking.rank}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{ranking.score}/10</div>
                    <div className="text-sm text-gray-500">Overall Score</div>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Market Analysis */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <span className="mr-2">🏢</span>
                      Market Position
                    </h5>
                    <p className="text-blue-800 text-sm">
                      {ranking.detailed_analysis?.market_position || 
                       `Ranked ${ranking.rank} in market analysis with strong competitive positioning`}
                    </p>
                  </div>

                  {/* Strengths */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <h5 className="font-semibold text-green-900 mb-3 flex items-center">
                      <span className="mr-2">✅</span>
                      Key Strengths
                    </h5>
                    <p className="text-green-800 text-sm">
                      {ranking.detailed_analysis?.strengths || 
                       'Strong brand recognition, innovative products, and market leadership'}
                    </p>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
                    <h5 className="font-semibold text-red-900 mb-3 flex items-center">
                      <span className="mr-2">⚠️</span>
                      Areas for Improvement
                    </h5>
                    <p className="text-red-800 text-sm">
                      {ranking.detailed_analysis?.weaknesses || 
                       'Limited market share in some segments, pricing challenges'}
                    </p>
                  </div>

                  {/* Opportunities */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                    <h5 className="font-semibold text-yellow-900 mb-3 flex items-center">
                      <span className="mr-2">🚀</span>
                      Growth Opportunities
                    </h5>
                    <p className="text-yellow-800 text-sm">
                      {ranking.detailed_analysis?.opportunities || 
                       'Expansion in emerging markets, digital transformation, new product lines'}
                    </p>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">💡</span>
                    Analysis Reasoning
                  </h5>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {ranking.reason || 
                     `Comprehensive analysis based on market share, brand recognition, innovation, financial performance, and customer satisfaction. ${ranking.company} demonstrates strong competitive positioning with room for strategic improvements.`}
                  </p>
                </div>

                {/* Recommendations */}
                <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <h5 className="font-semibold text-purple-900 mb-2 flex items-center">
                    <span className="mr-2">🎯</span>
                    Strategic Recommendations
                  </h5>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Invest in innovation and R&D to maintain competitive edge</li>
                    <li>• Expand market presence in emerging segments</li>
                    <li>• Enhance digital transformation and customer experience</li>
                    <li>• Strengthen brand positioning and marketing strategies</li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DetailedAnalysis; 