// src/Pages/RestaurantBilling.js
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaMoneyBillWave, FaCreditCard, FaCheckCircle, FaReceipt } from 'react-icons/fa';
import { formatPKR } from '../utils/format';
import RestaurantShell from '../restaurant/RestaurantShell';
import { startBilling, payBill } from '../restaurant/restaurantActions';
import { unpaidBillForTable } from '../restaurant/restaurantSelectors';

function BillTable({ bill }) {
    return (
        <div className="receipt-paper" style={{ margin: 0, width: '100%', maxWidth: 'none' }}>
            <div className="receipt-title">RESTAURANT</div>
            <div className="receipt-sub">Table: {bill.tableId.replace('t', '')}</div>
            <div className="receipt-sub">Bill #: {bill.number}</div>
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
            <div className="receipt-total"><span>TOTAL</span><span>{bill.total}</span></div>
        </div>
    );
}

function RestaurantBilling() {
    const { tableId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const restaurant = useSelector(state => state.restaurant);

    const table = restaurant.tables.find(t => t.id === tableId);
    const bill = unpaidBillForTable(restaurant, tableId) || null;
    const paidBill = restaurant.bills.find(b => b.tableId === tableId && b.status === 'paid') || null;

    const [method, setMethod] = useState('Cash');
    const [received, setReceived] = useState('');

    if (!table) {
        return (
            <RestaurantShell title="Billing">
                <div className="empty-note">Table not found.</div>
            </RestaurantShell>
        );
    }

    const servedCount = restaurant.orders.filter(o => o.tableId === tableId && o.status === 'served').length;

    const handleGenerate = () => {
        dispatch(startBilling(tableId));
    };

    const receivedNum = parseInt(received || '0', 10);
    const change = bill ? receivedNum - bill.total : 0;
    const cashReady = bill && method === 'Cash' && receivedNum >= bill.total;
    const cardReady = bill && method === 'Card';

    const handlePay = () => {
        if (!bill) return;
        if (method === 'Cash' && receivedNum < bill.total) return;
        dispatch(payBill({
            billId: bill.id,
            method,
            received: method === 'Cash' ? receivedNum : bill.total
        }));
        navigate(`/restaurant/receipt/${bill.id}`);
    };

    const sessionOrders = restaurant.orders.filter(o => o.tableId === tableId);

    return (
        <RestaurantShell title={`Billing — Table ${table.number}`} subtitle="Combine all orders of this table session and complete payment">
            <div className="bill-layout">
                <div>
                    {sessionOrders.length > 0 && (
                        <div className="bill-summary" style={{ marginBottom: '1rem' }}>
                            <strong>Session orders:</strong>
                            {sessionOrders.map(o => (
                                <div key={o.id} style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
                                    #{o.number} · {o.status} · {o.items.map(i => `${i.name} x${i.qty}`).join(', ')}
                                </div>
                            ))}
                        </div>
                    )}

                    {paidBill && (
                        <div className="empty-note">
                            Bill {paidBill.number} is already paid.
                            <div style={{ marginTop: '0.75rem' }}>
                                <Link to={`/restaurant/receipt/${paidBill.id}`} className="btn-modern btn-outline-modern" style={{ textDecoration: 'none', lineHeight: '1.4' }}>
                                    View Receipt
                                </Link>
                            </div>
                        </div>
                    )}

                    {!paidBill && !bill && servedCount === 0 && (
                        <div className="empty-note">
                            There are no served orders yet for this table. Kitchen must mark orders Ready and the waiter must serve them before billing.
                        </div>
                    )}

                    {!paidBill && !bill && servedCount > 0 && (
                        <button className="btn-modern btn-primary-modern" onClick={handleGenerate}>
                            <FaReceipt /> Generate Bill
                        </button>
                    )}

                    {!paidBill && bill && <BillTable bill={bill} />}
                </div>

                <div>
                    {(bill && !paidBill) && (
                        <div className="bill-summary">
                            <h3 style={{ margin: '0 0 1rem' }}>Payment</h3>
                            <>
                                <div className="receipt-total" style={{ marginBottom: '1rem' }}>
                                    <span>Total</span><span>{formatPKR(bill.total)}</span>
                                </div>

                                <div className="payment-field">
                                    <label>Payment Method</label>
                                    <div className="payment-methods">
                                        <button type="button" className={`payment-method${method === 'Cash' ? ' active' : ''}`} onClick={() => setMethod('Cash')}>
                                            <FaMoneyBillWave /> Cash
                                        </button>
                                        <button type="button" className={`payment-method${method === 'Card' ? ' active' : ''}`} onClick={() => setMethod('Card')}>
                                            <FaCreditCard /> Card
                                        </button>
                                    </div>
                                </div>

                                {method === 'Cash' && (
                                    <div className="payment-field">
                                        <label htmlFor="received">Amount Received</label>
                                        <input
                                            id="received"
                                            type="number"
                                            min="0"
                                            placeholder="e.g. 3500"
                                            value={received}
                                            onChange={(e) => setReceived(e.target.value)}
                                        />
                                        <div className="change-row">
                                            <span>Change</span>
                                            <span>{receivedNum >= bill.total ? formatPKR(change) : formatPKR(0)}</span>
                                        </div>
                                    </div>
                                )}

                                <button className="btn-modern btn-primary-modern" style={{ width: '100%' }}
                                    disabled={!(cashReady || cardReady)}
                                    onClick={handlePay}>
                                    <FaCheckCircle /> Complete Payment
                                </button>
                            </>
                        </div>
                    )}
                </div>
            </div>
        </RestaurantShell>
    );
}

export default RestaurantBilling;