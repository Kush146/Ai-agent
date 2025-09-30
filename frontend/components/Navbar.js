import React from 'react';

export default function Navbar({ active, onChangeTab, onLogout }) {
  return (
    <div className="navbar panel">
      <div className="brand">AI Agent <b>Workspace</b></div>

      <div className="nav-actions">
        <button
          className={`tab ${active === 'tasks' ? 'active' : ''}`}
          onClick={() => onChangeTab('tasks')}
        >
          Tasks
        </button>
        <button
          className={`tab ${active === 'coord' ? 'active' : ''}`}
          onClick={() => onChangeTab('coord')}
        >
          Coordinator Agent
        </button>
        <button className="tab logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
