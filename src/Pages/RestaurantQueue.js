// src/Pages/RestaurantQueue.js
// Public "order queue" board: shows live order number, table number and status.
// No login required — customers can open this page to track their orders.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStore, FaUtensils, FaExternalLinkAlt, FaListOl } from 'react-icons/fa';
import '../restaurant/Restaurant.css';
import { initialRestaurantState } from '../restaurant/restaurantData';
import { orderStatusLabel } from '../restaurant/restaurantSelectors';

const SNAPSHOT_KEY = 'restaurant_snapshot';

const loadQueueState = () => {
    try {
        const raw = window.localStorage.getItem(SNAPSHOT_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.orders) && Array.isArray(parsed.tables)) {
                return parsed;
            }
        }
    } catch (e) {
        // ignore malformed snapshot
    }
    return initialRestaurantState;
};

function useQueueState() {
    const [restaurant, setRestaurant] = useState(loadQueueState);

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === SNAPSHOT_KEY) {
                setRestaurant(loadQueueState());
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    return restaurant;
}

function formatTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const SEQUENCE = ['pending', 'processing', 'ready', 'served', 'billing'];

function RestaurantQueue() {
    const restaurant = useQueueState();

    const active = restaurant.orders
        .filter(o => o.status !== 'paid')
        .slice()
        .sort((a, b) => (a.createdTime || '').localeCompare(b.createdTime || ''));

    const statusCounts = SEQUENCE.map(status => ({
        status,
        count: active.filter(o => o.status === status).length
    }));

    return (
        <div className="queue-page">
            <div className="queue-head">
                <div className="queue-brand">
                    <span className="queue-brand-icon"><FaStore /></span>
                    <div>
                        <h1>Live Order Queue</h1>
                        <p className="queue-sub">
                            Track your order by number and table — updates in real time. No login required.
                        </p>
                    </div>
                </div>
                <Link to="/restaurant/login" className="btn-modern btn-outline-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }}>
                    <FaExternalLinkAlt /> Staff Login
                </Link>
            </div>

            <div className="queue-legend">
                {statusCounts.map(({ status, count }) => (
                    <span key={status} className={`status-pill st-${status}`} style={{ padding: '0.4rem 0.9rem' }}>
                        {orderStatusLabel(status)}: {count}
                    </span>
                ))}
            </div>

            {active.length === 0 ? (
                <div className="empty-note">
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><FaUtensils /></div>
                    No active orders right now — check back shortly.
                </div>
            ) : (
                <div className="queue-grid">
                    {active.map(order => (
                        <div key={order.id} className="queue-card">
                            <div className="queue-card-top">
                                <span className="queue-order-no">Order #{order.number}</span>
                                <span className="queue-table-no">Table {order.tableNumber}</span>
                                <span className={`status-pill st-${order.status}`}>{orderStatusLabel(order.status)}</span>
                            </div>
                            <div className="queue-card-items">
                                {order.items.map((i, idx) => (
                                    <div key={idx} className="queue-item">
                                        <span>{i.name} <strong>x{i.qty}</strong></span>
                                    </div>
                                ))}
                            </div>
                            <div className="queue-card-foot">
                                <span className="queue-time"><FaListOl /> <strong>#{order.number}</strong></span>
                                <span className="queue-time">Placed {formatTime(order.createdTime)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="queue-hint">
                Board refreshes automatically while staff update orders. Restaurant &amp; Kitchen demo.
            </p>
        </div>
    );
}

export default RestaurantQueue;