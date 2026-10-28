import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { resources } from '../resources.js';
import { useToast } from '../Toast.jsx';

function Control({ field, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  async function upload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setErr('');
    try {
      const form = new FormData();
      form.append('file', file);
      const { url } = await api('/admin/upload', { method: 'POST', form });
      onChange(url);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setUploading(false);
    }
  }

  switch (field.type) {
    case 'textarea':
      return <textarea rows={4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={field.required} />;
    case 'bool':
      return <input type="checkbox" checked={!!Number(value)} onChange={(e) => onChange(e.target.checked ? 1 : 0)} />;
    case 'select':
      return <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>{field.options.map((o) => <option key={o}>{o}</option>)}</select>;
    case 'image':
      return (
        <div className="image-field">
          <input value={value ?? ''} placeholder="/images/example.jpg or upload below" onChange={(e) => onChange(e.target.value)} />
          <input type="file" accept="image/*" onChange={upload} />
          {uploading && <small>Uploading…</small>}
          {err && <small className="err">{err}</small>}
          {value && <img src={value} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} onLoad={(e) => { e.currentTarget.style.display = 'block'; }} />}
        </div>
      );
    default:
      return <input type={field.type} value={value ?? ''} required={field.required} onChange={(e) => onChange(e.target.value)} />;
  }
}

export default function FormView() {
  const { resource, id } = useParams();
  const cfg = resources[resource];
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = !id;
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!cfg) return;
    if (isNew) {
      setValues(Object.fromEntries(cfg.fields.filter((f) => f.default !== undefined).map((f) => [f.name, f.default])));
      return;
    }
    setLoading(true);
    api(`/admin/${resource}/${id}`).then(setValues).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, [resource, id, isNew, cfg]);

  if (!cfg || (isNew && cfg.noAdd)) return <Navigate to="/admin" replace />;

  async function save(e, then) {
    e.preventDefault();
    const form = e.currentTarget.form; // the extra save buttons are type="button", so run browser validation ourselves
    if (form && !form.reportValidity()) return;
    try {
      const body = { ...values };
      if (cfg.fields.some((f) => f.type === 'password') && !body.password) delete body.password;
      const res = await api(`/admin/${resource}${isNew ? '' : `/${id}`}`, { method: isNew ? 'POST' : 'PUT', body });
      toast.success(`The ${cfg.label.toLowerCase()} was ${isNew ? 'added' : 'saved'} successfully.`);
      if (then === 'continue') {
        if (isNew) navigate(`/admin/${resource}/${res.id}`);
      } else if (then === 'add') {
        navigate(`/admin/${resource}/add`);
        setValues(Object.fromEntries(cfg.fields.filter((f) => f.default !== undefined).map((f) => [f.name, f.default])));
      } else navigate(`/admin/${resource}`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove() {
    if (!window.confirm(`Are you sure you want to delete this ${cfg.label.toLowerCase()}? This cannot be undone.`)) return;
    try {
      await api(`/admin/${resource}/${id}`, { method: 'DELETE' });
      toast.success(`The ${cfg.label.toLowerCase()} was deleted successfully.`);
      navigate(`/admin/${resource}`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <div className="crumbs">
        <Link to="/admin">Home</Link> › <Link to={`/admin/${resource}`}>{cfg.plural}</Link> › {isNew ? `Add ${cfg.label.toLowerCase()}` : `Change ${cfg.label.toLowerCase()}`}
      </div>
      <h1 className="page-title">{isNew ? `Add ${cfg.label.toLowerCase()}` : `Change ${cfg.label.toLowerCase()}`}</h1>

      {loading ? <p className="muted">Loading…</p> : (
        <form className="panel form-panel" onSubmit={(e) => save(e, 'list')}>
          {cfg.fields.map((f) => (
            <div className={`field ${f.type === 'bool' ? 'inline' : ''}`} key={f.name}>
              <label>{f.label}{f.required ? ' *' : ''}</label>
              <div>
                <Control field={f} value={values[f.name]} onChange={(v) => setValues({ ...values, [f.name]: v })} />
                {f.help && <small className="help">{f.help}</small>}
              </div>
            </div>
          ))}
          <div className="actions">
            {!isNew && <button type="button" className="btn danger" onClick={remove}>Delete</button>}
            <span className="spacer" />
            {!cfg.noAdd && <button type="button" className="btn" onClick={(e) => save(e, 'add')}>Save and add another</button>}
            <button type="button" className="btn" onClick={(e) => save(e, 'continue')}>Save and continue editing</button>
            <button className="btn primary">Save</button>
          </div>
        </form>
      )}
    </>
  );
}
