import { useEffect, useState } from 'react';
import { socket } from './socket';
import StatsHeader from './components/StatsHeader';
import LiveFeed from './components/LiveFeed';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    socket.on('new_analysis', (data) => {
      console.log('New analysis received:', data);
      setEvents((prev) => [data, ...prev].slice(0, 50)); // keep last 50
    });

    return () => {
      socket.off('new_analysis');
    };
  }, []);

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
