// src/Pages/RestaurantHome.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatPKR } from '../utils/format';
import RestaurantShell from '../restaurant/RestaurantShell';
import { statusLabel } from '../restaurant/restaurantSelectors';

function RestaurantHome() {
    const restaurant = useSelector(state => state.restaurant);

    const activeOrders = restaurant.orders.filter(o => o.status !== 'paid');
    const openSessions = restaurant.sessions.filter(s => !s.closedAt);
    const occupiedTables = restaurant.tables.filter(t => t.status !== 'available');
    const todayRevenue = restaurant.bills
        .filter(b => b.status === 'paid')
        .reduce((sum, b) => sum + b.total, 0);
    const readyCount = activeOrders.filter(o => o.status === 'ready').length;

    const statusCounts = restaurant.tables.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <RestaurantShell title="Restaurant Dashboard" subtitle="Live overview of tables, orders and kitchen activity">
            <div className="rms-stats">
                <div className="rms-stat"><div className="rms-stat-value">{openSessions.length}</div><div className="rms-stat-label">Active Sessions</div></div>
                <div className="rms-stat"><div className="rms-stat-value">{occupiedTables.length}</div><div className="rms-stat-label">Occupied Tables</div></div>
                <div className="rms-stat"><div className="rms-stat-value">{activeOrders.length}</div><div className="rms-stat-label">Active Orders</div></div>
                <div className="rms-stat"><div className="rms-stat-value">{readyCount}</div><div className="rms-stat-label">Ready to Serve</div></div>
                <div className="rms-stat"><div className="rms-stat-value">{formatPKR(todayRevenue)}</div><div className="rms-stat-label">Paid Revenue</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="rms-stat">
                        <div className="rms-stat-value">{count}</div>
                        <div className="rms-stat-label">{statusLabel(status)} tables</div>
                    </div>
                ))}
            </div>

            <div className="history-row" style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary)' }}>
                <div>
                    <strong>Next step:</strong>{' '}
                    {readyCount > 0
                        ? `${readyCount} order(s) are ready — check Active Orders to serve them.`
                        : activeOrders.length > 0
                            ? 'Orders are being prepared — track them on Active Orders or Kitchen.'
                            : 'Everything is clear — select a table to take a new order.'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link to="/restaurant/tables" className="btn-modern btn-outline-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }}>Tables</Link>
                    <Link to="/restaurant/orders" className="btn-modern btn-outline-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }}>Active Orders</Link>
                </div>
            </div>
        </RestaurantShell>
    );
}

export default RestaurantHome;