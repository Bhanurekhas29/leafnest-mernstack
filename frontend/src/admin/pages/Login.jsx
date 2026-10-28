import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api, getToken, setSession } from '../api.js';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (getToken()) return <Navigate to="/admin" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token, admin } = await api('/auth/login', { method: 'POST', body: form });
      setSession(token, admin);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-box">
        <div className="auth-head"><img src="/logo.svg" alt="" className="adm-logo big" /><h1>Leafnest administration</h1></div>
        <form onSubmit={submit} className="auth-form">
          {error && <p className="alert error">{error}</p>}
          <label>Username<input autoFocus required autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
          <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <button className="btn primary" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
          <p className="auth-link"><Link to="/admin/forgot-password">Forgotten your password?</Link></p>
        </form>
      </div>
    </div>
  );
}
