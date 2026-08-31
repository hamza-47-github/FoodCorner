// src/Pages/RestaurantMenu.js
// Admin-only: add and remove menu items. New items appear instantly in the
// order-taking menu grid, billing and receipts.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaPlus, FaTrashAlt, FaLock } from 'react-icons/fa';
import { formatPKR } from '../utils/format';
import RestaurantShell from '../restaurant/RestaurantShell';
import { addMenuItem, removeMenuItem } from '../restaurant/restaurantActions';
import { can } from '../restaurant/useRestaurantAuth';
import { menuByCategory } from '../restaurant/restaurantSelectors';
import { CATEGORY_TONES } from '../restaurant/restaurantData';

const EMOJI_QUICK = ['🍔', '🍕', '🍟', '🥤', '🍗', '🍢', '🥖', '🍰', '🍦', '🍽️', '🥗', '🍜'];

function RestaurantMenu() {
    const restaurant = useSelector(state => state.restaurant);
    const user = useSelector(state => state.restaurant.currentUser);
    const dispatch = useDispatch();

    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');

    if (!can(user, 'manageMenu')) {
        return (
            <RestaurantShell title="Menu Management" subtitle="Role permissions">
                <div className="empty-note">
                    <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}><FaLock /></div>
                    Only the <strong>Admin</strong> role can add or remove menu items.
                    <div style={{ marginTop: '0.9rem' }}>
                        <Link to="/restaurant/login" className="btn-modern btn-primary-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }}>
                            Login as Admin
                        </Link>
                    </div>
                </div>
            </RestaurantShell>
        );
    }

    const categories = Object.keys(menuByCategory(restaurant.menuItems));

    const handleAdd = (e) => {
        e.preventDefault();
        const priceNum = parseInt(price, 10);
        if (!name.trim()) return toast.error('Item name is required.');
        if (!category.trim()) return toast.error('Category is required.');
        if (!priceNum || priceNum <= 0) return toast.error('Enter a valid price.');
        dispatch(addMenuItem({ name, category, price: priceNum, image }));
        toast.success(`Added "${name}" to the menu.`);
        setName('');
        setCategory('');
        setPrice('');
        setImage('');
    };

    const handleRemove = (item) => {
        if (!window.confirm(`Remove "${item.name}" from the menu?`)) return;
        dispatch(removeMenuItem(item.id));
        toast.info(`Removed "${item.name}".`);
    };

    return (
        <RestaurantShell title="Menu Management" subtitle="Admin — add and remove menu items">
            <div className="take-order-layout">
                <div>
                    <h3 style={{ margin: '0 0 0.75rem' }}>Menu Items ({restaurant.menuItems.length})</h3>
                    <div className="menu-grid">
                        {restaurant.menuItems.map(item => (
                            <div key={item.id} className="menu-card" style={{ cursor: 'default' }}>
                                <div className="menu-thumb" style={{ background: CATEGORY_TONES[item.category] || 'var(--primary-soft)' }}>
                                    {item.image}
                                </div>
                                <div className="menu-name">{item.name}</div>
                                <div className="menu-price">{formatPKR(item.price)}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0.9rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category}</span>
                                    <button
                                        type="button"
                                        className="qty-btn"
                                        title="Remove item"
                                        onClick={() => handleRemove(item)}
                                    >
                                        <FaTrashAlt style={{ fontSize: '0.68rem' }} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="cart-sheet">
                    <h3 style={{ margin: '0 0 0.6rem' }}>Add Menu Item</h3>
                    <form onSubmit={handleAdd}>
                        <div className="payment-field">
                            <label htmlFor="mi-name">Name</label>
                            <input id="mi-name" className="order-input" placeholder="e.g. Chicken Wings" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="payment-field">
                            <label htmlFor="mi-category">Category</label>
                            <input id="mi-category" className="order-input" list="menu-categories" placeholder="e.g. Extras" value={category} onChange={(e) => setCategory(e.target.value)} required />
                            <datalist id="menu-categories">
                                {categories.map(cat => <option key={cat} value={cat} />)}
                            </datalist>
                        </div>
                        <div className="payment-field">
                            <label htmlFor="mi-price">Price (Rs.)</label>
                            <input id="mi-price" className="order-input" type="number" min="1" placeholder="e.g. 500" value={price} onChange={(e) => setPrice(e.target.value)} required />
                        </div>
                        <div className="payment-field">
                            <label htmlFor="mi-image">Image / Icon</label>
                            <input id="mi-image" className="order-input" placeholder="e.g. 🍗" value={image} onChange={(e) => setImage(e.target.value)} />
                            <div className="emoji-quick">
                                {EMOJI_QUICK.map(e => (
                                    <button key={e} type="button" className="emoji-pick" onClick={() => setImage(e)}>{e}</button>
                                ))}
                            </div>
                        </div>
                        <button className="btn-modern btn-primary-modern" style={{ width: '100%' }} type="submit">
                            <FaPlus /> Add to Menu
                        </button>
                    </form>
                </div>
            </div>
        </RestaurantShell>
    );
}

export default RestaurantMenu;