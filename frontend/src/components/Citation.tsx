import React from 'react';
import '../components/BrandRankerDashboard.css';

interface CitationProps {
  title: string;
  url: string;
  date?: string;
}

export const Citation: React.FC<CitationProps> = ({ title, url, date }) => {
  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="citation">
      <div className="citation-content">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="citation-link"
        >
          {title}
        </a>
        <div className="citation-meta">
          <span className="citation-domain">{getDomainFromUrl(url)}</span>
          {date && <span className="citation-date">{new Date(date).toLocaleDateString()}</span>}
        </div>
      </div>
    </div>
  );
}; 