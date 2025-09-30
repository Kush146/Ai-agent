import React, { useMemo, useState } from 'react';
import Navbar from './Navbar';
import TasksView from './TasksView';
import CoordinatorAgent from './CoordinatorAgent';

export default function App(){
  const [tab, setTab] = useState('tasks'); // 'tasks' | 'coord'

  // Point this to your backend root
  const apiBase = useMemo(() => {
    // change here if you need different base, e.g. env var
    return 'http://localhost:5000';
  }, []);

  function handleLogout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Simple "logout done" feedback
    alert('Logged out');
  }

  return (
    <div className="app-shell">
      <Navbar active={tab} onChangeTab={setTab} onLogout={handleLogout} />

      {tab === 'tasks' && <TasksView apiBase={apiBase} />}
      {tab === 'coord' && (
        <div className="section panel">
          <h2 className="title mb-12">Coordinator Agent</h2>
          {/* CoordinatorAgent already renders its UI; we wrap it for consistent styling */}
          <div className="card">
            <CoordinatorAgent apiBase={apiBase} />
          </div>
        </div>
      )}
    </div>
  );
}
