import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function ResetPassword() {
  const { token } = useParams();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) return setError("The two password fields didn't match.");
    setBusy(true);
    setError('');
    try {
      const data = await api('/auth/reset-password', { method: 'POST', body: { token, password: form.password } });
      setMsg(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-box">
        <div className="auth-head"><h1>Enter new password</h1></div>
        <form onSubmit={submit} className="auth-form">
          {msg ? (
            <>
              <p className="alert success">{msg}</p>
              <p className="auth-link"><Link to="/admin/login">Log in</Link></p>
            </>
          ) : (
            <>
              {error && <p className="alert error">{error}</p>}
              <label>New password<input type="password" autoFocus required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
              <label>Confirm password<input type="password" required minLength={8} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} /></label>
              <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Change my password'}</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
