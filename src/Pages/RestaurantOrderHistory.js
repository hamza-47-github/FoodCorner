// src/Pages/RestaurantOrderHistory.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaRedoAlt, FaReceipt } from 'react-icons/fa';
import { formatPKR } from '../utils/format';
import RestaurantShell from '../restaurant/RestaurantShell';
import { resetDemo } from '../restaurant/restaurantActions';
import { orderStatusLabel } from '../restaurant/restaurantSelectors';

function formatTime(iso) {
    return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

function RestaurantOrderHistory() {
    const dispatch = useDispatch();
    const restaurant = useSelector(state => state.restaurant);
    const orders = [...restaurant.orders].sort((a, b) => b.number - a.number);
    const paidBills = restaurant.bills.filter(b => b.status === 'paid');

    return (
        <RestaurantShell title="Order History" subtitle="All orders, bills and receipts">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn-modern btn-outline-modern" onClick={() => dispatch(resetDemo())}>
                    <FaRedoAlt /> Reset Demo Data
                </button>
            </div>

            <h3 style={{ margin: '0 0 0.75rem' }}>Orders ({orders.length})</h3>
            {orders.length === 0 ? (
                <div className="empty-note">No orders yet.</div>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="history-row">
                        <div>
                            <strong>#{order.number}</strong> · Table {order.tableNumber} · {order.waiter}
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {order.items.map(i => `${i.name} x${i.qty}`).join(', ')} · {formatTime(order.createdTime)}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className={`status-pill st-${order.status}`}>{orderStatusLabel(order.status)}</span>
                            <strong>{formatPKR(order.subtotal)}</strong>
                        </div>
                    </div>
                ))
            )}

            <h3 style={{ margin: '2rem 0 0.75rem' }}>Paid Bills & Receipts ({paidBills.length})</h3>
            {paidBills.length === 0 ? (
                <div className="empty-note">No completed payments yet.</div>
            ) : (
                paidBills.map(bill => {
                    const receipt = restaurant.receipts.find(r => r.billId === bill.id);
                    return (
                        <div key={bill.id} className="history-row">
                            <div>
                                <strong>{bill.number}</strong> · Table {bill.tableId.replace('t', '')} · {formatTime(bill.paidAt)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <strong>{formatPKR(bill.total)}</strong>
                                {receipt && (
                                    <Link to={`/restaurant/receipt/${bill.id}`} className="btn-modern btn-outline-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }}>
                                        <FaReceipt /> Receipt
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </RestaurantShell>
    );
}

export default RestaurantOrderHistory;