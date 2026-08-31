// src/restaurant/RestaurantShell.js
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaSignOutAlt, FaUtensils } from 'react-icons/fa';
import { useRequireRestaurantAuth } from './useRestaurantAuth';
import { logout } from './restaurantActions';
import './Restaurant.css';

const RESTAURANT_USER_KEY = 'restaurant_user';

const NAV_LINKS = [
    { to: '/restaurant', label: 'Dashboard', end: true, roles: null },
    { to: '/restaurant/tables', label: 'Tables', roles: null },
    { to: '/restaurant/orders', label: 'Active Orders', roles: null },
    { to: '/restaurant/kitchen', label: 'Kitchen', roles: ['Admin', 'Kitchen Staff'] },
    { to: '/restaurant/history', label: 'Order History', roles: null }
];

function RestaurantShell({ children, title, subtitle }) {
    const user = useRequireRestaurantAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (!user) return null;

    const handleLogout = () => {
        localStorage.removeItem(RESTAURANT_USER_KEY);
        dispatch(logout());
        navigate('/restaurant/login');
    };

    const links = NAV_LINKS.filter(link => !link.roles || link.roles.includes(user.role));

    return (
        <div className="restaurant-page">
            <header className="restaurant-header">
                <div>
                    <Link to="/restaurant" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaUtensils style={{ color: 'var(--primary)' }} /> {title}
                        </h1>
                    </Link>
                    {subtitle && <p className="section-subtitle">{subtitle}</p>}
                </div>
                <nav className="restaurant-nav">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) => (isActive ? ' active' : '')}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="restaurant-userbar">
                    <Link to="/restaurant/queue" className="btn-modern btn-outline-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }}>
                        Order Queue
                    </Link>
                    <span className="user-chip">
                        👤 {user.name}
                        <span className="role-badge">{user.role}</span>
                    </span>
                    <button className="btn-modern btn-outline-modern" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </header>
            {children}
        </div>
    );
}

export default RestaurantShell;