import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import TaskForm from './components/TaskForm';
import Login from './components/Login';
import CoordinatorAgent from './components/CoordinatorAgent';

// Base URL for your API
const API_BASE = 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// App component to handle user authentication and session management
function App() {
  const [me, setMe] = useState(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return token && user ? { token, user: JSON.parse(user) } : null;
  });

  if (!me) {
    return <Login apiBase={API_BASE} onAuth={setMe} />;
  }

  return (
    <MainShell
      apiBase={API_BASE}
      onLogout={() => {
        localStorage.clear();
        setMe(null);
      }}
    />
  );
}

// MainShell component for layout and routing between tabs
function MainShell({ apiBase, onLogout }) {
  const [tab, setTab] = useState('tasks'); // 'tasks' | 'agent'

  return (
    <div className="app-shell">
      <Navbar active={tab} onChangeTab={setTab} onLogout={onLogout} />
      {tab === 'tasks' ? <TasksScreen apiBase={apiBase} /> : <CoordinatorAgent apiBase={apiBase} />}
    </div>
  );
}

// Navbar component for navigation
function Navbar({ active, onChangeTab, onLogout }) {
  return (
    <div className="navbar">
      <div className="brand">AI Agent Workspace</div>
      <div className="nav-actions">
        <button
          className={`tab ${active === 'tasks' ? 'active' : ''}`}
          onClick={() => onChangeTab('tasks')}
        >
          Tasks
        </button>
        <button
          className={`tab ${active === 'agent' ? 'active' : ''}`}
          onClick={() => onChangeTab('agent')}
        >
          Coordinator Agent
        </button>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

// TasksScreen component for managing tasks
function TasksScreen({ apiBase }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch tasks from the API
  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/tasks`, { headers: { ...authHeaders() } });
      const data = await res.json().catch(() => []);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTasks(); }, []);

  function startEdit(task) {
    setEditingId(task._id);
    setEditName(task.name);
    setEditDesc(task.description);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditDesc('');
  }

  // Save task edit to API
  async function saveEdit(id) {
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ name: editName, description: editDesc }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} ${body}`);
      }
      cancelEdit();
      await fetchTasks();
    } catch (err) {
      console.error('Update failed:', err);
      alert(`Update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  // Delete task from API
  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${apiBase}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} ${body}`);
      }
      await fetchTasks();
    } catch (err) {
      console.error('Delete failed:', err);
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="tasks-screen">
      <TaskForm apiBase={apiBase} onCreated={fetchTasks} />

      <h2>Tasks</h2>
      {loading ? (
        <p>Loading...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks yet. Create your first one above.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task._id} className="task-item">
              <div className="task-details">
                {editingId === task._id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Task name"
                    />
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Task description"
                    />
                  </>
                ) : (
                  <>
                    <strong>{task.name}</strong>
                    <div>{task.description}</div>
                  </>
                )}
              </div>

              <div className="task-actions">
                {editingId === task._id ? (
                  <>
                    <button onClick={() => saveEdit(task._id)} disabled={saving || !editName.trim() || !editDesc.trim()}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(task)}>Edit</button>
                    <button onClick={() => handleDelete(task._id)} disabled={deletingId === task._id}>
                      {deletingId === task._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
