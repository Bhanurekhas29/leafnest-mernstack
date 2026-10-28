import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { clearSession, adminEmail } from './api.js';
import { groups, resources } from './resources.js';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);

  const logout = () => {
    clearSession();
    navigate('/admin/login');
  };

  return (
    <div className="shell">
      <header className="topbar">
        <button className="menu-btn" aria-label="Toggle menu" onClick={() => setMenu(!menu)}>☰</button>
        <Link to="/admin" className="site-title"><img src="/logo.svg" alt="" className="adm-logo" />Leafnest administration</Link>
        <div className="user-tools">
          <span>Welcome, <b>{adminEmail()}</b></span>
          <a href="/" target="_blank" rel="noreferrer">View site</a>
          <Link to="/admin/password-change">Change password</Link>
          <button onClick={logout}>Log out</button>
        </div>
      </header>

      <div className="body">
        <aside className={`sidebar ${menu ? 'open' : ''}`} onClick={() => setMenu(false)}>
          <NavLink to="/admin" end className="side-link home">Dashboard</NavLink>
          {groups.map((g) => (
            <div className="side-group" key={g.title}>
              <h4>{g.title}</h4>
              {g.items.map((key) => (
                <NavLink key={key} to={`/admin/${key}`} className={`side-link ${pathname.startsWith(`/admin/${key}`) ? 'active' : ''}`}>
                  {resources[key].plural}
                </NavLink>
              ))}
            </div>
          ))}
        </aside>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
