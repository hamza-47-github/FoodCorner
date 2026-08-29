// src/pages/RestaurantDetail.js
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { restaurants, foodItems } from '../data';
import { formatPKR } from '../utils/format';
import { FaStar, FaClock, FaMapMarkerAlt, FaRupeeSign, FaUtensils, FaShoppingBag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import './RestaurantDetail.css';

function RestaurantDetail() {
    const { id } = useParams();
    const restaurant = restaurants.find(r => r.id === parseInt(id));
    const dispatch = useDispatch();
    const [activeCategory, setActiveCategory] = useState('all');

    const menuItems = useMemo(() => {
        let items = foodItems.filter(item => item.restaurantId === parseInt(id));
        if (activeCategory !== 'all') {
            items = items.filter(item => item.category === activeCategory);
        }
        return items;
    }, [id, activeCategory]);

    const categories = useMemo(() => {
        const cats = [...new Set(foodItems.filter(item => item.restaurantId === parseInt(id)).map(item => item.category))];
        return cats;
    }, [id]);

    const addToCart = (item) => {
        dispatch({ type: 'ADD_TO_CART', food: item });
        toast.success(`${item.name} added to cart`, {
            icon: <FaShoppingBag />,
            style: { background: '#10b981', color: '#fff' }
        });
    };

    if (!restaurant) {
        return (
            <div className="empty-state">
                <h2>Restaurant not found</h2>
                <p>The restaurant you're looking for doesn't exist.</p>
                <Link to="/" className="btn-modern btn-primary-modern">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="restaurant-detail-page">
            <div className="restaurant-hero surface-card">
                <img src={restaurant.image} alt={restaurant.name} className="restaurant-hero-img" />
                <div className="restaurant-hero-overlay" />
                <div className="restaurant-hero-content">
                    <span className="restaurant-deal-badge">{restaurant.deal}</span>
                    <h1>{restaurant.name}</h1>
                    <div className="restaurant-meta-row">
                        <span className="restaurant-rating"><FaStar /> {restaurant.rating}</span>
                        <span className="restaurant-delivery"><FaClock /> {restaurant.deliveryTime}</span>
                        <span className="restaurant-location"><FaMapMarkerAlt /> {restaurant.location}</span>
                        <span className="restaurant-price-range"><FaRupeeSign /> {restaurant.priceRange}</span>
                    </div>
                    <p className="restaurant-description">{restaurant.description}</p>
                    <span className="restaurant-cuisine"><FaUtensils /> {restaurant.cuisine}</span>
                </div>
            </div>

            <div className="restaurant-menu-section">
                <h2 className="section-title">Menu</h2>
                <div className="restaurant-categories">
                    <button
                        className={`category-chip${activeCategory === 'all' ? ' active' : ''}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`category-chip${activeCategory === cat ? ' active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {menuItems.length === 0 ? (
                    <div className="empty-state">
                        <h2>No items found in this category</h2>
                    </div>
                ) : (
                    <div className="restaurant-menu-grid stagger">
                        {menuItems.map(item => (
                            <div key={item.id} className="menu-item-card surface-card">
                                <div className="menu-item-img-wrap">
                                    <img src={item.image} alt={item.name} className="menu-item-img" />
                                    {item.rating && (
                                        <span className="menu-item-rating">
                                            <FaStar /> {item.rating}
                                        </span>
                                    )}
                                </div>
                                <div className="menu-item-info">
                                    <h3>{item.name}</h3>
                                    <p>{item.description}</p>
                                    <div className="menu-item-footer">
                                        <span className="menu-item-price">{formatPKR(item.price)}</span>
                                        <button
                                            className="btn-modern btn-primary-modern add-to-cart-btn"
                                            onClick={() => addToCart(item)}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RestaurantDetail;
