// src/Pages/RestaurantLogin.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaLock, FaUserTie, FaStore } from 'react-icons/fa';
import { setUser } from '../restaurant/restaurantActions';
import { users } from '../restaurant/restaurantData';
import '../restaurant/Restaurant.css';
import './Sales.css';

const RESTAURANT_USER_KEY = 'restaurant_user';

function RestaurantLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const found = users.find(u => u.username === username.trim() && u.password === password);
        if (found) {
            dispatch(setUser(found.id));
            localStorage.setItem(RESTAURANT_USER_KEY, JSON.stringify(found));
            navigate('/restaurant');
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="sales-page">
            <div className="sales-login-wrap">
                <div className="sales-login-card">
                    <div className="sales-login-logo">
                        <FaStore />
                    </div>
                    <h1>Restaurant Management</h1>
                    <p className="login-subtitle">Login to manage tables, orders and kitchen</p>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label htmlFor="r-username">Username</label>
                            <input
                                id="r-username"
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="login-field">
                            <label htmlFor="r-password">Password</label>
                            <input
                                id="r-password"
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-modern btn-primary-modern login-btn">
                            <FaLock /> Login
                        </button>
                        {error && <div className="login-error">{error}</div>}
                    </form>

                    <div className="login-roles">
                        <p><FaUserTie /> Demo accounts:</p>
                        <ul>
                            {users.map(u => (
                                <li key={u.id}>
                                    <strong>{u.name}</strong> — {u.role} ({u.username} / {u.password})
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Link to="/" className="btn-modern btn-outline-modern" style={{ width: '100%', textDecoration: 'none', lineHeight: '1.4' }}>
                        Back to Website
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default RestaurantLogin;