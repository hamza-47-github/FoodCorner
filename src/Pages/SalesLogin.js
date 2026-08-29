// src/pages/SalesLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaStore } from 'react-icons/fa';
import { setCookie } from '../utils/cookies';
import './Sales.css';

const HARDCODED_USERNAME = 'admin';
const HARDCODED_PASSWORD = 'admin123';

function SalesLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
            setCookie('sales_auth', 'true', 7);
            localStorage.setItem('sales_auth', 'true');
            navigate('/sales/dashboard');
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
                    <h1>Burger Shop POS</h1>
                    <p className="login-subtitle">Login to manage orders and track sales</p>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="login-field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
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
                </div>
            </div>
        </div>
    );
}

export default SalesLogin;
