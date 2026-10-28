import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../Toast.jsx';

export default function ChangePassword() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const toast = useToast();

  async function submit(e) {
    e.preventDefault();
    if (form.new_password !== form.confirm) return toast.error("The two password fields didn't match.");
    try {
      const data = await api('/auth/change-password', { method: 'POST', body: form });
      toast.success(data.message);
      setForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <div className="crumbs"><Link to="/admin">Home</Link> › Password change</div>
      <h1 className="page-title">Password change</h1>
      <form className="panel form-panel" onSubmit={submit}>
        <div className="field"><label>Current password</label><input type="password" required value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} /></div>
        <div className="field"><label>New password</label><input type="password" required minLength={8} value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} /></div>
        <div className="field"><label>Confirm new password</label><input type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} /></div>
        <div className="actions"><button className="btn primary">Change my password</button></div>
      </form>
    </>
  );
}
