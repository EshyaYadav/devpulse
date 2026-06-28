import React from 'react';

function StatsHeader({ events }) {
  const totalCommits = events.length;
  
  const vulnerabilities = events.reduce((acc, ev) => {
    return acc + (ev.results?.security?.issues?.length || 0);
  }, 0);

  const avgCompliance = totalCommits > 0 
    ? Math.round(events.reduce((acc, ev) => acc + (ev.results?.architecture?.compliance_score || 100), 0) / totalCommits)
    : 100;

  const burnoutRiskCount = events.filter(ev => 
    ['medium', 'high'].includes(ev.results?.productivity?.risk_level?.toLowerCase())
  ).length;

  return (
    <div className="stats-header">
      <div className="stat-box">
        <h3>Total Commits</h3>
        <p className="stat-value">{totalCommits}</p>
      </div>
      <div className="stat-box">
        <h3>Vulnerabilities</h3>
        <p className="stat-value danger">{vulnerabilities}</p>
      </div>
      <div className="stat-box">
        <h3>Avg Compliance</h3>
        <p className="stat-value success">{avgCompliance}%</p>
      </div>
      <div className="stat-box">
        <h3>Burnout Risks</h3>
        <p className="stat-value warning">{burnoutRiskCount}</p>
      </div>
    </div>
  );
}

export default StatsHeader;
