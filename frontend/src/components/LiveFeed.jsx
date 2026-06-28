import React from 'react';
import AgentCard from './AgentCard';

function LiveFeed({ events }) {
  if (events.length === 0) {
    return <div className="no-events">Waiting for commits...</div>;
  }

  return (
    <div className="live-feed">
      {events.map((ev, idx) => (
        <div key={ev.event.id || idx} className="event-item">
          <div className="event-header">
            <div className="event-info">
              <h2>{ev.event.repo}</h2>
              <p className="commit-msg">"{ev.event.message}"</p>
              <p className="author-info">by <strong>{ev.event.author}</strong> ({ev.event.files_count} files changed)</p>
            </div>
          </div>
          
          <div className="agents-grid">
            {/* Security Agent */}
            <AgentCard 
              title="Security Sentinel" 
              icon="🛡️"
              statusClass={`status-${ev.results?.security?.severity?.toLowerCase() || 'low'}`}
            >
              <p>Severity: <strong>{ev.results?.security?.severity}</strong></p>
              {ev.results?.security?.issues?.length > 0 ? (
                <ul className="issue-list">
                  {ev.results?.security?.issues.map((i, k) => (
                    <li key={k}>{i.type}: {i.description} ({i.file})</li>
                  ))}
                </ul>
              ) : (
                <p className="all-clear">No security issues detected.</p>
              )}
              {ev.results?.security?.recommendation && (
                <p className="recommendation"><em>{ev.results?.security?.recommendation}</em></p>
              )}
            </AgentCard>

            {/* Architecture Agent */}
            <AgentCard 
              title="Architecture Reviewer" 
              icon="🏗️"
              statusClass={ev.results?.architecture?.compliance_score < 70 ? 'status-high' : 'status-low'}
            >
              <p>Compliance: <strong>{ev.results?.architecture?.compliance_score}%</strong></p>
              {ev.results?.architecture?.violations?.length > 0 ? (
                <ul className="issue-list">
                  {ev.results?.architecture?.violations.map((v, k) => (
                    <li key={k}>{v.rule}: {v.description}</li>
                  ))}
                </ul>
              ) : (
                <p className="all-clear">Architecture looks good.</p>
              )}
              {ev.results?.architecture?.suggestion && (
                <p className="recommendation"><em>{ev.results?.architecture?.suggestion}</em></p>
              )}
            </AgentCard>

            {/* Productivity Agent */}
            <AgentCard 
              title="HR & Productivity" 
              icon="🧠"
              statusClass={`status-${ev.results?.productivity?.risk_level?.toLowerCase() || 'low'}`}
            >
              <p>Burnout Risk: <strong>{ev.results?.productivity?.risk_level}</strong></p>
              <p className="observation">{ev.results?.productivity?.observation}</p>
              {ev.results?.productivity?.tip && (
                <p className="recommendation"><em>Tip: {ev.results?.productivity?.tip}</em></p>
              )}
            </AgentCard>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LiveFeed;
