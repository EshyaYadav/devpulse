import React from 'react';

function AgentCard({ title, icon, children, statusClass }) {
  return (
    <div className={`agent-card ${statusClass}`}>
      <div className="agent-card-header">
        <span className="agent-icon">{icon}</span>
        <h4>{title}</h4>
      </div>
      <div className="agent-card-content">
        {children}
      </div>
    </div>
  );
}

export default AgentCard;
