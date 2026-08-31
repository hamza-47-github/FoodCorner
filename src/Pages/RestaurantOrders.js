// src/Pages/RestaurantOrders.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaUtensils, FaLock } from 'react-icons/fa';
import RestaurantShell from '../restaurant/RestaurantShell';
import { serveOrder, startBilling } from '../restaurant/restaurantActions';
import { can } from '../restaurant/useRestaurantAuth';
import { orderStatusLabel } from '../restaurant/restaurantSelectors';

const COLUMNS = [
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'ready', label: 'Ready' },
    { key: 'served', label: 'Served' }
];

function OrderCard({ order, onServe, showServe }) {
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
                {order.status === 'ready' && showServe && (
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
    const user = useSelector(state => state.restaurant.currentUser);
    const dispatch = useDispatch();

    const showServe = can(user, 'serveOrder');
    const canBill = can(user, 'billing');

    const handleServe = (order) => {
        dispatch(serveOrder(order.id));
        toast.success(`Order #${order.number} served — table ${order.tableNumber} is ready for billing.`);
    };

    const handleBill = (tableId) => {
        const hasUnpaid = restaurant.bills.some(b => b.tableId === tableId && b.status === 'unpaid');
        if (!hasUnpaid) {
            dispatch(startBilling(tableId));
            toast.success('Bill generated — ready for payment.');
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
                                    <OrderCard key={order.id} order={order} onServe={handleServe} showServe={showServe} />
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
                        {canBill ? (
                            servedTables.map(tid => {
                                const t = restaurant.tables.find(tbl => tbl.id === tid);
                                return (
                                    <Link key={tid} to={`/restaurant/billing/${tid}`} className="btn-modern btn-outline-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }} onClick={() => handleBill(tid)}>
                                        Bill Table {t.number}
                                    </Link>
                                );
                            })
                        ) : (
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}><FaLock /> Ask the Cashier or Admin to generate the bill.</span>
                        )}
                    </div>
                </>
            )}
        </RestaurantShell>
    );
}

export default RestaurantOrders;