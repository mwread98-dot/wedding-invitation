import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { wedding } from '../config/wedding';

const nav = [
  ['Our wedding', '/wedding'],
  ['Venue', '/venue'],
  ['Schedule', '/schedule'],
  ['FAQ', '/faq'],
  ['RSVP', '/rsvp'],
] as const;

export function Shell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="wordmark" to="/" aria-label="Home">
          {wedding.partners[0][0]} <span>&</span> {wedding.partners[1][0]}
        </Link>
        <button
          className="menu-button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="main-navigation"
        >
          <span>{open ? 'Close' : 'Menu'}</span>
        </button>
        <nav
          id="main-navigation"
          className={open ? 'nav open' : 'nav'}
          aria-label="Main navigation"
        >
          {nav.map(([label, path]) => (
            <NavLink key={path} to={path} className={({ isActive }) => (isActive ? 'active' : '')}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div>
          <span className="eyebrow">Save the date</span>
          <p>{wedding.displayDate}</p>
        </div>
        <Link className="footer-mark" to="/">
          {wedding.partners[0]} <i>&</i> {wedding.partners[1]}
        </Link>
        <div className="footer-right">
          <Link to="/admin">Admin</Link>
          <a href={`mailto:${wedding.contactEmail}`}>Contact</a>
        </div>
      </footer>
    </div>
  );
}
