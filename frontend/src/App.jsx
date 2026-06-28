import { useEffect, useState } from 'react';

import StatsHeader from './components/StatsHeader';
import LiveFeed from './components/LiveFeed';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [lastChecked, setLastChecked] = useState('1970-01-01T00:00:00Z');
  
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch(`/api/activity?since=${lastChecked}`);
        if (!res.ok) return;
        const newEvents = await res.json();
        
        if (newEvents.length > 0) {
          // Update the last checked timestamp to the newest event's created_at
          const newestTime = newEvents[0].event.created_at;
          setLastChecked(newestTime);
          
          setEvents((prev) => {
            // Merge and avoid duplicates by checking ID
            const existingIds = new Set(prev.map(e => e.event.id));
            const uniqueNew = newEvents.filter(e => !existingIds.has(e.event.id));
            return [...uniqueNew, ...prev].slice(0, 50); // keep last 50
          });
        }
      } catch (e) {
        console.error('Error fetching activity:', e);
      }
    };

    fetchActivity(); // fetch immediately on mount
    const intervalId = setInterval(fetchActivity, 3000); // poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [lastChecked]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DevPulse</h1>
        <p className="subtitle">AI-Powered Smart Watchman & Engineering Analyst</p>
      </header>
      
      <main className="dashboard">
        <StatsHeader events={events} />
        <LiveFeed events={events} />
      </main>
    </div>
  );
}

export default App;
