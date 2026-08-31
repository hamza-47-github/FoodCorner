// src/Pages/RestaurantReceipt.js
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPrint, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { formatPKR } from '../utils/format';
import RestaurantShell from '../restaurant/RestaurantShell';
import { paymentForBill } from '../restaurant/restaurantSelectors';

function formatDateTime(iso) {
    return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

function RestaurantReceipt() {
    const { billId } = useParams();
    const restaurant = useSelector(state => state.restaurant);
    const bill = restaurant.bills.find(b => b.id === billId);
    const payment = bill ? paymentForBill(restaurant, bill.id) : null;
    const table = bill ? restaurant.tables.find(t => t.id === bill.tableId) : null;

    return (
        <RestaurantShell title="Receipt" subtitle="Payment successful — receipt generated">
            <div style={{ textAlign: 'center', marginBottom: '1rem', display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-modern btn-primary-modern" onClick={() => window.print()}>
                    <FaPrint /> Print Receipt
                </button>
                <Link to="/restaurant/tables" className="btn-modern btn-outline-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }}>
                    <FaArrowLeft /> Back to Tables
                </Link>
                {bill && bill.status === 'paid' && (
                    <span className="user-chip"><FaCheckCircle style={{ color: '#10b981' }} /> PAID</span>
                )}
            </div>

            {!bill || !payment ? (
                <div className="empty-note">No receipt found for this bill.</div>
            ) : (
                <div className="receipt-paper" id="restaurant-receipt">
                    <div className="receipt-title">RESTAURANT</div>
                    <div className="receipt-sub">Food Corner</div>
                    <div className="receipt-rule" />
                    <div className="receipt-line"><span>Receipt #</span><strong>{restaurant.receipts.find(r => r.billId === bill.id)?.number || 'R-…'}</strong></div>
                    <div className="receipt-line"><span>Bill #</span><strong>{bill.number}</strong></div>
                    {table ? <div className="receipt-line"><span>Table</span><strong>{table.number}</strong></div> : null}
                    <div className="receipt-line"><span>Date</span><strong>{formatDateTime(payment.at)}</strong></div>
                    <div className="receipt-rule" />
                    {bill.items.map((item, idx) => (
                        <div key={idx} className="receipt-line">
                            <span>{item.name} <strong>{item.qty} x {item.price}</strong></span>
                            <span>{item.qty * item.price}</span>
                        </div>
                    ))}
                    <div className="receipt-rule" />
                    <div className="receipt-line"><span>Subtotal</span><span>{bill.subtotal}</span></div>
                    <div className="receipt-line"><span>Tax</span><span>{bill.tax}</span></div>
                    <div className="receipt-line"><span>Discount</span><span>{bill.discount}</span></div>
                    <div className="receipt-total"><span>TOTAL</span><span>{formatPKR(bill.total)}</span></div>
                    <div className="receipt-rule" />
                    <div className="receipt-line"><span>Payment</span><strong>{payment.method}</strong></div>
                    <div className="receipt-line"><span>Received</span><span>{payment.received}</span></div>
                    <div className="receipt-line"><span>Change</span><span>{payment.change}</span></div>
                    <div className="receipt-thanks">Thank You!</div>
                </div>
            )}
        </RestaurantShell>
    );
}

export default RestaurantReceipt;