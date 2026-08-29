// src/pages/History.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaChevronRight, FaShoppingBag, FaTrashAlt } from 'react-icons/fa';
import { formatPKR } from '../utils/format';
import './History.css';

function History() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const saved = JSON.parse(window.localStorage.getItem('hamzafood-orders') || '[]');
            setOrders(saved);
        } catch (e) {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearHistory = () => {
        window.localStorage.removeItem('hamzafood-orders');
        setOrders([]);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return 'status-confirmed';
            case 'Preparing': return 'status-preparing';
            case 'Out for Delivery': return 'status-delivering';
            case 'Delivered': return 'status-delivered';
            default: return 'status-pending';
        }
    };

    return (
        <div className="history-page">
            <div className="history-header">
                <div>
                    <h1 className="section-title">Order History</h1>
                    <p className="section-subtitle">Track and review your past orders.</p>
                </div>
                {orders.length > 0 && (
                    <button className="btn-modern btn-danger-modern" onClick={clearHistory}>
                        <FaTrashAlt /> Clear All
                    </button>
                )}
            </div>

            {loading ? (
                <div className="empty-state">
                    <h2>Loading...</h2>
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon"><FaShoppingBag /></span>
                    <h2>No orders yet</h2>
                    <p>Your order history will appear here after your first purchase.</p>
                    <Link to="/" className="btn-modern btn-primary-modern">Browse Menu</Link>
                </div>
            ) : (
                <div className="orders-list stagger">
                    {orders.map((order) => (
                        <div key={order.orderId} className="order-card surface-card">
                            <div className="order-card-header">
                                <div className="order-id-group">
                                    <FaBox className="order-icon" />
                                    <div>
                                        <strong>{order.invoiceNo}</strong>
                                        <span className="order-date">
                                            {new Date(order.placedAt).toLocaleDateString()} • {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <span className={`order-status ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="order-items-preview">
                                {order.items.slice(0, 3).map((item, i) => (
                                    <span key={i} className="order-item-chip">
                                        {item.name} x{item.qty || 1}
                                    </span>
                                ))}
                                {order.items.length > 3 && (
                                    <span className="order-more">+{order.items.length - 3} more</span>
                                )}
                            </div>

                            <div className="order-card-footer">
                                <div className="order-total">
                                    <span>Total</span>
                                    <strong>{formatPKR(order.total)}</strong>
                                </div>
                                <Link to={`/tracking/${order.orderId}`} className="btn-modern btn-outline-modern track-link">
                                    Track Order <FaChevronRight />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default History;
