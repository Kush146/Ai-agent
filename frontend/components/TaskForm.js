import { useState } from 'react';

export default function TaskForm({ apiBase, onCreated }) {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskArea, setTaskArea] = useState('frontend'); // Added 'area' state
  const [submitting, setSubmitting] = useState(false);

  const disabled = submitting || !taskName.trim() || !taskDescription.trim();

  async function handleSubmit(e) {
    e.preventDefault();
    if (disabled) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${apiBase}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Send JWT with every create request
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: taskName.trim(),
          description: taskDescription.trim(),
          area: taskArea, // Include the area (frontend/backend) in the request body
        }),
      });

      if (!res.ok) {
        // Handle failed request
        let msg = `Request failed: ${res.status} ${res.statusText}`;
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          try {
            msg = await res.text();
          } catch {}
        }

        // Handle unauthorized errors
        if (res.status === 401) {
          msg = 'Unauthorized: please log in again.';
        }

        throw new Error(msg);
      }

      // Reset form on success
      setTaskName('');
      setTaskDescription('');
      setTaskArea('frontend'); // Reset the area to frontend by default
      onCreated?.(); // callback for parent component, if exists
    } catch (err) {
      console.error('Create task failed:', err);
      alert(`Create task failed: ${err.message}`);
      if (String(err.message).toLowerCase().includes('unauthorized')) {
        // optional: clear token to force re-login UI if your app checks this
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, maxWidth: 640 }}>
      <input
        type="text"
        placeholder="Task Name"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        style={{ flex: 1, padding: 8 }}
        required
      />
      <textarea
        placeholder="Task Description"
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
        style={{ flex: 2, padding: 8, minHeight: 36 }}
        required
      />
      <select
        value={taskArea}
        onChange={(e) => setTaskArea(e.target.value)}
        style={{ flex: 1, padding: 8 }}
        required
      >
        <option value="frontend">Frontend</option>
        <option value="backend">Backend</option>
      </select>
      <button type="submit" disabled={disabled} style={{ padding: '8px 12px' }}>
        {submitting ? 'Creating…' : 'Create Task'}
      </button>
    </form>
  );
}
