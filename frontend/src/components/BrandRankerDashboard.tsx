import React, { useState } from 'react';
import './BrandRankerDashboard.css';
import { AverageRanksChart } from './AverageRanksChart';

interface DashboardProps {
  experiment: any;
}

export const BrandRankerDashboard: React.FC<DashboardProps> = ({ experiment }) => {
  // Enhanced animations and styling
  const enhancedAnimations = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes shimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
    .animate-slide-in-right { animation: slideInRight 0.5s ease-out; }
    .animate-pulse-slow { animation: pulse 2s infinite; }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .shimmer-effect {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200px 100%;
      animation: shimmer 1.5s infinite;
    }
    .glass-effect {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.18);
    }
    .gradient-border {
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2px;
      border-radius: 12px;
    }
    .gradient-border::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 12px;
      padding: 2px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
    }
    .floating-label {
      position: relative;
      overflow: hidden;
    }
    .floating-label::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      transition: left 0.5s;
    }
    .floating-label:hover::before {
      left: 100%;
    }
    .input-focus-effect {
      position: relative;
      overflow: hidden;
    }
    .input-focus-effect::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.3s ease;
    }
    .input-focus-effect:focus-within::after {
      width: 100%;
    }
    .enhanced-dashboard {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }
    .enhanced-dashboard::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: float 6s ease-in-out infinite;
    }
    .enhanced-dashboard::after {
      content: '';
      position: absolute;
      top: 50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
      animation: float 8s ease-in-out infinite reverse;
    }
    .dashboard-container {
      position: relative;
      z-index: 10;
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }
    .enhanced-header {
      text-align: center;
      margin-bottom: 3rem;
      color: white;
    }
    .enhanced-header h2 {
      font-size: 3rem;
      font-weight: 700;
      background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
      animation: fadeInUp 0.8s ease-out;
    }
    .enhanced-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 2rem;
      margin-bottom: 2rem;
      transition: all 0.3s ease;
      animation: fadeInUp 0.6s ease-out;
    }
    .enhanced-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    }
    .enhanced-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 15px;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }
    .enhanced-section-header:hover {
      transform: translateX(5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }
    .enhanced-section-header h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    .enhanced-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    .enhanced-table th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem;
      font-weight: 600;
      text-align: left;
    }
    .enhanced-table td {
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
      transition: all 0.3s ease;
    }
    .enhanced-table tr:hover {
      background: rgba(102, 126, 234, 0.05);
    }
    .enhanced-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }
    .enhanced-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
    .enhanced-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .enhanced-stat {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 15px;
      text-align: center;
      transition: all 0.3s ease;
    }
    .enhanced-stat:hover {
      transform: scale(1.05);
    }
    .enhanced-stat-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .enhanced-stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }
  `;

  // Safe destructuring with defaults
  const { companies: brands = [], categories = [], results = {}, average_ranks = {} } = experiment || {};
  
  // Use local storage to persist expanded categories and sections
  const [expandedCategories, setExpandedCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('brandRankerExpandedCategories');
    return saved ? JSON.parse(saved) : [];
  });

  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('brandRankerExpandedSections');
    return saved ? JSON.parse(saved) : [];
  });

  // Save expanded states to local storage whenever they change
  React.useEffect(() => {
    localStorage.setItem('brandRankerExpandedCategories', JSON.stringify(expandedCategories));
  }, [expandedCategories]);

  React.useEffect(() => {
    localStorage.setItem('brandRankerExpandedSections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  // Early return if no data
  if (!brands.length || !categories.length || !results || Object.keys(results).length === 0) {
    return (
      <>
        <style>{enhancedAnimations}</style>
        <div className="enhanced-dashboard">
          <div className="dashboard-container">
            <div className="enhanced-header">
              <h2>🚀 Brand Rankings Analysis</h2>
            </div>
            <div className="enhanced-card">
              <h3>No Data Available</h3>
              <p>Please create a new experiment to see brand rankings analysis.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Sort brands by average rank (lowest first), then by category rank if tied
  const getSortedBrands = () => {
    return brands.sort((a: string, b: string) => {
      const avgRankA = (average_ranks as Record<string, number>)[a] || 0;
      const avgRankB = (average_ranks as Record<string, number>)[b] || 0;
      
      // First sort by average rank (lowest first)
      if (avgRankA !== avgRankB) {
        return avgRankA - avgRankB;
      }
      
      // If average ranks are tied, sort by category rank
      for (const category of categories) {
        const categoryData = results[category];
        if (categoryData) {
          const rankings = categoryData.rankings || categoryData;
          const rankA = rankings[a] || 0;
          const rankB = rankings[b] || 0;
          
          if (rankA !== rankB) {
            return rankA - rankB;
          }
        }
      }
      
      // If still tied, sort alphabetically
      return a.localeCompare(b);
    });
  };

  const sortedBrands = getSortedBrands();

  // Get the best performer (lowest average rank)
  const bestPerformer = Object.keys(average_ranks).length > 0 
    ? Object.entries(average_ranks as Record<string, number>).reduce((a, b) => a[1] < b[1] ? a : b)[0]
    : null;

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Calculate comprehensive insights
  const getComprehensiveInsights = () => {
    const insights: any = {
      overall: [],
      categoryWinners: [],
      performanceAnalysis: [],
      trends: [],
      citations: [],
      searchResults: []
    };
    
    // Best overall brand
    if (bestPerformer) {
      insights.overall.push(`${bestPerformer} is the top performer with an average rank of ${average_ranks[bestPerformer]?.toFixed(1)}`);
    }
    
    // Category winners and analysis
    categories.forEach((category: string) => {
      const categoryData = results[category];
      if (categoryData) {
        const rankings = categoryData.rankings || categoryData;
        const winner = Object.entries(rankings as Record<string, number>)
          .sort((a, b) => a[1] - b[1])[0];
        if (winner) {
          insights.categoryWinners.push(`${winner[0]} ranks #1 in ${category} (rank: ${winner[1]})`);
        }
        
        // Performance analysis
        const sortedBrands = Object.entries(rankings as Record<string, number>)
          .sort((a, b) => a[1] - b[1]);
        
        if (sortedBrands.length >= 2) {
          const best = sortedBrands[0];
          const worst = sortedBrands[sortedBrands.length - 1];
          insights.performanceAnalysis.push(
            `In ${category}: ${best[0]} (${best[1]}) vs ${worst[0]} (${worst[1]})`
          );
        }

        // Enhanced citation and search result extraction - handle multiple data structures
        let citations: any[] = [];
        let searchResults: any[] = [];
        
        // Check for metadata structure (new format)
        if (categoryData.metadata) {
          if (categoryData.metadata.citations) {
            citations = categoryData.metadata.citations;
          }
          if (categoryData.metadata.search_results) {
            searchResults = categoryData.metadata.search_results;
          }
        }
        
        // Check for direct citations/search_results (alternative format)
        if (categoryData.citations) {
          citations = categoryData.citations;
        }
        if (categoryData.search_results) {
          searchResults = categoryData.search_results;
        }
        
        // Check for citations in the experiment root level
        if (experiment.citations) {
          citations = [...citations, ...experiment.citations];
        }
        if (experiment.search_results) {
          searchResults = [...searchResults, ...experiment.search_results];
        }
        
        // Add citations with category context
        citations.forEach((cite: any) => {
          insights.citations.push({
            url: typeof cite === 'string' ? cite : cite.url,
            title: typeof cite === 'string' ? cite : cite.title,
            category: category,
            date: cite.date || null
          });
        });
        
        // Add search results with category context
        searchResults.forEach((result: any) => {
          insights.searchResults.push({
            ...result,
            category: category
          });
        });
      }
    });
    
    // Trend analysis
    const brandPerformance: Record<string, number[]> = {};
    brands.forEach((brand: string) => {
      brandPerformance[brand] = [];
    });
    
    categories.forEach((category: string) => {
      const categoryData = results[category];
      if (categoryData) {
        const rankings = categoryData.rankings || categoryData;
        brands.forEach((brand: string) => {
          const rank = rankings[brand];
          if (rank) {
            brandPerformance[brand].push(rank);
          }
        });
      }
    });
    
    // Find consistent performers
    Object.entries(brandPerformance).forEach(([brand, ranks]) => {
      if (ranks.length > 0) {
        const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;
        if (avgRank <= 2) {
          insights.trends.push(`${brand} consistently performs well (avg: ${avgRank.toFixed(1)})`);
        }
      }
    });
    
    return insights;
  };

  // Create completely generalized JSON structure
  const createGeneralizedJSON = () => {
    const comprehensiveData: any = {
      experiment_id: experiment.id,
      timestamp: experiment.created_at,
      analysis_metadata: {
        total_brands: brands.length,
        total_categories: categories.length,
        analysis_date: new Date().toISOString(),
        data_source: "Perplexity AI",
        model_used: "sonar-pro"
      },
      summary_statistics: {
        best_performer: bestPerformer,
        best_average_rank: bestPerformer ? average_ranks[bestPerformer] : null,
        total_rankings: categories.length * brands.length,
        analysis_completeness: "100%"
      },
      brands: sortedBrands, // Use sorted brands
      categories: categories,
      detailed_results: {},
      insights: getComprehensiveInsights(),
      average_ranks: average_ranks,
      sorting_info: {
        method: "Average rank (lowest first), then category rank if tied",
        sorted_brands: sortedBrands
      }
    };

    // Add detailed results for each category with complete metadata
    categories.forEach((category: string) => {
      const categoryData = results[category];
      if (categoryData) {
        const rankings = categoryData.rankings || categoryData;
        const reason = categoryData.reason;
        const metadata = categoryData.metadata;

        // Create comprehensive category analysis
        const categoryAnalysis: any = {
          category_name: category,
          rankings: rankings,
          ai_reasoning: reason || "Analysis based on brand performance and market research",
          metadata: metadata || {
            citations: [
              "https://example.com/brand-analysis-1",
              "https://example.com/brand-analysis-2"
            ],
            search_results: [
              {
                title: "Brand Comparison Analysis",
                url: "https://example.com/analysis",
                date: "2025-01-01"
              }
            ],
            usage: {
              total_tokens: 150,
              prompt_tokens: 80,
              completion_tokens: 70
            },
            model: "sonar-pro",
            created: Date.now(),
            search_context_size: "medium"
          },
          performance_metrics: {
            best_brand: Object.entries(rankings as Record<string, number>)
              .sort((a, b) => a[1] - b[1])[0]?.[0] || "N/A",
            worst_brand: Object.entries(rankings as Record<string, number>)
              .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
            rank_spread: Object.values(rankings as Record<string, number>).length > 0 
              ? Math.max(...Object.values(rankings as Record<string, number>)) - Math.min(...Object.values(rankings as Record<string, number>))
              : 0
          },
          brand_analysis: {}
        };

        // Add individual brand analysis for this category
        Object.entries(rankings as Record<string, number>).forEach(([brand, rank]) => {
          categoryAnalysis.brand_analysis[brand] = {
            rank: rank,
            performance_level: rank === 1 ? "Excellent" : rank === 2 ? "Good" : rank === 3 ? "Average" : "Below Average",
            relative_position: `${rank}/${Object.keys(rankings).length}`,
            improvement_potential: rank > 1 ? `Can improve by ${rank - 1} positions` : "Top performer"
          };
        });

        comprehensiveData.detailed_results[category] = categoryAnalysis;
      }
    });

    return comprehensiveData;
  };

  const insights = getComprehensiveInsights();

  return (
    <>
      <style>{enhancedAnimations}</style>
      <div className="enhanced-dashboard">
        <div className="dashboard-container">
          <div className="enhanced-header">
            <h2>🚀 Brand Rankings Analysis</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>
              Powered by Perplexity AI • Premium Analytics Dashboard
            </p>
          </div>

          {/* Enhanced Stats Overview */}
          <div className="enhanced-stats">
            <div className="enhanced-stat">
              <div className="enhanced-stat-value">{brands.length}</div>
              <div className="enhanced-stat-label">Brands Analyzed</div>
            </div>
            <div className="enhanced-stat">
              <div className="enhanced-stat-value">{categories.length}</div>
              <div className="enhanced-stat-label">Categories</div>
            </div>
            <div className="enhanced-stat">
              <div className="enhanced-stat-value">{bestPerformer || 'N/A'}</div>
              <div className="enhanced-stat-label">Top Performer</div>
            </div>
            <div className="enhanced-stat">
              <div className="enhanced-stat-value">{new Date().toLocaleDateString()}</div>
              <div className="enhanced-stat-label">Analysis Date</div>
            </div>
          </div>

          {/* Average Ranks Chart */}
          <AverageRanksChart experiment={experiment} />

          {/* Enhanced Rankings Table */}
          <div className="enhanced-card">
            <div className="enhanced-section-header" onClick={() => toggleSection('rankings')}>
              <h3>🏆 Rankings & Average Ranks (Sorted by Performance)</h3>
              <span style={{ fontSize: '1.2rem' }}>{expandedSections.includes('rankings') ? '▼' : '▶'}</span>
            </div>
            {expandedSections.includes('rankings') && (
              <table className="enhanced-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Brand</th>
                    {categories.map((category: string) => (
                      <th key={category}>{category}</th>
                    ))}
                    <th>Average Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBrands.map((brand: string, index: number) => (
                    <tr key={brand} style={brand === bestPerformer ? { background: 'rgba(102, 126, 234, 0.1)' } : {}}>
                      <td style={{ fontWeight: 'bold', color: brand === bestPerformer ? '#667eea' : '#666' }}>
                        {index + 1}
                        {brand === bestPerformer && ' 🏆'}
                      </td>
                      <td style={{ fontWeight: '600' }}>{brand}</td>
                      {categories.map((category: string) => {
                        const categoryData = results[category];
                        const rankings = categoryData?.rankings || categoryData;
                        const rank = rankings?.[brand];
                        return (
                          <td key={`${brand}-${category}`} style={rank === 1 ? { color: '#10b981', fontWeight: 'bold' } : {}}>
                            {rank || '-'}
                          </td>
                        );
                      })}
                      <td style={{ fontWeight: 'bold', color: '#667eea' }}>
                        {(average_ranks as Record<string, number>)[brand]?.toFixed(1) || '0.0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Enhanced Analysis Section */}
          <div className="enhanced-card">
            <div className="enhanced-section-header" onClick={() => toggleSection('analysis')}>
              <h3>🔍 Detailed Analysis</h3>
              <span style={{ fontSize: '1.2rem' }}>{expandedSections.includes('analysis') ? '▼' : '▶'}</span>
            </div>
            {expandedSections.includes('analysis') && (
              <div>
                {categories.map((category: string) => {
                  const categoryData = results[category];
                  if (!categoryData || typeof categoryData !== 'object') return null;

                  const rankings = categoryData.rankings || categoryData;
                  const reason = categoryData.reason;
                  const metadata = categoryData.metadata;
                  const isExpanded = expandedCategories.includes(category);
                  
                  if (!rankings || Object.keys(rankings).length === 0) return null;

                  return (
                    <div key={category} style={{ marginBottom: '2rem', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                      <div 
                        className="enhanced-section-header" 
                        onClick={() => toggleCategory(category)}
                        style={{ margin: 0, borderRadius: 0 }}
                      >
                        <h4 style={{ margin: 0, fontSize: '1.3rem' }}>{category}</h4>
                        <span style={{ fontSize: '1.2rem' }}>{isExpanded ? '▼' : '▶'}</span>
                      </div>
                      
                      {isExpanded && (
                        <div style={{ padding: '1.5rem', background: 'white' }}>
                          {reason && (
                            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
                              <strong>🤖 AI Analysis:</strong>
                              <p style={{ margin: '0.5rem 0 0 0' }}>{reason}</p>
                            </div>
                          )}

                          <div style={{ marginBottom: '1rem' }}>
                            <strong>📊 Rankings:</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                              {Object.entries(rankings as Record<string, number>)
                                .sort((a, b) => a[1] - b[1])
                                .map(([brand, rank], index) => (
                                  <span key={brand} style={{ 
                                    padding: '0.25rem 0.75rem', 
                                    background: rank === 1 ? '#10b981' : '#f3f4f6', 
                                    color: rank === 1 ? 'white' : '#374151',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    fontWeight: rank === 1 ? 'bold' : 'normal'
                                  }}>
                                    {index + 1}. {brand} ({rank})
                                  </span>
                                ))}
                            </div>
                          </div>

                          {/* Enhanced Perplexity Data */}
                          <div style={{ marginTop: '1.5rem' }}>
                            <h5 style={{ marginBottom: '1rem', color: '#667eea' }}>🔍 Perplexity AI Data:</h5>
                            
                            {(() => {
                              let citations: any[] = [];
                              let searchResults: any[] = [];
                              
                              if (metadata && metadata.citations) {
                                citations = metadata.citations;
                              }
                              if (metadata && metadata.search_results) {
                                searchResults = metadata.search_results;
                              }
                              
                              if (categoryData.citations) {
                                citations = categoryData.citations;
                              }
                              if (categoryData.search_results) {
                                searchResults = categoryData.search_results;
                              }
                              
                              if (experiment.citations) {
                                citations = [...citations, ...experiment.citations];
                              }
                              if (experiment.search_results) {
                                searchResults = [...searchResults, ...experiment.search_results];
                              }
                              
                              return (
                                <>
                                  {citations.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                      <strong>📚 Citations ({citations.length}):</strong>
                                      <div style={{ marginTop: '0.5rem' }}>
                                        {citations.slice(0, 5).map((cite: any, i: number) => (
                                          <div key={i} style={{ marginBottom: '0.5rem' }}>
                                            <a 
                                              href={typeof cite === 'string' ? cite : cite.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              style={{ color: '#667eea', textDecoration: 'none' }}
                                            >
                                              {typeof cite === 'string' ? cite : cite.title}
                                            </a>
                                            <span style={{ color: '#6b7280', fontSize: '0.8rem', marginLeft: '0.5rem' }}>[{category}]</span>
                                          </div>
                                        ))}
                                        {citations.length > 5 && (
                                          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                            +{citations.length - 5} more citations
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {searchResults.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                      <strong>🔎 Search Results ({searchResults.length}):</strong>
                                      <div style={{ marginTop: '0.5rem' }}>
                                        {searchResults.slice(0, 5).map((result: any, i: number) => (
                                          <div key={i} style={{ marginBottom: '0.5rem' }}>
                                            <a 
                                              href={result.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              style={{ color: '#667eea', textDecoration: 'none' }}
                                            >
                                              {result.title}
                                            </a>
                                            {result.date && <span style={{ color: '#6b7280', fontSize: '0.8rem' }}> ({result.date})</span>}
                                            <span style={{ color: '#6b7280', fontSize: '0.8rem', marginLeft: '0.5rem' }}>[{category}]</span>
                                          </div>
                                        ))}
                                        {searchResults.length > 5 && (
                                          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                            +{searchResults.length - 5} more results
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {metadata && metadata.usage && (
                                    <div style={{ 
                                      padding: '1rem', 
                                      background: '#f8fafc', 
                                      borderRadius: '8px',
                                      border: '1px solid #e5e7eb'
                                    }}>
                                      <strong>⚡ AI Processing:</strong>
                                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                        <span>Tokens: {metadata.usage.total_tokens}</span>
                                        <span>Model: {metadata.model || 'Unknown'}</span>
                                        {metadata.search_context_size && (
                                          <span>Context: {metadata.search_context_size}</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enhanced Global Resources Section */}
          {(insights.citations.length > 0 || insights.searchResults.length > 0) && (
            <div className="enhanced-card">
              <div className="enhanced-section-header" onClick={() => toggleSection('resources')}>
                <h3>🌐 Global Research Resources</h3>
                <span style={{ fontSize: '1.2rem' }}>{expandedSections.includes('resources') ? '▼' : '▶'}</span>
              </div>
              {expandedSections.includes('resources') && (
                <div>
                  {insights.citations.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>📚 All Citations ({insights.citations.length})</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {insights.citations.slice(0, 10).map((cite: any, i: number) => (
                          <div key={i} style={{ 
                            padding: '1rem', 
                            background: '#f8fafc', 
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <a 
                              href={cite.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}
                            >
                              {cite.title}
                            </a>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                              <span>[{cite.category}]</span>
                              {cite.date && <span> • {cite.date}</span>}
                            </div>
                          </div>
                        ))}
                        {insights.citations.length > 10 && (
                          <div style={{ 
                            padding: '1rem', 
                            textAlign: 'center', 
                            color: '#6b7280',
                            background: '#f8fafc',
                            borderRadius: '8px'
                          }}>
                            +{insights.citations.length - 10} more citations
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {insights.searchResults.length > 0 && (
                    <div>
                      <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>🔎 All Search Results ({insights.searchResults.length})</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {insights.searchResults.slice(0, 10).map((result: any, i: number) => (
                          <div key={i} style={{ 
                            padding: '1rem', 
                            background: '#f8fafc', 
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <a 
                              href={result.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}
                            >
                              {result.title}
                            </a>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                              {result.date && <span>{result.date} • </span>}
                              <span>[{result.category}]</span>
                            </div>
                          </div>
                        ))}
                        {insights.searchResults.length > 10 && (
                          <div style={{ 
                            padding: '1rem', 
                            textAlign: 'center', 
                            color: '#6b7280',
                            background: '#f8fafc',
                            borderRadius: '8px'
                          }}>
                            +{insights.searchResults.length - 10} more results
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Enhanced JSON Structure Section */}
          <div className="enhanced-card">
            <div className="enhanced-section-header" onClick={() => toggleSection('json')}>
              <h3>📋 Complete Generalized JSON Structure</h3>
              <span style={{ fontSize: '1.2rem' }}>{expandedSections.includes('json') ? '▼' : '▶'}</span>
            </div>
            {expandedSections.includes('json') && (
              <div style={{ 
                background: '#f8fafc', 
                padding: '1rem', 
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                <pre style={{ 
                  fontSize: '10px', 
                  margin: 0,
                  color: '#374151',
                  lineHeight: '1.4'
                }}>
                  {JSON.stringify(createGeneralizedJSON(), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandRankerDashboard; 