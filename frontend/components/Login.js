import React, { useState } from 'react';

export default function Login({ apiBase, onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('Tester');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const url =
        mode === 'login'
          ? `${apiBase}/api/auth/login`
          : `${apiBase}/api/auth/register`;

      const body =
        mode === 'login'
          ? { email, password }
          : { email, name: name || 'Tester', password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Auth failed');
      }

      const data = await res.json();
      // persist token + user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuth({ token: data.token, user: data.user });
    } catch (err) {
      console.error('Auth error:', err);
      alert(`Auth failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', fontFamily: 'system-ui, Arial' }}>
      <h1 style={{ fontSize: 36, marginBottom: 12 }}>Task Management App</h1>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setMode('login')}
          disabled={busy}
          style={{
            padding: '6px 10px',
            marginRight: 8,
            borderRadius: 8,
            border: '1px solid #3b82f6',
            background: mode === 'login' ? '#eff6ff' : '#fff',
            color: '#1e40af',
          }}
        >
          Login
        </button>
        <button
          onClick={() => setMode('register')}
          disabled={busy}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #10b981',
            background: mode === 'register' ? '#ecfdf5' : '#fff',
            color: '#065f46',
          }}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 8, margin: '6px 0 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
        />

        {mode === 'register' && (
          <>
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: 8, margin: '6px 0 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
          </>
        )}

        <label>Password</label>
        <input
          type="password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 8, margin: '6px 0 16px', borderRadius: 8, border: '1px solid #e5e7eb' }}
        />

        <button
          type="submit"
          disabled={busy}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #111827',
            background: '#111827',
            color: '#fff',
            width: '100%',
          }}
        >
          {busy ? (mode === 'login' ? 'Logging in…' : 'Registering…') : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  );
}
