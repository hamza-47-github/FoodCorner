// src/components/Layout.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaSun, FaMoon, FaUtensils, FaThLarge } from 'react-icons/fa';
import { useTheme } from './theme/ThemeContext';
import './Layout.css';

const navLinks = [
  // { to: '/', label: 'Home' },
  // { to: '/cart', label: 'Cart' },
  // { to: '/checkout', label: 'Checkout' },
  // { to: '/history', label: 'Order History' },
  // { to: '/tracking', label: 'Track Order' },
  // { to: '/sales/login', label: 'Sales' },
  { to: '/restaurant/login', label: 'Restaurant' },
  { to: '/restaurant/queue', label: 'Order Queue' },
];

const extraNavLinks = [
  { to: '/prayer-times', label: 'Prayer Times', icon: '🕌' },
  { to: '/weather', label: 'Weather', icon: '🌤️' },
  { to: '/location', label: 'Location Tracker', icon: '📍' },
  { to: '/calendar', label: 'Event Calendar', icon: '📅' },
];

const Layout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [extraMenuOpen, setExtraMenuOpen] = useState(false);
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart.items || []);
  const cartCount = cartItems.reduce((n, i) => n + (i.qty || 1), 0);
  const extraRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setExtraMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (extraRef.current && !extraRef.current.contains(e.target)) {
        setExtraMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="app-shell">
      <nav className="topbar">
        <div className="topbar-inner">
          <Link className="brand" to="/">
            <span className="brand-icon">
              <FaUtensils />
            </span>
            Food<span className="brand-accent">Corner</span>
          </Link>

          <div className={`nav-menu${menuOpen ? ' open' : ''}`}>
            <ul className="nav-links">
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `nav-link-modern${isActive ? ' active' : ''}`
                    }
                  >
                    {label}
                    {to === '/cart' && cartCount > 0 && (
                      <span className="cart-badge">{cartCount}</span>
                    )}
                  </NavLink>
                </li>
              ))}
              <li className="nav-extra-item">
                <button
                  className={`nav-extra-btn${extraMenuOpen ? ' open' : ''}`}
                  onClick={() => setExtraMenuOpen((o) => !o)}
                  aria-expanded={extraMenuOpen}
                  aria-label="More menus"
                  title="More"
                >
                  <FaThLarge />
                </button>
                <div
                  className={`extra-dropdown${extraMenuOpen ? ' open' : ''}`}
                  ref={extraRef}
                >
                  {extraNavLinks.map(({ to, label, icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/'}
                      className={({ isActive }) =>
                        `extra-dropdown-link${isActive ? ' active' : ''}`
                      }
                    >
                      <span className="extra-icon">{icon}</span>
                      {label}
                    </NavLink>
                  ))}
                </div>
              </li>
            </ul>

            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <button
            className="nav-toggle"
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>
        </div>
      </nav>

      <main className="page-content">{children}</main>

      <footer className="site-footer">
        © {new Date().getFullYear()} Food Corner — Fresh meals, every day.
      </footer>
    </div>
  );
};

export default Layout;
