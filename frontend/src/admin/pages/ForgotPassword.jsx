import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api('/auth/forgot-password', { method: 'POST', body: { email } });
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
        <div className="auth-head"><h1>Password reset</h1></div>
        <form onSubmit={submit} className="auth-form">
          {msg ? (
            <>
              <p className="alert success">{msg}</p>
              <p className="auth-link"><Link to="/admin/login">Back to log in</Link></p>
            </>
          ) : (
            <>
              <p>Forgotten your password? Enter your username or email address below, and we'll email instructions for setting a new one to the address on file.</p>
              {error && <p className="alert error">{error}</p>}
              <label>Username or email<input autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <button className="btn primary" disabled={busy}>{busy ? 'Sending…' : 'Reset my password'}</button>
              <p className="auth-link"><Link to="/admin/login">Back to log in</Link></p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
