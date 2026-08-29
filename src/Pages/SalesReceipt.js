// src/pages/SalesReceipt.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';
import { formatPKR } from '../utils/format';
import './Sales.css';

const AUTH_KEY = 'sales_auth';
const SALES_ORDERS_KEY = 'sales_orders';

function SalesReceipt() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem(AUTH_KEY)) {
            navigate('/sales/login');
            return;
        }
        try {
            const saved = JSON.parse(window.localStorage.getItem(SALES_ORDERS_KEY) || '[]');
            const found = saved.find(o => o.id === orderId);
            setOrder(found || null);
        } catch (e) {
            setOrder(null);
        }
    }, [orderId]);

    const handlePrint = () => {
        window.print();
    };

    if (!order) {
        return (
            <div className="sales-page">
                <div className="empty-state">
                    <h2>Order not found</h2>
                    <p>We couldn't find this order.</p>
                    <Link to="/sales/dashboard" className="btn-modern btn-primary-modern">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="sales-page">
            <div className="sales-header">
                <div>
                    <h1>Order Receipt</h1>
                    <p className="section-subtitle" style={{ margin: 0 }}>{order.invoiceNo}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn-modern btn-outline-modern" onClick={handlePrint}>
                        <FaPrint /> Print Receipt
                    </button>
                    <Link to="/sales/dashboard" className="btn-modern btn-primary-modern">
                        <FaArrowLeft /> Dashboard
                    </Link>
                </div>
            </div>

            <div className="receipt-print-area">
                <div className="receipt-header-modern">
                    <h2>Food Corner Burger Shop</h2>
                    <p>Premium Quality | Fast Service</p>
                </div>

                <div className="receipt-body">
                    <div className="receipt-meta-grid">
                        <div className="receipt-meta-item">
                            <span className="receipt-meta-label">Invoice</span>
                            <span className="receipt-meta-value">{order.invoiceNo}</span>
                        </div>
                        <div className="receipt-meta-item">
                            <span className="receipt-meta-label">Date</span>
                            <span className="receipt-meta-value">{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <div className="receipt-meta-item">
                            <span className="receipt-meta-label">Time</span>
                            <span className="receipt-meta-value">{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="receipt-meta-item">
                            <span className="receipt-meta-label">Customer</span>
                            <span className="receipt-meta-value">{order.customer}</span>
                        </div>
                        <div className="receipt-meta-item">
                            <span className="receipt-meta-label">Order Type</span>
                            <span className="receipt-meta-value" style={{ textTransform: 'capitalize' }}>{order.orderType}</span>
                        </div>
                        {order.tableNumber !== '-' && (
                            <div className="receipt-meta-item">
                                <span className="receipt-meta-label">Table</span>
                                <span className="receipt-meta-value">{order.tableNumber}</span>
                            </div>
                        )}
                    </div>

                    <table className="receipt-items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style={{ textAlign: 'center' }}>Qty</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, i) => (
                                <tr key={i}>
                                    <td className="receipt-item-name">{item.name}</td>
                                    <td className="receipt-item-qty">{item.qty}</td>
                                    <td className="receipt-item-amount">{formatPKR(item.price * item.qty)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="receipt-totals-modern">
                        <div className="receipt-total-row">
                            <span>Subtotal</span>
                            <span>{formatPKR(order.subtotal)}</span>
                        </div>
                        <div className="receipt-total-row grand">
                            <span>Total</span>
                            <span>{formatPKR(order.total)}</span>
                        </div>
                    </div>
                </div>

                <div className="receipt-footer-modern">
                    <div className="receipt-qr-placeholder" />
                    <p>Thank you for your business!</p>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Visit us again soon</p>
                </div>
            </div>
        </div>
    );
}

export default SalesReceipt;
