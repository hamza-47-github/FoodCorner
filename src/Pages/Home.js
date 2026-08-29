// src/pages/Home.js
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { foodItems, restaurants, categories } from '../data';
import { formatPKR } from '../utils/format';
import FoodCarousel from './FoodCarousel';
import '../Home.css';
import './FeaturedItems.css';
import { FaSearch, FaStar } from 'react-icons/fa';

function Home() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredItems = useMemo(() => {
        let items = foodItems;
        if (activeCategory !== 'all') {
            items = items.filter(i => i.category === activeCategory);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            items = items.filter(i =>
                i.name.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q)
            );
        }
        return items;
    }, [search, activeCategory]);

    return (
        <div className="home-page">
            <FoodCarousel />

            <div className="search-bar-wrap">
                <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search burgers, pizza, pasta..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    {search && (
                        <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="category-filters">
                {categories.map(cat => (
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

            <h1 className="section-title">food corner menu</h1>
            <p className="section-subtitle">
                Welcome to Food Corner Menu! Explore a wide variety of delicious dishes
                freshly prepared every day. Browse the menu, view details, and order your favorites.
            </p>

            {filteredItems.length === 0 ? (
                <div className="empty-state">
                    <h2>No dishes found</h2>
                    <p>Try adjusting your search or category filter.</p>
                    <button className="btn-modern btn-primary-modern" onClick={() => { setSearch(''); setActiveCategory('all'); }}>
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="food-menu stagger">
                    {filteredItems.map(item => (
                        <div key={item.id} className="food-item surface-card">
                            <div className="food-image-wrap">
                                <img src={item.image} alt={item.name} className="food-image" />
                                <span className="price-tag">{formatPKR(item.price)}</span>
                                {item.rating && (
                                    <span className="rating-badge">
                                        <FaStar /> {item.rating}
                                    </span>
                                )}
                            </div>
                            <h2>{item.name}</h2>
                            <p>{item.description}</p>
                            <Link to={`/food/${item.id}`} className="btn-modern btn-outline-modern">
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            <h1 className="section-title restaurants-title">Restaurants</h1>
            <p className="section-subtitle">
                Hand-picked places loved by our community — with exclusive deals every week.
            </p>

            <div className="row g-4 stagger">
                {restaurants.map(restaurant => (
                    <div key={restaurant.id} className="col-md-4">
                        <div className="card restaurant-card surface-card h-100">
                            <img src={restaurant.image} alt={restaurant.name} className="card-img-top" />
                            <span className="deal-badge">{restaurant.deal}</span>
                            <div className="card-body">
                                <h5 className="card-title">{restaurant.name}</h5>
                                <p className="card-text">{restaurant.description}</p>
                                <Link to={`/restaurant/${restaurant.id}`} className="btn-primary-modern restaurant-cta">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
