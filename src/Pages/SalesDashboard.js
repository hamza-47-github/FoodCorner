// src/pages/SalesDashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBox, FaRupeeSign, FaShoppingBag, FaChartLine, FaSignOutAlt, FaEye, FaPlus, FaMinus, FaTrashAlt, FaUser, FaReceipt, FaPrint, FaChartBar, FaUtensils, FaEdit } from 'react-icons/fa';
import { formatPKR } from '../utils/format';
import { salesMenuItems, salesMenuCategories } from '../data/salesMenu';
import './Sales.css';

const AUTH_KEY = 'sales_auth';
const SALES_ORDERS_KEY = 'sales_orders';

function SalesDashboard() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showStats, setShowStats] = useState(false);
    const [showProfit, setShowProfit] = useState(false);
    const [orderType, setOrderType] = useState('dinein');
    const [tableNumber, setTableNumber] = useState('');
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

    const filteredMenu = useMemo(() => {
        let items = salesMenuItems;
        if (activeCategory !== 'all') {
            items = items.filter(i => i.category === activeCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(i => i.name.toLowerCase().includes(q));
        }
        return items;
    }, [activeCategory, searchQuery]);

    const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.qty, 0), [cart]);
    const cartProfit = useMemo(() => cart.reduce((sum, i) => sum + (i.price - i.cost) * i.qty, 0), [cart]);
    const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(i => {
            if (i.id !== id) return i;
            const newQty = i.qty + delta;
            return newQty <= 0 ? null : { ...i, qty: newQty };
        }).filter(Boolean));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const clearCart = () => {
        setCart([]);
        setCustomerName('');
        setTableNumber('');
    };

    const placeOrder = () => {
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }
        if (!customerName.trim()) {
            alert('Please enter customer name');
            return;
        }
        if (orderType === 'dinein' && !tableNumber.trim()) {
            alert('Please enter table number for dine-in');
            return;
        }

        const order = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
            invoiceNo: `SALE-${Date.now().toString().slice(-6)}`,
            date: new Date(),
            customer: customerName.trim(),
            orderType,
            tableNumber: orderType === 'dinein' ? tableNumber.trim() : '-',
            items: [...cart],
            subtotal: cartTotal,
            profit: cartProfit,
            total: cartTotal,
            status: 'Completed',
        };

        const updated = [order, ...orders].slice(0, 200);
        setOrders(updated);
        localStorage.setItem(SALES_ORDERS_KEY, JSON.stringify(updated));
        clearCart();
        navigate(`/sales/receipt/${order.id}`);
    };

    const handleLogout = () => {
        localStorage.removeItem(AUTH_KEY);
        navigate('/sales/login');
    };

    const stats = useMemo(() => {
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
        const totalProfit = orders.reduce((s, o) => s + o.profit, 0);
        const totalItems = orders.reduce((s, o) => s + o.items.reduce((is, i) => is + i.qty, 0), 0);
        return { totalOrders, totalRevenue, totalProfit, totalItems };
    }, [orders]);

    if (!localStorage.getItem(AUTH_KEY)) {
        return null;
    }

    return (
        <div className="sales-page">
            <div className="sales-header">
                <div>
                    <h1>Burger Shop POS</h1>
                    <p className="section-subtitle" style={{ margin: 0 }}>Take orders, track sales, and print receipts</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn-modern btn-outline-modern sales-logout-btn" onClick={() => setShowStats(!showStats)}>
                        <FaChartBar /> {showStats ? 'Hide' : 'Show'} Stats
                    </button>
                    <Link to="/sales/menu" className="btn-modern btn-outline-modern sales-logout-btn">
                        <FaEdit /> Menu
                    </Link>
                    <Link to="/sales/reports" className="btn-modern btn-outline-modern sales-logout-btn">
                        <FaChartBar /> Reports
                    </Link>
                    <button className="btn-modern btn-outline-modern sales-logout-btn" onClick={() => navigate('/sales/history')}>
                        <FaReceipt /> History ({stats.totalOrders})
                    </button>
                    <button className="btn-modern btn-outline-modern sales-logout-btn" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            {showStats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            <FaShoppingBag />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Orders</span>
                            <span className="stat-value">{stats.totalOrders}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                            <FaRupeeSign />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Revenue</span>
                            <span className="stat-value">{formatPKR(stats.totalRevenue)}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                            <FaChartLine />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Profit</span>
                            <span className="stat-value">{showProfit ? formatPKR(stats.totalProfit) : '****'}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                            <FaBox />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Items Sold</span>
                            <span className="stat-value">{stats.totalItems}</span>
                        </div>
                    </div>
                    <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setShowProfit(!showProfit)}>
                        <div className="stat-icon" style={{ background: showProfit ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #94a3b8, #cbd5e1)' }}>
                            {showProfit ? <FaChartLine /> : <FaEye />}
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Profit Visibility</span>
                            <span className="stat-value">{showProfit ? 'Visible' : 'Hidden'}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="pos-layout">
                <div className="pos-menu-panel">
                    <div className="pos-menu-header">
                        <div className="pos-search">
                            <input
                                type="text"
                                placeholder="Search menu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="pos-categories">
                            {salesMenuCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`category-chip${activeCategory === cat.id ? ' active' : ''}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    <span>{cat.icon}</span>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pos-menu-grid">
                        {filteredMenu.map(item => (
                            <div key={item.id} className="pos-menu-item surface-card" onClick={() => addToCart(item)}>
                                <div className="pos-item-img-wrap">
                                    <img src={item.image} alt={item.name} className="pos-item-img" />
                                </div>
                                <div className="pos-item-header">
                                    <span className="pos-item-name">{item.name}</span>
                                    <span className="pos-item-price">{formatPKR(item.price)}</span>
                                </div>
                                <div className="pos-item-footer">
                                    <span className="pos-item-category">{item.category}</span>
                                        <button
                                            className="btn-modern btn-primary-modern pos-add-btn"
                                            onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                                        >
                                            <FaPlus /> Add
                                        </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pos-cart-panel surface-card">
                    <h2 className="pos-cart-title">Current Order</h2>

                    <div className="pos-customer-field">
                        <FaUser className="pos-customer-icon" />
                        <input
                            type="text"
                            placeholder="Customer name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>

                    <div className="pos-order-type">
                        <label className="order-type-label">Order Type:</label>
                        <div className="order-type-options">
                            {[
                                { value: 'dinein', label: 'Dine In', icon: FaUtensils },
                                { value: 'takeaway', label: 'Takeaway', icon: FaShoppingBag },
                                { value: 'delivery', label: 'Delivery', icon: FaBox },
                            ].map(opt => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`order-type-chip${orderType === opt.value ? ' active' : ''}`}
                                        onClick={() => setOrderType(opt.value)}
                                    >
                                        <Icon /> {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {orderType === 'dinein' && (
                        <div className="pos-table-field">
                            <label htmlFor="table-number">Table Number</label>
                            <input
                                id="table-number"
                                type="text"
                                placeholder="e.g. 12"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="pos-cart-items">
                        {cart.length === 0 ? (
                            <div className="pos-cart-empty">
                                <FaShoppingBag />
                                <p>No items added</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="pos-cart-item">
                                    <img src={item.image} alt={item.name} className="pos-cart-item-img" />
                                    <div className="pos-cart-item-body">
                                        <div className="pos-cart-item-top">
                                            <div className="pos-cart-item-info">
                                                <span className="pos-cart-item-name">{item.name}</span>
                                                <span className="pos-cart-item-unit">{formatPKR(item.price)} each</span>
                                            </div>
                                            <button
                                                className="pos-cart-remove"
                                                onClick={() => removeFromCart(item.id)}
                                                aria-label={`Remove ${item.name}`}
                                                title="Remove item"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                        <div className="pos-cart-item-bottom">
                                            <div className="pos-qty-stepper">
                                                <button className="pos-qty-btn" onClick={() => updateQty(item.id, -1)} aria-label={`Remove one ${item.name}`}>
                                                    <FaMinus />
                                                </button>
                                                <span className="pos-cart-item-qty">{item.qty}</span>
                                                <button className="pos-qty-btn" onClick={() => updateQty(item.id, 1)} aria-label={`Add one ${item.name}`}>
                                                    <FaPlus />
                                                </button>
                                            </div>
                                            <span className="pos-cart-item-price">
                                                {formatPKR(item.price * item.qty)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="pos-cart-summary">
                            <div className="pos-summary-row">
                                <span>Items ({cartCount})</span>
                                <span>{formatPKR(cartTotal)}</span>
                            </div>
                            <button
                                type="button"
                                className={`profit-toggle${showProfit ? ' active' : ''}`}
                                onClick={() => setShowProfit(!showProfit)}
                                style={{ margin: '0.25rem 0', alignSelf: 'flex-start' }}
                            >
                                {showProfit ? 'Hide Profit' : 'Show Profit'}
                            </button>
                            {showProfit && (
                                <div className="pos-summary-row profit">
                                    <span>Profit</span>
                                    <span>{formatPKR(cartProfit)}</span>
                                </div>
                            )}
                            <div className="pos-summary-row total">
                                <span>Total</span>
                                <span>{formatPKR(cartTotal)}</span>
                            </div>
                            <button className="btn-modern btn-primary-modern pos-place-order-btn" onClick={placeOrder}>
                                <FaPrint /> Place Order & Print
                            </button>
                            <button className="btn-modern btn-outline-modern pos-clear-btn" onClick={clearCart}>
                                Clear
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SalesDashboard;
