import React, { useEffect, useState } from 'react';

// Helper: trigger browser download from a Blob
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Helper to retrieve auth headers
function authHeaders() {
  const token = localStorage.getItem('token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function CoordinatorAgent({ apiBase }) {
  const [brief, setBrief] = useState('');
  const [busy, setBusy] = useState(false);
  const [briefs, setBriefs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [committing, setCommitting] = useState(false);
  const [genIdxLoading, setGenIdxLoading] = useState(null);

  // Load all briefs
  async function loadBriefs() {
    try {
      const res = await fetch(`${apiBase}/api/agent/briefs`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => []);
      setBriefs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('loadBriefs error:', e);
    }
  }

  useEffect(() => { loadBriefs(); }, []);

  // Create a plan from brief
  async function createPlan(e) {
    e.preventDefault();
    if (!brief.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/api/agent/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ brief }),
      });
      if (!res.ok) throw new Error(await res.text());
      const doc = await res.json();
      setSelected(doc);
      setBrief('');
      await loadBriefs();
    } catch (e) {
      console.error('createPlan error:', e);
      alert(`Create plan failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // Open a selected brief
  async function openBrief(id) {
    try {
      const res = await fetch(`${apiBase}/api/agent/briefs/${id}`, {
        headers: { ...authHeaders() },
      });
      const doc = await res.json();
      setSelected(doc);
    } catch (e) {
      console.error('getBrief error:', e);
    }
  }

  // Commit a selected plan to create tasks
  async function commitPlan(id) {
    setCommitting(true);
    try {
      const res = await fetch(`${apiBase}/api/agent/briefs/${id}/commit`, {
        method: 'POST',
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSelected(data.brief);
      alert(`Created ${data.createdCount} tasks from plan.`);
    } catch (e) {
      console.error('commitPlan error:', e);
      alert(`Commit failed: ${e.message}`);
    } finally {
      setCommitting(false);
    }
  }

  // Generate a downloadable code ZIP from plan
  async function generateCodeZip(briefId, idx, area, title) {
    try {
      setGenIdxLoading(idx);
      const res = await fetch(`${apiBase}/api/codegen/from-plan/${briefId}/${idx}`, {
        method: 'POST',
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const base = (title || `${area}-stub`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      downloadBlob(blob, `${base}-${area}-stub.zip`);
    } catch (e) {
      console.error('generateCodeZip error:', e);
      alert(`Generate code failed: ${e.message}`);
    } finally {
      setGenIdxLoading(null);
    }
  }

  return (
    <div className="coordinator-agent" style={{ padding: 16 }}>
      <h2>Coordinator Agent</h2>

      {/* Brief creation form */}
      <form onSubmit={createPlan} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <textarea
          placeholder='e.g. "Build a task management app with user auth and task sharing."'
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          style={{ flex: 1, padding: 8, minHeight: 80 }}
        />
        <button type="submit" disabled={busy || !brief.trim()} style={{ padding: '8px 12px', height: 40 }}>
          {busy ? 'Thinking…' : 'Generate Plan'}
        </button>
      </form>

      {/* Display list of briefs */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <div>
          <h3>Briefs</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {briefs.map((b) => (
              <li
                key={b._id}
                onClick={() => openBrief(b._id)}
                style={{
                  padding: 10,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  marginBottom: 8,
                  cursor: 'pointer',
                  background: selected?._id === b._id ? '#f3f4f6' : 'white',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                  {new Date(b.createdAt).toLocaleString()}
                </div>
                <div style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.brief}
                </div>
              </li>
            ))}
            {briefs.length === 0 && <li>No briefs yet.</li>}
          </ul>
        </div>

        {/* Display selected plan */}
        <div>
          <h3>Plan</h3>
          {!selected ? (
            <p>Select a brief on the left or generate a new plan above.</p>
          ) : (
            <>
              <div style={{ marginBottom: 8, color: '#374151' }}>{selected.brief}</div>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {selected.plan.map((p, i) => (
                  <li
                    key={i}
                    style={{
                      padding: 12,
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                      marginBottom: 8,
                      background: p.status === 'created' ? '#ecfdf5' : 'white',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700 }}>
                        [{p.area}] {p.title}
                      </span>
                      <span style={{ fontSize: 12, color: '#059669' }}>{p.status}</span>
                    </div>
                    <div style={{ color: '#374151', marginBottom: 8 }}>{p.description}</div>

                    {/* Generate code and commit buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => generateCodeZip(selected._id, i, p.area, p.title)}
                        disabled={genIdxLoading === i}
                        style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #111827' }}
                        title="Generate a downloadable code stub"
                      >
                        {genIdxLoading === i ? 'Generating…' : 'Generate code'}
                      </button>

                      {p.status === 'planned' && (
                        <button
                          onClick={() => commitPlan(selected._id)}
                          disabled={genIdxLoading === i}
                          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #10b981', background: '#ecfdf5' }}
                        >
                          Create tasks from this plan
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
