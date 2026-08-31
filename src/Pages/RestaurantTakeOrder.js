// src/Pages/RestaurantTakeOrder.js
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaMinus, FaTrashAlt, FaCheckCircle } from 'react-icons/fa';
import { formatPKR } from '../utils/format';
import RestaurantShell from '../restaurant/RestaurantShell';
import { placeOrder } from '../restaurant/restaurantActions';
import { menuByCategory, ordersForTable } from '../restaurant/restaurantSelectors';

function RestaurantTakeOrder() {
    const { tableId } = useParams();
    const restaurant = useSelector(state => state.restaurant);
    const user = useSelector(state => state.restaurant.currentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const table = restaurant.tables.find(t => t.id === tableId);
    const [activeCategory, setActiveCategory] = useState('All');
    const [cart, setCart] = useState([]);

    if (!table) {
        return (
            <RestaurantShell title="Take Order">
                <div className="empty-note">Table not found.</div>
            </RestaurantShell>
        );
    }

    const categories = ['All', ...Object.keys(menuByCategory(restaurant.menuItems))];
    const visibleItems = menuByCategory(restaurant.menuItems);
    const items = activeCategory === 'All'
        ? restaurant.menuItems
        : (visibleItems[activeCategory] || []);

    const addItem = (item) => {
        setCart(prev => {
            const found = prev.find(i => i.menuId === item.id);
            if (found) {
                return prev.map(i => i.menuId === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { menuId: item.id, name: item.name, price: item.price, qty: 1, notes: '' }];
        });
    };

    const changeQty = (menuId, delta) => {
        setCart(prev => prev.map(i => {
            if (i.menuId !== menuId) return i;
            return { ...i, qty: Math.max(0, i.qty + delta) };
        }).filter(i => i.qty > 0));
    };

    const setNotes = (menuId, notes) => {
        setCart(prev => prev.map(i => (i.menuId === menuId ? { ...i, notes } : i)));
    };

    const removeItem = (menuId) => {
        setCart(prev => prev.filter(i => i.menuId !== menuId));
    };

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const existingOrders = ordersForTable(restaurant, tableId);

    const handlePlaceOrder = () => {
        if (cart.length === 0) return;
        const items = cart.map(i => ({
            menuId: i.menuId,
            name: i.name,
            price: i.price,
            qty: i.qty,
            notes: i.notes.trim()
        }));
        dispatch(placeOrder({ tableId, items, waiter: user.name }));
        setCart([]);
        navigate('/restaurant/orders');
    };

    return (
        <RestaurantShell title={`Take Order — Table ${table.number}`} subtitle="Add items, quantities and notes, then place the order">
            {existingOrders.length > 0 && (
                <div className="bill-summary" style={{ marginBottom: '1rem' }}>
                    <strong>Existing order(s) on this table:</strong>
                    {existingOrders.map(o => (
                        <div key={o.id} style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
                            #{o.number} · {o.status} · {o.items.map(i => `${i.name} x${i.qty}`).join(', ')}
                        </div>
                    ))}
                    <div style={{ marginTop: '0.5rem' }}><Link to="/restaurant/tables" className="btn-modern btn-outline-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }}>Back to Tables</Link></div>
                </div>
            )}

            <div className="take-order-layout">
                <div>
                    <div className="menu-categories">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`category-chip${activeCategory === cat ? ' active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="menu-grid">
                        {items.map(item => (
                            <div key={item.id} className="menu-card" onClick={() => addItem(item)}>
                                <div className="menu-name">{item.name}</div>
                                <div className="menu-price">{formatPKR(item.price)}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="cart-sheet">
                    <h3 style={{ margin: '0 0 0.6rem' }}>Current Order</h3>
                    {cart.length === 0 ? (
                        <div className="empty-note" style={{ padding: '1.5rem 0.5rem' }}>Tap menu items to add them.</div>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.menuId} className="cart-line">
                                    <div style={{ minWidth: 0 }}>
                                        <div className="cart-line-name">{item.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatPKR(item.price)} × {item.qty}</div>
                                        {item.notes && <div className="cart-line-note">Note: {item.notes}</div>}
                                        <input
                                            className="order-input"
                                            placeholder="Item note (e.g. no onion)"
                                            value={item.notes}
                                            onChange={(e) => setNotes(item.menuId, e.target.value)}
                                        />
                                    </div>
                                    <div className="cart-line-actions">
                                        <span className="qty-stepper">
                                            <button className="qty-btn" type="button" onClick={() => changeQty(item.menuId, -1)}><FaMinus /></button>
                                            <span style={{ minWidth: 26, textAlign: 'center', fontWeight: 700 }}>{item.qty}</span>
                                            <button className="qty-btn" type="button" onClick={() => changeQty(item.menuId, 1)}><FaPlus /></button>
                                        </span>
                                        <button className="qty-btn" type="button" onClick={() => removeItem(item.menuId)} title="Remove"><FaTrashAlt /></button>
                                    </div>
                                </div>
                            ))}
                            <div className="cart-total-row grand">
                                <span>Subtotal</span>
                                <span>{formatPKR(subtotal)}</span>
                            </div>
                            <button className="btn-modern btn-primary-modern" style={{ width: '100%' }} onClick={handlePlaceOrder} disabled={cart.length === 0}>
                                <FaCheckCircle /> Place Order
                            </button>
                        </>
                    )}
                </div>
            </div>
        </RestaurantShell>
    );
}

export default RestaurantTakeOrder;