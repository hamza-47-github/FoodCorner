// src/pages/FoodDetail.js
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { foodItems } from '../data';
import { formatPKR } from '../utils/format';
import { toast } from 'react-toastify';
import { FaShoppingBag } from 'react-icons/fa';
import '../FoodDetail.css';

function FoodDetail() {
    const { id } = useParams();
    const food = foodItems.find(item => item.id === parseInt(id));
    const dispatch = useDispatch();

    const addToCart = () => {
        dispatch({ type: 'ADD_TO_CART', food });
        toast.success(`${food.name} added to cart`, {
            icon: <FaShoppingBag />,
            style: { background: '#10b981', color: '#fff' }
        });
    };

    if (!food) {
        return (
            <div className="empty-state">
                <h2>Food not found</h2>
                <Link to="/" className="btn-modern btn-primary-modern">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="food-detail-container">
            <div className="food-detail-content surface-card">
                <img src={food.image} alt={food.name} className="food-image" />
                <div className="food-info">
                    <span className="price-tag">{formatPKR(food.price)}</span>
                    <h1 className="food-name">{food.name}</h1>
                    <p className="food-description">{food.description}</p>
                    <div className="food-actions">
                        <button className="btn-modern btn-primary-modern" onClick={addToCart}>
                            Add to Cart
                        </button>
                        <Link to="/cart" className="btn-modern btn-outline-modern">Go to Cart</Link>
                        <Link to="/" className="btn-modern btn-outline-modern">Back to Menu</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FoodDetail;
