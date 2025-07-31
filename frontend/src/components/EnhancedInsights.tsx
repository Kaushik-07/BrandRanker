import React, { useState } from 'react';

interface EnhancedInsightsProps {
  experiment: any;
}

export const EnhancedInsights: React.FC<EnhancedInsightsProps> = ({ experiment }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Extract enhanced data from experiment
  const extractEnhancedData = () => {
    const enhancedData: any = {
      citations: [],
      searchResults: [],
      usage: {},
      model: '',
      searchContext: '',
      totalTokens: 0
    };

    // Extract from categories
    if (experiment.results) {
      Object.values(experiment.results).forEach((categoryData: any) => {
        if (categoryData.metadata) {
          if (categoryData.metadata.citations) {
            enhancedData.citations.push(...categoryData.metadata.citations);
          }
          if (categoryData.metadata.search_results) {
            enhancedData.searchResults.push(...categoryData.metadata.search_results);
          }
          if (categoryData.metadata.usage) {
            enhancedData.usage = categoryData.metadata.usage;
            enhancedData.totalTokens += categoryData.metadata.usage.total_tokens || 0;
          }
          if (categoryData.metadata.model) {
            enhancedData.model = categoryData.metadata.model;
          }
          if (categoryData.metadata.search_context_size) {
            enhancedData.searchContext = categoryData.metadata.search_context_size;
          }
        }
      });
    }

    // Remove duplicates
    enhancedData.citations = Array.from(new Set(enhancedData.citations));
    enhancedData.searchResults = Array.from(new Set(enhancedData.searchResults.map((r: any) => r.url)));

    return enhancedData;
  };

  const enhancedData = extractEnhancedData();

  // Parse reasoning for key insights
  const parseReasoning = (reasoning: string) => {
    const insights = {
      quality: 0,
      affordability: 0,
      style: 0,
      durability: 0,
      keyPhrases: [] as string[]
    };

    const phrases = reasoning.match(/"[^"]*"|\b\w+(?:\s+\w+)*\b/g) || [];
    insights.keyPhrases = phrases.filter((p: string) => p.length > 3).slice(0, 5);

    if (reasoning.toLowerCase().includes('quality')) insights.quality += 1;
    if (reasoning.toLowerCase().includes('affordable')) insights.affordability += 1;
    if (reasoning.toLowerCase().includes('stylish')) insights.style += 1;
    if (reasoning.toLowerCase().includes('durability')) insights.durability += 1;

    return insights;
  };

  return (
    <div className="enhanced-insights-container">
      {/* Enhanced Data Overview */}
      <div className="enhanced-card">
        <div className="enhanced-section-header" onClick={() => toggleSection('overview')}>
          <h3>🔍 Enhanced Data Analysis</h3>
          <span style={{ fontSize: '1.2rem' }}>{expandedSections.includes('overview') ? '▼' : '▶'}</span>
        </div>
        {expandedSections.includes('overview') && (
          <div className="enhanced-stats">
            <div className="enhanced-stat">
              <div className="enhanced-stat-value">{enhancedData.citations.length}</div>
              <div className="enhanced-stat-label">Total Citations</div>
            </div>
            <div className="enhanced-stat">
              <div className="enhanced-stat-value">{enhancedData.searchResults.length}</div>
              <div className="enhanced-stat-label">Search Results</div>
            </div>
            <div className="enhanced-stat">
              <div className="enhanced-stat-value">{enhancedData.totalTokens}</div>
              <div className="enhanced-stat-label">Total Tokens</div>
            </div>
            <div className="enhanced-stat">
              <div className="enhanced-stat-value">{enhancedData.model || 'Unknown'}</div>
              <div className="enhanced-stat-label">AI Model</div>
            </div>
          </div>
        )}
      </div>

      {/* Reasoning Analysis */}
      <div className="enhanced-card">
        <div className="enhanced-section-header" onClick={() => toggleSection('reasoning')}>
          <h3>🧠 AI Reasoning Analysis</h3>
          <span style={{ fontSize: '1.2rem' }}>{expandedSections.includes('reasoning') ? '▼' : '▶'}</span>
        </div>
        {expandedSections.includes('reasoning') && (
          <div>
            {experiment.results && Object.entries(experiment.results).map(([category, categoryData]: [string, any]) => {
              const reasoning = categoryData.reason;
              if (!reasoning) return null;

              const insights = parseReasoning(reasoning);
              
              return (
                <div key={category} style={{ 
                  marginBottom: '1.5rem', 
                  padding: '1rem', 
                  background: '#f8fafc', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>{category}</h4>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>🤖 AI Reasoning:</strong>
                    <p style={{ margin: '0.5rem 0', lineHeight: '1.5' }}>{reasoning}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                    <div style={{ textAlign: 'center', padding: '0.5rem', background: '#ffffff', borderRadius: '6px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{insights.quality}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Quality Mentions</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.5rem', background: '#ffffff', borderRadius: '6px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{insights.affordability}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Affordability</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.5rem', background: '#ffffff', borderRadius: '6px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>{insights.style}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Style</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.5rem', background: '#ffffff', borderRadius: '6px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{insights.durability}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Durability</div>
                    </div>
                  </div>

                  {insights.keyPhrases.length > 0 && (
                    <div>
                      <strong>🔑 Key Phrases:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {insights.keyPhrases.map((phrase: string, index: number) => (
                          <span key={index} style={{
                            padding: '0.25rem 0.5rem',
                            background: '#e5e7eb',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            color: '#374151'
                          }}>
                            {phrase}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Source Analysis */}
      <div className="enhanced-card">
        <div className="enhanced-section-header" onClick={() => toggleSection('sources')}>
          <h3>📚 Source Analysis</h3>
          <span style={{ fontSize: '1.2rem' }}>{expandedSections.includes('sources') ? '▼' : '▶'}</span>
        </div>
        {expandedSections.includes('sources') && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>📊 Source Statistics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>{enhancedData.citations.length}</div>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Total Citations</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>{enhancedData.searchResults.length}</div>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Search Results</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>{enhancedData.model || 'Unknown'}</div>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>AI Model</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>{enhancedData.searchContext || 'Medium'}</div>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Search Context</div>
                </div>
              </div>
            </div>

            {enhancedData.citations.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>🔗 All Citations</h4>
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  {enhancedData.citations.map((citation: any, index: number) => (
                    <div key={index} style={{
                      padding: '1rem',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <a 
                        href={typeof citation === 'string' ? citation : citation.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#667eea', 
                          textDecoration: 'none',
                          flex: 1
                        }}
                      >
                        {typeof citation === 'string' ? citation : citation.title || citation.url}
                      </a>
                      <span style={{ 
                        background: '#e5e7eb', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        color: '#6b7280'
                      }}>
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {enhancedData.usage && Object.keys(enhancedData.usage).length > 0 && (
              <div>
                <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>⚡ AI Processing Details</h4>
                <div style={{
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div>
                      <strong>Total Tokens:</strong>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea' }}>
                        {enhancedData.usage.total_tokens || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <strong>Prompt Tokens:</strong>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea' }}>
                        {enhancedData.usage.prompt_tokens || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <strong>Completion Tokens:</strong>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea' }}>
                        {enhancedData.usage.completion_tokens || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 