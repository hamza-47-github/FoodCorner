// src/Pages/RestaurantTables.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { formatPKR } from '../utils/format';
import RestaurantShell from '../restaurant/RestaurantShell';
import { statusLabel, sessionRunningTotal, tableNonPaidOrders } from '../restaurant/restaurantSelectors';
import { hasRole } from '../restaurant/useRestaurantAuth';
import { startBilling } from '../restaurant/restaurantActions';

function RestaurantTables() {
    const restaurant = useSelector(state => state.restaurant);
    const user = useSelector(state => state.restaurant.currentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const canTakeOrder = hasRole(user, ['Admin', 'Waiter']);
    const canBill = hasRole(user, ['Admin', 'Cashier']);

    const handleBill = (tableId) => {
        const hasUnpaid = restaurant.bills.some(b => b.tableId === tableId && b.status === 'unpaid');
        if (!hasUnpaid) {
            const served = restaurant.orders.filter(o => o.tableId === tableId && o.status === 'served');
            if (served.length === 0) {
                toast.info('No served orders yet — wait until a waiter marks orders as served.');
            } else {
                dispatch(startBilling(tableId));
                toast.success('Bill generated — ready for payment.');
            }
        }
        navigate(`/restaurant/billing/${tableId}`);
    };

    return (
        <RestaurantShell title="Restaurant Tables" subtitle="Select a table to take an order, serve, or start billing">
            <div className="table-grid">
                {restaurant.tables.map(table => {
                    const running = sessionRunningTotal(restaurant, table.id);
                    const orders = tableNonPaidOrders(restaurant, table.id);
                    return (
                        <div key={table.id} className={`table-card tbl-${table.status}`}>
                            <div className="table-card-number">Table {table.number}</div>
                            <div>
                                <span className={`table-status tsk-${table.status}`}>{statusLabel(table.status)}</span>
                            </div>
                            {running > 0 && (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {orders.length} order(s) · <strong style={{ color: 'var(--primary)' }}>{formatPKR(running)}</strong>
                                </div>
                            )}
                            <div className="table-card-actions">
                                {table.status === 'available' && canTakeOrder && (
                                    <Link to={`/restaurant/order/${table.id}`} className="btn-modern btn-primary-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }}>
                                        Take Order
                                    </Link>
                                )}
                                {(table.status === 'order_pending' || table.status === 'preparing' || table.status === 'ready' || table.status === 'served') && (
                                    <Link to={`/restaurant/order/${table.id}`} className="btn-modern btn-outline-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }}>
                                        + Add Order
                                    </Link>
                                )}
                                {(table.status === 'ready') && (
                                    <Link to={`/restaurant/orders`} className="btn-modern btn-outline-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }}>
                                        Serve
                                    </Link>
                                )}
                                {(table.status === 'served' || table.status === 'billing') && canBill && (
                                    <button className="btn-modern btn-primary-modern" onClick={() => handleBill(table.id)}>
                                        {table.status === 'billing' ? 'View Bill' : 'Generate Bill'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </RestaurantShell>
    );
}

export default RestaurantTables;