// src/Pages/RestaurantOrders.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaUtensils } from 'react-icons/fa';
import RestaurantShell from '../restaurant/RestaurantShell';
import { serveOrder, startBilling } from '../restaurant/restaurantActions';
import { orderStatusLabel } from '../restaurant/restaurantSelectors';

const COLUMNS = [
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'ready', label: 'Ready' },
    { key: 'served', label: 'Served' }
];

function OrderCard({ order, onServe }) {
    return (
        <div className="order-card">
            <div className="order-card-title">
                <span>#{order.number}</span>
                <span className={`status-pill st-${order.status}`}>{orderStatusLabel(order.status)}</span>
            </div>
            <div className="order-card-table">Table {order.tableNumber} · {order.waiter}</div>
            <div className="order-card-items">
                {order.items.map((i, idx) => (
                    <div key={idx}>
                        {i.name} <strong>x{i.qty}</strong>
                        {i.notes && <div className="order-card-note">↳ {i.notes}</div>}
                    </div>
                ))}
            </div>
            <div className="order-card-footer">
                {order.status === 'ready' && (
                    <button className="btn-modern btn-primary-modern" onClick={() => onServe(order)}>
                        <FaUtensils /> Serve Order
                    </button>
                )}
            </div>
        </div>
    );
}

function RestaurantOrders() {
    const restaurant = useSelector(state => state.restaurant);
    const dispatch = useDispatch();

    const handleServe = (order) => {
        dispatch(serveOrder(order.id));
    };

    const handleBill = (tableId) => {
        const hasUnpaid = restaurant.bills.some(b => b.tableId === tableId && b.status === 'unpaid');
        if (!hasUnpaid) {
            dispatch(startBilling(tableId));
        }
    };

    const servedTables = [...new Set(
        restaurant.orders.filter(o => o.status === 'served').map(o => o.tableId)
    )];

    return (
        <RestaurantShell title="Active Orders" subtitle="Monitor kitchen progress and serve ready orders">
            <div className="order-board">
                {COLUMNS.map(col => {
                    const orders = restaurant.orders.filter(o => o.status === col.key);
                    return (
                        <div key={col.key} className="kanban-column">
                            <h3>{col.label} <span className="kanban-count">{orders.length}</span></h3>
                            {orders.length === 0 ? (
                                <div className="empty-note" style={{ padding: '1.2rem 0.5rem' }}>Nothing here</div>
                            ) : (
                                orders.map(order => (
                                    <OrderCard key={order.id} order={order} onServe={handleServe} />
                                ))
                            )}
                        </div>
                    );
                })}
            </div>

            {servedTables.length > 0 && (
                <>
                    <h3 style={{ margin: '1.5rem 0 0.75rem' }}>Ready for Billing</h3>
                    <div className="history-row">
                        <div>
                            Tables with fully served orders:
                            {' '}{servedTables.map(tid => {
                                const t = restaurant.tables.find(tbl => tbl.id === tid);
                                return `Table ${t.number}`;
                            }).join(', ')}
                        </div>
                        {servedTables.map(tid => {
                            const t = restaurant.tables.find(tbl => tbl.id === tid);
                            return (
                                <Link key={tid} to={`/restaurant/billing/${tid}`} className="btn-modern btn-outline-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }} onClick={() => handleBill(tid)}>
                                    Bill Table {t.number}
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}
        </RestaurantShell>
    );
}

export default RestaurantOrders;