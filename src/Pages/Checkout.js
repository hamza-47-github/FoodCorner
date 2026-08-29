// src/pages/Checkout.js
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FaUtensils, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaUser, FaInfoCircle, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatPKR } from '../utils/format';
import './Checkout.css';

const Checkout = () => {
    const cartItems = useSelector((state) => state.cart.items || []);
    const promo = useSelector((state) => state.promo || {});
    const delivery = useSelector((state) => state.delivery || {});
    const dispatch = useDispatch();
    const receiptRef = useRef(null);

    const [order, setOrder] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [form, setForm] = useState({
        name: delivery.name || '',
        phone: delivery.phone || '',
        address: delivery.address || '',
        notes: delivery.notes || '',
        paymentMethod: delivery.paymentMethod || 'Cash on Delivery'
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
    const discount = promo && promo.code ? (promo.type === 'percent' ? subtotal * (promo.value / 100) : Math.min(promo.value, subtotal)) : 0;
    const deliveryFee = subtotal > 3000 ? 0 : 150;
    const total = Math.max(0, subtotal - discount + deliveryFee);

    const updateForm = (field, value) => {
        const newForm = { ...form, [field]: value };
        setForm(newForm);
        dispatch({ type: 'SET_DELIVERY', payload: { [field]: value } });
    };

    const placeOrder = () => {
        if (!form.name.trim()) {
            toast.warning('Please enter your name');
            return;
        }
        if (!form.phone.trim() || form.phone.trim().length < 7) {
            toast.warning('Please enter a valid phone number');
            return;
        }
        if (!form.address.trim()) {
            toast.warning('Please enter your delivery address');
            return;
        }

        const invoiceNo = `HF-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
        const newOrder = {
            invoiceNo,
            date: new Date(),
            items: cartItems,
            subtotal,
            discount,
            delivery: deliveryFee,
            total,
            payment: form.paymentMethod,
            status: 'Confirmed',
            customer: { ...form },
            promoCode: promo.code || null
        };
        setOrder(newOrder);
        dispatch({
            type: 'PLACE_ORDER',
            payload: newOrder
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success('Order placed successfully!');
    };

    const downloadInvoice = async () => {
        if (!receiptRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = pageWidth - 48;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 24, 24, imgWidth, Math.min(imgHeight, pdf.internal.pageSize.getHeight() - 48));
            pdf.save(`FoodCorner-Invoice-${order.invoiceNo}.pdf`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to download invoice');
        } finally {
            setDownloading(false);
        }
    };

    const shareViaWhatsApp = () => {
        if (!order) return;
        const lines = [
            `*Food Corner Invoice*`,
            `Invoice No: ${order.invoiceNo}`,
            `Date: ${order.date.toLocaleDateString()}`,
            `Time: ${order.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            ``,
            `*Items:*`
        ];
        order.items.forEach(item => {
            lines.push(`${item.name} x${item.qty || 1} - ${formatPKR(item.price * (item.qty || 1))}`);
        });
        lines.push(``);
        lines.push(`Subtotal: ${formatPKR(order.subtotal)}`);
        if (order.discount > 0) lines.push(`Discount: -${formatPKR(order.discount)}`);
        lines.push(`Delivery: ${order.delivery === 0 ? 'Free' : formatPKR(order.delivery)}`);
        lines.push(`*Total: ${formatPKR(order.total)}*`);
        lines.push(``);
        lines.push(`Payment: ${order.payment}`);
        lines.push(`Customer: ${order.customer.name}`);
        lines.push(`Address: ${order.customer.address}`);
        lines.push(``);
        lines.push(`Thank you for ordering with Food Corner!`);

        const message = encodeURIComponent(lines.join('\n'));
        const url = `https://wa.me/?text=${message}`;
        window.open(url, '_blank');
    };

    /* ---------- Success + receipt view ---------- */
    if (order) {
        return (
            <div className="checkout-page">
                <div className="order-success-head">
                    <div className="success-icon">✓</div>
                    <h1>Order Placed Successfully!</h1>
                    <p>Your food is being prepared. Keep this invoice for your records.</p>
                </div>

                <div className="receipt-wrap" ref={receiptRef}>
                    <div className="receipt-header">
                        <div className="receipt-brand">
                            <span className="receipt-logo">
                                <FaUtensils />
                            </span>
                            <div>
                                <h2>Food Corner</h2>
                                <p>Fresh meals, every day</p>
                            </div>
                        </div>
                        <div className="receipt-tick" title="Payment confirmed">
                            <span>✓</span>
                            Paid
                        </div>
                    </div>

                    <div className="receipt-meta">
                        <div>
                            <span>Invoice No.</span>
                            <strong>{order.invoiceNo}</strong>
                        </div>
                        <div>
                            <span>Date</span>
                            <strong>{order.date.toLocaleDateString()}</strong>
                        </div>
                        <div>
                            <span>Time</span>
                            <strong>{order.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                        </div>
                        <div>
                            <span>Customer</span>
                            <strong>{order.customer.name}</strong>
                        </div>
                        <div>
                            <span>Phone</span>
                            <strong>{order.customer.phone}</strong>
                        </div>
                        <div>
                            <span>Address</span>
                            <strong>{order.customer.address}</strong>
                        </div>
                        <div>
                            <span>Payment</span>
                            <strong>{order.payment}</strong>
                        </div>
                    </div>

                    <table className="receipt-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th className="col-qty">Qty</th>
                                <th className="col-price">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, i) => (
                                <tr key={`${item.id}-${i}`}>
                                    <td>{item.name}</td>
                                    <td className="col-qty">{item.qty || 1}</td>
                                    <td className="col-price">
                                        {formatPKR(item.price * (item.qty || 1))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="receipt-totals">
                        <div><span>Subtotal</span><span>{formatPKR(order.subtotal)}</span></div>
                        {order.discount > 0 && <div><span>Discount</span><span className="free">-{formatPKR(order.discount)}</span></div>}
                        <div><span>Delivery</span><span className="free">{order.delivery === 0 ? 'Free' : formatPKR(order.delivery)}</span></div>
                        <div className="grand"><span>Total</span><span>{formatPKR(order.total)}</span></div>
                    </div>

                    <div className="receipt-footer">
                        <div className="receipt-barcode" aria-hidden="true" />
                        <p className="barcode-no">{order.invoiceNo}</p>
                        <p>Payment Method: <strong>{order.payment}</strong></p>
                        <p>Thank you for ordering with Food Corner! We hope you enjoy your meal.</p>
                    </div>
                </div>

                <div className="receipt-actions no-print">
                    <button className="btn-modern btn-primary-modern btn-whatsapp" onClick={shareViaWhatsApp}>
                        <FaWhatsapp /> Send via WhatsApp
                    </button>
                    <button
                        className="btn-modern btn-primary-modern"
                        onClick={downloadInvoice}
                        disabled={downloading}
                    >
                        {downloading ? 'Preparing…' : 'Download Invoice'}
                    </button>
                    <button className="btn-modern btn-outline-modern" onClick={() => window.print()}>
                        Print Receipt
                    </button>
                    <Link to="/" className="btn-modern btn-outline-modern">Back to Home</Link>
                </div>
            </div>
        );
    }

    /* ---------- Checkout form view ---------- */
    return (
        <div className="checkout-page">
            <h1 className="section-title">Checkout</h1>
            <p className="section-subtitle">
                Almost there — confirm your order and enjoy your meal.
            </p>

            {cartItems.length === 0 ? (
                <div className="empty-state">
                    <h2>Nothing to check out</h2>
                    <p>Your cart is empty. Add some items first.</p>
                    <Link to="/" className="btn-modern btn-primary-modern">Browse Menu</Link>
                </div>
            ) : (
                <div className="checkout-layout">
                    <div className="checkout-form surface-card">
                        <h2>Delivery Details</h2>
                        <div className="form-grid">
                            <div className="form-field">
                                <label htmlFor="cust-name"><FaUser /> Full Name</label>
                                <input
                                    id="cust-name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={(e) => updateForm('name', e.target.value)}
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="cust-phone"><FaPhone /> Phone Number</label>
                                <input
                                    id="cust-phone"
                                    type="tel"
                                    placeholder="+1 234 567 8900"
                                    value={form.phone}
                                    onChange={(e) => updateForm('phone', e.target.value)}
                                />
                            </div>
                            <div className="form-field full-width">
                                <label htmlFor="cust-address"><FaMapMarkerAlt /> Delivery Address</label>
                                <input
                                    id="cust-address"
                                    type="text"
                                    placeholder="123 Main St, Apt 4B"
                                    value={form.address}
                                    onChange={(e) => updateForm('address', e.target.value)}
                                />
                            </div>
                            <div className="form-field full-width">
                                <label htmlFor="cust-notes"><FaInfoCircle /> Order Notes (optional)</label>
                                <input
                                    id="cust-notes"
                                    type="text"
                                    placeholder="Extra napkins, no onions..."
                                    value={form.notes}
                                    onChange={(e) => updateForm('notes', e.target.value)}
                                />
                            </div>
                            <div className="form-field full-width">
                                <label>Payment Method</label>
                                <div className="payment-options">
                                    {['Cash on Delivery', 'Credit Card', 'Debit Card'].map(method => (
                                        <button
                                            key={method}
                                            type="button"
                                            className={`payment-chip${form.paymentMethod === method ? ' active' : ''}`}
                                            onClick={() => updateForm('paymentMethod', method)}
                                        >
                                            {method === 'Cash on Delivery' && <FaMoneyBillWave />}
                                            {method === 'Credit Card' && <FaCreditCard />}
                                            {method === 'Debit Card' && <FaCreditCard />}
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="checkout-summary surface-card">
                        <h2>Payment Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{formatPKR(subtotal)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="summary-row discount-row">
                                <span>Discount</span>
                                <span className="discount-value">-{formatPKR(discount)}</span>
                            </div>
                        )}
                        <div className="summary-row">
                            <span>Delivery</span>
                            <span className={deliveryFee === 0 ? 'free-label' : ''}>
                                {deliveryFee === 0 ? 'Free' : formatPKR(deliveryFee)}
                            </span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{formatPKR(total)}</span>
                        </div>
                        <button className="btn-modern btn-primary-modern summary-cta" onClick={placeOrder}>
                            Place Order
                        </button>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default Checkout;
