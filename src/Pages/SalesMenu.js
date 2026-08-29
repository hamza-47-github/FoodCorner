// src/pages/SalesMenu.js
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrashAlt, FaSave, FaTimes } from 'react-icons/fa';
import { formatPKR } from '../utils/format';
import './Sales.css';

const MENU_KEY = 'sales_menu_items';
const CATEGORIES_KEY = 'sales_menu_categories';

const defaultCategories = [
    { id: 'burgers', name: 'Burgers', icon: '🍔' },
    { id: 'sides', name: 'Sides', icon: '🍟' },
    { id: 'drinks', name: 'Drinks', icon: '🥤' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
    { id: 'combos', name: 'Combos', icon: '🍱' },
];

function SalesMenu() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState(defaultCategories);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({
        name: '', price: '', cost: '', category: 'burgers', image: ''
    });
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        const savedItems = localStorage.getItem(MENU_KEY);
        const savedCats = localStorage.getItem(CATEGORIES_KEY);
        if (savedItems) {
            setItems(JSON.parse(savedItems));
        }
        if (savedCats) {
            setCategories(JSON.parse(savedCats));
        }
    }, []);

    const saveItems = (newItems) => {
        setItems(newItems);
        localStorage.setItem(MENU_KEY, JSON.stringify(newItems));
    };

    const saveCategories = (newCats) => {
        setCategories(newCats);
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCats));
    };

    const resetForm = () => {
        setForm({ name: '', price: '', cost: '', category: 'burgers', image: '' });
        setEditingItem(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.price) return;

        const item = {
            id: editingItem ? editingItem.id : Date.now(),
            name: form.name.trim(),
            price: Number(form.price),
            cost: Number(form.cost) || 0,
            category: form.category,
            image: form.image.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
        };

        if (editingItem) {
            saveItems(items.map(i => i.id === editingItem.id ? item : i));
        } else {
            saveItems([...items, item]);
        }
        resetForm();
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setForm({
            name: item.name,
            price: item.price.toString(),
            cost: item.cost.toString(),
            category: item.category,
            image: item.image || '',
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this item?')) {
            saveItems(items.filter(i => i.id !== id));
        }
    };

    const addCategory = () => {
        if (!newCategory.trim()) return;
        const id = newCategory.toLowerCase().replace(/\s+/g, '_');
        if (categories.find(c => c.id === id)) return;
        saveCategories([...categories, { id, name: newCategory.trim(), icon: '🍽️' }]);
        setNewCategory('');
    };

    const deleteCategory = (id) => {
        if (id === 'burgers' || id === 'sides' || id === 'drinks' || id === 'desserts' || id === 'combos') {
            alert('Cannot delete default category');
            return;
        }
        if (window.confirm('Delete this category?')) {
            saveCategories(categories.filter(c => c.id !== id));
        }
    };

    return (
        <div className="sales-page">
            <div className="sales-header">
                <div>
                    <h1>Menu Management</h1>
                    <p className="section-subtitle" style={{ margin: 0 }}>Add, edit, and remove menu items</p>
                </div>
            </div>

            <div className="menu-manage-layout">
                <div className="menu-form-card surface-card">
                    <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                    <form className="menu-form" onSubmit={handleSubmit}>
                        <div className="menu-field">
                            <label>Item Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Cheese Burger"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="menu-field-row">
                            <div className="menu-field">
                                <label>Price (Rs.)</label>
                                <input
                                    type="number"
                                    placeholder="350"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="menu-field">
                                <label>Cost (Rs.)</label>
                                <input
                                    type="number"
                                    placeholder="180"
                                    value={form.cost}
                                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="menu-field">
                            <label>Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="menu-field">
                            <label>Image URL (optional)</label>
                            <input
                                type="text"
                                placeholder="https://..."
                                value={form.image}
                                onChange={(e) => setForm({ ...form, image: e.target.value })}
                            />
                        </div>
                        <div className="menu-form-actions">
                            <button type="submit" className="btn-modern btn-primary-modern">
                                <FaSave /> {editingItem ? 'Update' : 'Add Item'}
                            </button>
                            {editingItem && (
                                <button type="button" className="btn-modern btn-outline-modern" onClick={resetForm}>
                                    <FaTimes /> Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="menu-list-section">
                    <div className="menu-categories-card surface-card">
                        <h3>Categories</h3>
                        <div className="category-add-row">
                            <input
                                type="text"
                                placeholder="New category..."
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                            <button className="btn-modern btn-primary-modern" onClick={addCategory}>
                                <FaPlus />
                            </button>
                        </div>
                        <div className="category-list">
                            {categories.map(cat => (
                                <div key={cat.id} className="category-list-item">
                                    <span>{cat.icon} {cat.name}</span>
                                    <button className="category-delete" onClick={() => deleteCategory(cat.id)}>
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="menu-items-card surface-card">
                        <h3>Menu Items ({items.length})</h3>
                        <div className="menu-items-list">
                            {items.map(item => (
                                <div key={item.id} className="menu-item-row">
                                    <div className="menu-item-row-img">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="menu-item-row-info">
                                        <strong>{item.name}</strong>
                                        <span>{categories.find(c => c.id === item.category)?.name || item.category}</span>
                                    </div>
                                    <div className="menu-item-row-price">
                                        <span className="price">{formatPKR(item.price)}</span>
                                        <span className="cost">Cost: {formatPKR(item.cost)}</span>
                                    </div>
                                    <div className="menu-item-row-actions">
                                        <button className="action-btn edit" onClick={() => handleEdit(item)}>
                                            <FaEdit />
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <p className="no-items">No menu items yet. Add your first item above.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SalesMenu;
