import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { groups, resources } from '../resources.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api('/admin/stats').then(setStats).catch(() => {});
  }, []);

  return (
    <>
      <h1 className="page-title">Site administration</h1>
      <div className="dash">
        <div className="dash-main">
          {groups.map((g) => (
            <section className="panel" key={g.title}>
              <h2 className="panel-title">{g.title}</h2>
              <table className="mini">
                <tbody>
                  {g.items.map((key) => (
                    <tr key={key}>
                      <th><Link to={`/admin/${key}`}>{resources[key].plural}</Link>
                        {key === 'quotes' && stats?.newQuotes > 0 && <span className="pill">{stats.newQuotes} new</span>}
                      </th>
                      <td className="num">{stats ? `${stats.counts[key]} total` : ''}</td>
                      <td className="row-actions">
                        {!resources[key].noAdd && <Link to={`/admin/${key}/add`} className="add">+ Add</Link>}
                        <Link to={`/admin/${key}`}>Change</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
        <aside className="panel recent">
          <h2 className="panel-title">Recent actions</h2>
          {!stats?.log?.length && <p className="muted pad">None available</p>}
          <ul>
            {stats?.log?.map((l) => (
              <li key={l.id} className={l.action}>
                <b>{l.object_repr || '—'}</b>
                <span>{l.action} · {l.object_type}</span>
                <small>{l.admin_email} · {l.created_at}</small>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
