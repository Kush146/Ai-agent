import React, { useEffect, useState } from 'react';
import TaskForm from './TaskForm';
import { assignToFrontendAgent } from './FrontendAgent';  // Import the function to handle frontend tasks

function authHeaders(){
  const t = localStorage.getItem('token') || '';
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function TasksView({ apiBase }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/tasks`, { headers: { ...authHeaders() } });
      const data = await res.json().catch(() => []);
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('fetchTasks', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTasks(); }, []);

  async function remove(id) {
    if (!confirm('Delete this task?')) return;
    try {
      const res = await fetch(`${apiBase}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() }
      });
      if (!res.ok) throw new Error(await res.text());
      setTasks(t => t.filter(x => x._id !== id));
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  }

  return (
    <div className="section panel">
      <h2 className="title mb-12">Tasks</h2>

      <div className="card mb-16">
        <TaskForm apiBase={apiBase} onCreated={fetchTasks} />
      </div>

      <div className="muted mb-12">{loading ? 'Loading…' : `${tasks.length} task(s)`}</div>

      <ul className="list">
        {tasks.map(t => (
          <li key={t._id} className="plan-card">
            <div className="plan-row">
              <strong>{t.name}</strong>
              <button className="btn ghost" onClick={() => remove(t._id)}>Delete</button>
            </div>
            <div className="muted">{t.description}</div>

            {/* Check if the task is frontend-related and generate the React component code */}
            {t.area === 'frontend' && (
              <div>
                <h4>Generated React Code:</h4>
                <pre>{assignToFrontendAgent(t)}</pre>  {/* Display the React code */}
              </div>
            )}
          </li>
        ))}
        {!loading && tasks.length === 0 && (
          <li className="muted">No tasks yet. Create your first one above.</li>
        )}
      </ul>
    </div>
  );
}
