// src/pages/SalesHistory.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaPrint, FaReceipt } from 'react-icons/fa';
import { formatPKR } from '../utils/format';
import './Sales.css';

const AUTH_KEY = 'sales_auth';
const SALES_ORDERS_KEY = 'sales_orders';

function SalesHistory() {
    const [orders, setOrders] = useState([]);
    const [selected, setSelected] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem(AUTH_KEY)) {
            navigate('/sales/login');
            return;
        }
        try {
            const saved = JSON.parse(window.localStorage.getItem(SALES_ORDERS_KEY) || '[]');
            setOrders(saved);
        } catch (e) {
            setOrders([]);
        }
    }, [navigate]);

    const stats = useMemo(() => {
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
        const totalItems = orders.reduce((s, o) => s + o.items.reduce((is, i) => is + i.qty, 0), 0);
        return { totalOrders, totalRevenue, totalItems };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        let list = orders;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(o => {
                const itemNames = (o.items || []).map(i => i && i.name).filter(Boolean).join(' ');
                const haystack = [
                    o.customer,
                    o.invoiceNo,
                    o.orderType,
                    o.tableNumber,
                    o.status,
                    itemNames
                ].filter(Boolean).join(' ').toLowerCase();
                return haystack.includes(q);
            });
        }
        return list;
    }, [orders, searchQuery]);

    if (!localStorage.getItem(AUTH_KEY)) {
        return null;
    }

    return (
        <div className="sales-page">
            <div className="sales-header">
                <div>
                    <h1>Order History</h1>
                    <p className="section-subtitle" style={{ margin: 0 }}>Review past orders and preview receipts instantly</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link to="/sales/dashboard" className="btn-modern btn-outline-modern sales-logout-btn">
                        <FaArrowLeft /> Dashboard
                    </Link>
                </div>
            </div>

            <div className="history-stats sales-history-stats">
                <div className="history-stat">
                    <span className="history-stat-label">Orders</span>
                    <span className="history-stat-value">{stats.totalOrders}</span>
                </div>
                <div className="history-stat">
                    <span className="history-stat-label">Revenue</span>
                    <span className="history-stat-value">{formatPKR(stats.totalRevenue)}</span>
                </div>
                <div className="history-stat">
                    <span className="history-stat-label">Items</span>
                    <span className="history-stat-value">{stats.totalItems}</span>
                </div>
            </div>

            <div className="sales-history-layout">
                <div className="history-left">
                    <div className="pos-search history-search">
                        <input
                            type="text"
                            placeholder="Search by customer, item, invoice, or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="history-result-count">
                        {searchQuery.trim()
                            ? `${filteredOrders.length} result${filteredOrders.length === 1 ? '' : 's'} found`
                            : `${orders.length} order${orders.length === 1 ? '' : 's'}`}
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="history-empty">
                            <FaReceipt />
                            <p>{orders.length === 0 ? 'No orders yet' : 'No orders match your search'}</p>
                        </div>
                    ) : (
                        <div className="history-list">
                            {filteredOrders.map((order) => {
                                const initials = order.customer.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
                                const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
                                const typeClass = `history-type-badge type-${order.orderType}`;
                                const active = selected && selected.id === order.id;
                                return (
                                    <div key={order.id} className={`history-card${active ? ' active' : ''}`} onClick={() => setSelected(order)}>
                                        <span className="history-card-avatar">{initials}</span>
                                        <div className="history-card-main">
                                            <div className="history-card-title">
                                                <span className="history-card-name">{order.customer}</span>
                                                <span className={typeClass}>{order.orderType}</span>
                                            </div>
                                            <div className="history-card-meta">
                                                <span className="history-invoice-no">{order.invoiceNo}</span>
                                                <span className="history-dot">•</span>
                                                <span>{new Date(order.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                <span className="history-dot">•</span>
                                                <span className="history-items-badge">{itemCount} items</span>
                                            </div>
                                        </div>
                                        <div className="history-card-side">
                                            <span className="history-card-total">{formatPKR(order.total)}</span>
                                            <div className="history-card-actions">
                                                <button
                                                    className="btn-modern btn-outline-modern receipt-link"
                                                    onClick={(e) => { e.stopPropagation(); setSelected(order); }}
                                                >
                                                    <FaEye /> Smart
                                                </button>
                                                <Link
                                                    to={`/sales/receipt/${order.id}`}
                                                    className="btn-modern btn-outline-modern receipt-link"
                                                >
                                                    <FaPrint /> Print
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="smart-preview-panel">
                    {selected ? (
                        <div className="smart-receipt-modal">
                            <div className="smart-receipt-header">
                                <div className="smart-receipt-logo">🍔</div>
                                <div className="smart-receipt-title">
                                    <h3>Food Corner Burger Shop</h3>
                                    <p>Premium Quality • Fast Service</p>
                                </div>
                            </div>
                            <div className="smart-receipt-body">
                                <div className="smart-receipt-meta">
                                    <div className="smart-receipt-meta-row">
                                        <span className="smart-receipt-meta-label">Invoice</span>
                                        <span className="smart-receipt-meta-value">{selected.invoiceNo}</span>
                                    </div>
                                    <div className="smart-receipt-meta-row">
                                        <span className="smart-receipt-meta-label">Date</span>
                                        <span className="smart-receipt-meta-value">{new Date(selected.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="smart-receipt-meta-row">
                                        <span className="smart-receipt-meta-label">Time</span>
                                        <span className="smart-receipt-meta-value">{new Date(selected.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="smart-receipt-meta-row">
                                        <span className="smart-receipt-meta-label">Customer</span>
                                        <span className="smart-receipt-meta-value">{selected.customer}</span>
                                    </div>
                                    <div className="smart-receipt-meta-row">
                                        <span className="smart-receipt-meta-label">Type</span>
                                        <span className="smart-receipt-meta-value" style={{ textTransform: 'capitalize' }}>{selected.orderType}</span>
                                    </div>
                                    {selected.tableNumber !== '-' && (
                                        <div className="smart-receipt-meta-row">
                                            <span className="smart-receipt-meta-label">Table</span>
                                            <span className="smart-receipt-meta-value">{selected.tableNumber}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="smart-receipt-divider" />

                                <div className="smart-receipt-items">
                                    {selected.items.map((item, i) => (
                                        <div key={i} className="smart-receipt-item">
                                            <div className="smart-receipt-item-left">
                                                <span className="smart-receipt-item-name">{item.name}</span>
                                                <span className="smart-receipt-item-meta">{formatPKR(item.price)} × {item.qty}</span>
                                            </div>
                                            <span className="smart-receipt-item-amount">{formatPKR(item.price * item.qty)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="smart-receipt-divider" />

                                <div className="smart-receipt-totals">
                                    <div className="smart-receipt-total-row">
                                        <span>Subtotal</span>
                                        <span>{formatPKR(selected.subtotal)}</span>
                                    </div>
                                    <div className="smart-receipt-total-row grand">
                                        <span>Total</span>
                                        <span>{formatPKR(selected.total)}</span>
                                    </div>
                                </div>

                                <div className="smart-receipt-stamp">PAID</div>
                            </div>
                            <div className="smart-receipt-footer">
                                <p>Thank you for your business!</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Visit us again soon</p>
                            </div>
                            <div className="smart-receipt-actions">
                                <Link to={`/sales/receipt/${selected.id}`} className="btn-modern btn-primary-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }}>
                                    <FaPrint /> Print Receipt
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="smart-preview-empty">
                            <FaReceipt />
                            <p>No receipt selected</p>
                            <span>Click "Smart" on any order to preview its receipt here.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SalesHistory;