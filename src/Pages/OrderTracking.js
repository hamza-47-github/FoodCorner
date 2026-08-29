// src/pages/OrderTracking.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaMotorcycle, FaHome, FaBox, FaChevronRight } from 'react-icons/fa';
import { formatPKR } from '../utils/format';
import './OrderTracking.css';

const STATUS_FLOW = [
    { key: 'Confirmed', label: 'Order Confirmed', icon: FaCheckCircle, desc: 'Your order has been received and confirmed.' },
    { key: 'Preparing', label: 'Preparing', icon: FaBox, desc: 'Our chefs are preparing your delicious meal.' },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: FaMotorcycle, desc: 'Your order is on its way to you.' },
    { key: 'Delivered', label: 'Delivered', icon: FaHome, desc: 'Enjoy your meal! Bon appétit.' },
];

function OrderTracking() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        try {
            const saved = JSON.parse(window.localStorage.getItem('hamzafood-orders') || '[]');
            const found = saved.find(o => o.orderId === orderId);
            setOrder(found || null);
        } catch (e) {
            setOrder(null);
        }
    }, [orderId]);

    if (!order) {
        return (
            <div className="tracking-page">
                <div className="empty-state">
                    <h2>Order not found</h2>
                    <p>We couldn't find this order. It may have been removed or the link is incorrect.</p>
                    <Link to="/history" className="btn-modern btn-primary-modern">View Order History</Link>
                </div>
            </div>
        );
    }

    const currentIndex = STATUS_FLOW.findIndex(s => s.key === order.status);
    const progressPercent = currentIndex >= 0 ? ((currentIndex + 1) / STATUS_FLOW.length) * 100 : 0;

    return (
        <div className="tracking-page">
            <div className="tracking-header surface-card">
                <div className="tracking-id">
                    <FaBox />
                    <div>
                        <h2>{order.invoiceNo}</h2>
                        <p>Placed on {new Date(order.placedAt).toLocaleDateString()} at {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                <div className="tracking-status-pill">
                    {order.status}
                </div>
            </div>

            <div className="tracking-progress-wrap">
                <div className="tracking-progress-bar">
                    <div className="tracking-progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="tracking-steps">
                    {STATUS_FLOW.map((step, i) => {
                        const isCompleted = i <= currentIndex;
                        const isCurrent = i === currentIndex;
                        const Icon = step.icon;
                        return (
                            <div key={step.key} className={`tracking-step${isCompleted ? ' completed' : ''}${isCurrent ? ' current' : ''}`}>
                                <div className="step-icon-wrap">
                                    <Icon />
                                </div>
                                <div className="step-info">
                                    <strong>{step.label}</strong>
                                    <p>{step.desc}</p>
                                </div>
                                {isCurrent && <span className="step-now">Current</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="tracking-details surface-card">
                <h3>Order Summary</h3>
                <div className="tracking-items">
                    {order.items.map((item, i) => (
                        <div key={i} className="tracking-item-row">
                            <span>{item.name} x{item.qty || 1}</span>
                            <span>{formatPKR(item.price * (item.qty || 1))}</span>
                        </div>
                    ))}
                </div>
                <div className="tracking-totals">
                    <div><span>Subtotal</span><span>{formatPKR(order.subtotal)}</span></div>
                    {order.discount > 0 && <div><span>Discount</span><span>-{formatPKR(order.discount)}</span></div>}
                    <div><span>Delivery</span><span>{order.delivery === 0 ? 'Free' : formatPKR(order.delivery)}</span></div>
                    <div className="grand"><span>Total</span><span>{formatPKR(order.total)}</span></div>
                </div>
                <div className="tracking-customer">
                    <div><strong>Customer:</strong> {order.customer.name}</div>
                    <div><strong>Phone:</strong> {order.customer.phone}</div>
                    <div><strong>Address:</strong> {order.customer.address}</div>
                    <div><strong>Payment:</strong> {order.payment}</div>
                </div>
            </div>

            <div className="tracking-actions">
                <Link to="/history" className="btn-modern btn-outline-modern">
                    <FaChevronRight /> All Orders
                </Link>
                <Link to="/" className="btn-modern btn-primary-modern">
                    Order Again
                </Link>
            </div>
        </div>
    );
}

export default OrderTracking;
