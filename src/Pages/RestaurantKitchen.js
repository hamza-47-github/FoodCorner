// src/Pages/RestaurantKitchen.js
import React from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { FaPlay, FaCheckCircle } from 'react-icons/fa';
import RestaurantShell from '../restaurant/RestaurantShell';
import { kitchenStart, kitchenReady } from '../restaurant/restaurantActions';
import { orderStatusLabel } from '../restaurant/restaurantSelectors';

const COLUMNS = [
    { key: 'pending', label: 'Pending', action: 'Start Preparing' },
    { key: 'processing', label: 'Processing', action: 'Mark Ready' }
];

function RestaurantKitchen() {
    const restaurant = useSelector(state => state.restaurant);
    const dispatch = useDispatch();

    const handleStart = (order) => dispatch(kitchenStart(order.id));
    const handleReady = (order) => dispatch(kitchenReady(order.id));

    return (
        <RestaurantShell title="Kitchen Display" subtitle="Orders flow: Pending → Processing → Ready">
            <div className="order-board">
                {COLUMNS.map(col => {
                    const orders = restaurant.orders.filter(o => o.status === col.key);
                    return (
                        <div key={col.key} className="kanban-column">
                            <h3>{col.label} <span className="kanban-count">{orders.length}</span></h3>
                            {orders.length === 0 ? (
                                <div className="empty-note" style={{ padding: '1.2rem 0.5rem' }}>No {col.label.toLowerCase()} orders</div>
                            ) : (
                                orders.map(order => (
                                    <div key={order.id} className="order-card">
                                        <div className="order-card-title">
                                            <span>#{order.number}</span>
                                            <span className={`status-pill st-${order.status}`}>{orderStatusLabel(order.status)}</span>
                                        </div>
                                        <div className="order-card-table">Table {order.tableNumber}</div>
                                        <div className="order-card-items">
                                            {order.items.map((i, idx) => (
                                                <div key={idx}>
                                                    {i.name} <strong>x{i.qty}</strong>
                                                    {i.notes && <div className="order-card-note">↳ {i.notes}</div>}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="order-card-footer">
                                            {order.status === 'pending' && (
                                                <button className="btn-modern btn-primary-modern" onClick={() => handleStart(order)}>
                                                    <FaPlay /> Start Preparing
                                                </button>
                                            )}
                                            {order.status === 'processing' && (
                                                <button className="btn-modern btn-primary-modern" onClick={() => handleReady(order)}>
                                                    <FaCheckCircle /> Mark Ready
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    );
                })}
            </div>
        </RestaurantShell>
    );
}

export default RestaurantKitchen;