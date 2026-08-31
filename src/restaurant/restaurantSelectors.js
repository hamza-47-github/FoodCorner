// src/restaurant/restaurantSelectors.js
import { TABLE_STATUS_LABELS, ORDER_STATUS_LABELS } from './restaurantData';

export const statusLabel = (key) => TABLE_STATUS_LABELS[key] || key;
export const orderStatusLabel = (key) => ORDER_STATUS_LABELS[key] || key;

export const sessionForTable = (state, tableId) =>
    state.sessions.find(s => s.tableId === tableId && !s.closedAt);

export const ordersForTable = (state, tableId) =>
    state.orders.filter(o => o.tableId === tableId);

export const activeSessionOrders = (state, sessionId) =>
    state.orders.filter(o => {
        const table = state.tables.find(t => t.id === o.tableId);
        return table && table.sessionId === sessionId;
    });

export const unpaidBillForTable = (state, tableId) =>
    state.bills.find(b => b.tableId === tableId && b.status === 'unpaid');

export const billById = (state, billId) =>
    state.bills.find(b => b.id === billId);

export const paymentForBill = (state, billId) =>
    state.payments.find(p => p.billId === billId);

export const receiptForBill = (state, billId) =>
    state.receipts.find(r => r.billId === billId);

export const sessionRunningTotal = (state, tableId) => {
    const session = sessionForTable(state, tableId);
    if (!session) return 0;
    return state.orders
        .filter(o => o.tableId === tableId && o.status !== 'paid')
        .reduce((sum, o) => sum + o.subtotal, 0);
};

export const tableNonPaidOrders = (state, tableId) =>
    ordersForTable(state, tableId).filter(o => o.status !== 'paid');

export const menuByCategory = (menuItems) =>
    menuItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});