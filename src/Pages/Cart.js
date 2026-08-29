// src/pages/Cart.js
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaTrashAlt, FaShoppingBag, FaMinus, FaPlus, FaTag, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { foodItems, promoCodes } from '../data';
import { formatPKR } from '../utils/format';
import { toast } from 'react-toastify';
import './Cart.css';

function Cart() {
    const cartItems = useSelector(state => state.cart.items || []);
    const promo = useSelector(state => state.promo || {});
    const dispatch = useDispatch();
    const [promoInput, setPromoInput] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);

    const increment = (id) => dispatch({ type: 'INCREMENT_QTY', id });
    const decrement = (id) => dispatch({ type: 'DECREMENT_QTY', id });
    const removeItem = (id) => {
        const item = cartItems.find(i => i.id === id);
        dispatch({ type: 'REMOVE_FROM_CART', id });
        if (item) {
            toast.info(`${item.name} removed from cart`, {
                icon: <FaTrashAlt />,
                style: { background: '#6366f1', color: '#fff' }
            });
        }
    };

    const quickAdd = (item) => {
        dispatch({ type: 'ADD_TO_CART', food: item });
        toast.success(`${item.name} added to cart`, {
            icon: <FaShoppingBag />,
            style: { background: '#10b981', color: '#fff' }
        });
    };

    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * (item.qty || 1), 0), [cartItems]);

    const discount = useMemo(() => {
        if (!promo || !promo.code) return 0;
        if (promo.type === 'percent') {
            return subtotal * (promo.value / 100);
        }
        if (promo.type === 'fixed') {
            return Math.min(promo.value, subtotal);
        }
        return 0;
    }, [subtotal, promo]);

    const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

    const applyPromo = () => {
        const code = promoInput.trim().toUpperCase();
        if (!code) {
            toast.warning('Please enter a promo code');
            return;
        }
        if (promo && promo.code === code) {
            toast.info('Promo code already applied');
            return;
        }
        const promoData = promoCodes[code];
        if (!promoData) {
            toast.error('Invalid promo code');
            return;
        }
        if (promoData.category) {
            const hasItem = cartItems.some(i => i.category === promoData.category);
            if (!hasItem) {
                toast.error(`This code applies only to ${promoData.category} items`);
                return;
            }
        }
        setPromoLoading(true);
        setTimeout(() => {
            dispatch({
                type: 'APPLY_PROMO',
                payload: {
                    code,
                    discount: promoData.type === 'percent'
                        ? subtotal * (promoData.value / 100)
                        : Math.min(promoData.value, subtotal),
                    type: promoData.type,
                    value: promoData.value
                }
            });
            setPromoLoading(false);
            setPromoInput('');
            toast.success(`Promo applied: ${promoData.description}`);
        }, 600);
    };

    const removePromo = () => {
        dispatch({ type: 'REMOVE_PROMO' });
        toast.info('Promo code removed');
    };

    return (
        <div className="cart-page">
            <h1 className="section-title">Your Cart</h1>
            <p className="section-subtitle">Review your selected dishes before checkout.</p>

            {cartItems.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon"><FaShoppingBag /></span>
                    <h2>Your cart is empty</h2>
                    <p>Browse the menu and add something delicious.</p>
                    <Link to="/" className="btn-modern btn-primary-modern">Browse Menu</Link>
                </div>
            ) : (
                <div className="cart-layout">
                    <div className="cart-items stagger">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-media">
                                    <img src={item.image} alt={item.name} className="cart-item-image" />
                                    <button
                                        className="cart-remove"
                                        onClick={() => removeItem(item.id)}
                                        aria-label={`Remove ${item.name}`}
                                        title="Remove"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </div>
                                <h2 className="cart-item-name">{item.name}</h2>
                                <div className="cart-item-row">
                                    <span className="cart-item-price">{formatPKR(item.price)}</span>
                                    <div className="qty-stepper">
                                        <button onClick={() => decrement(item.id)} aria-label="Decrease quantity">
                                            <FaMinus />
                                        </button>
                                        <span>{item.qty || 1}</span>
                                        <button onClick={() => increment(item.id)} aria-label="Increase quantity">
                                            <FaPlus />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <aside className="cart-summary surface-card">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Items ({cartItems.reduce((n, i) => n + (i.qty || 1), 0)})</span>
                            <span>{formatPKR(subtotal)}</span>
                        </div>
                        {promo && promo.code && (
                            <div className="summary-row discount-row">
                                <span>Discount ({promo.code})</span>
                                <span className="discount-value">-{formatPKR(discount)}</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{formatPKR(total)}</span>
                        </div>

                        {/* Promo code input */}
                        <div className="promo-section">
                            {promo && promo.code ? (
                                <div className="promo-applied">
                                    <FaCheckCircle className="promo-icon applied" />
                                    <span>{promo.code} applied</span>
                                    <button className="promo-remove" onClick={removePromo} aria-label="Remove promo">
                                        <FaTimesCircle />
                                    </button>
                                </div>
                            ) : (
                                <div className="promo-input-group">
                                    <div className="promo-input-wrapper">
                                        <FaTag className="promo-icon" />
                                        <input
                                            type="text"
                                            placeholder="Promo code"
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                                            className="promo-input"
                                        />
                                    </div>
                                    <button
                                        className="btn-modern btn-outline-modern promo-btn"
                                        onClick={applyPromo}
                                        disabled={promoLoading}
                                    >
                                        {promoLoading ? 'Applying...' : 'Apply'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <Link to="/checkout" className="btn-modern btn-primary-modern summary-cta">
                            Proceed to Checkout
                        </Link>
                    </aside>
                </div>
            )}

            <section className="quick-add">
                <h2 className="section-title">Craving More?</h2>
                <p className="section-subtitle">
                    Tap + on any dish to add it straight to your cart.
                </p>
                <div className="quick-add-grid stagger">
                    {foodItems.map(item => (
                        <div key={item.id} className="quick-add-card surface-card">
                            <img src={item.image} alt={item.name} className="qa-image" />
                                <div className="qa-info">
                                    <span className="qa-name">{item.name}</span>
                                    <span className="qa-price">{formatPKR(item.price)}</span>
                                </div>
                            <button
                                className="qa-add"
                                onClick={() => quickAdd(item)}
                                aria-label={`Add ${item.name} to cart`}
                                title={`Add ${item.name}`}
                            >
                                <FaPlus />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Cart;
