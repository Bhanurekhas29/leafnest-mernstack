import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { columnLabel, resources } from '../resources.js';
import { useToast } from '../Toast.jsx';

const show = (v, field) => {
  if (v === null || v === undefined || v === '') return '—';
  if (field?.type === 'bool') return v ? '✔' : '✘';
  return String(v);
};

export default function ListView() {
  const { resource } = useParams();
  const cfg = resources[resource];
  const [data, setData] = useState({ rows: [], total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [action, setAction] = useState('');
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api(`/admin/${resource}?page=${page}&search=${encodeURIComponent(query)}`)
      .then((d) => { setData(d); setSelected([]); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [resource, page, query]);

  useEffect(() => { setPage(1); setQuery(''); setSearch(''); }, [resource]);
  useEffect(load, [load]);

  if (!cfg) return <Navigate to="/admin" replace />;

  const allChecked = data.rows.length > 0 && selected.length === data.rows.length;
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function runAction(e) {
    e.preventDefault();
    if (action !== 'delete' || !selected.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selected.length} selected ${selected.length === 1 ? cfg.label : cfg.plural}? This cannot be undone.`)) return;
    try {
      for (const id of selected) await api(`/admin/${resource}/${id}`, { method: 'DELETE' });
      toast.success(`Successfully deleted ${selected.length} ${selected.length === 1 ? cfg.label : cfg.plural}.`);
    } catch (err) {
      toast.error(err.message);
    }
    setAction('');
    load();
  }

  return (
    <>
      <div className="crumbs"><Link to="/admin">Home</Link> › {cfg.plural}</div>
      <div className="title-row">
        <h1 className="page-title">Select {cfg.label.toLowerCase()} to change</h1>
        {!cfg.noAdd && <Link to={`/admin/${resource}/add`} className="btn primary">Add {cfg.label.toLowerCase()} +</Link>}
      </div>

      <form className="search-bar" onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search); }}>
        <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn">Search</button>
        {query && <button type="button" className="link-btn" onClick={() => { setSearch(''); setQuery(''); }}>✕ Clear</button>}
        <span className="muted">{data.total} total</span>
      </form>

      <form className="action-bar" onSubmit={runAction}>
        <label>Action:
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">---------</option>
            <option value="delete">Delete selected</option>
          </select>
        </label>
        <button className="btn" disabled={!action || !selected.length}>Go</button>
        <span className="muted">{selected.length} of {data.rows.length} selected</span>
      </form>

      <div className="panel table-wrap">
        <table className="grid-table">
          <thead>
            <tr>
              <th className="check"><input type="checkbox" checked={allChecked} onChange={() => setSelected(allChecked ? [] : data.rows.map((r) => r.id))} /></th>
              {cfg.columns.map((c) => <th key={c}>{columnLabel(resource, c)}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={cfg.columns.length + 1} className="muted pad">Loading…</td></tr>}
            {!loading && !data.rows.length && <tr><td colSpan={cfg.columns.length + 1} className="muted pad">No {cfg.plural.toLowerCase()} found.</td></tr>}
            {data.rows.map((row) => (
              <tr key={row.id} className={selected.includes(row.id) ? 'selected' : ''}>
                <td className="check"><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggle(row.id)} /></td>
                {cfg.columns.map((c, i) => {
                  const field = cfg.fields.find((f) => f.name === c);
                  return i === 0
                    ? <th key={c}><Link to={`/admin/${resource}/${row.id}`}>{show(row[c], field)}</Link></th>
                    : <td key={c} className={field?.type === 'bool' ? 'bool' : ''}>{show(row[c], field)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.pages > 1 && (
        <div className="pager">
          <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
          <span>Page {data.page} of {data.pages}</span>
          <button className="btn" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next ›</button>
        </div>
      )}
    </>
  );
}
