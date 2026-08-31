import { initialRestaurantState, TAX_RATE } from './restaurantData';

// Allowed status transitions only.
const ALLOWED_TRANSITIONS = {
    pending: ['processing'],
    processing: ['ready'],
    ready: ['served'],
    served: ['paid'],
    billing: ['paid'],
    paid: []
};

const canTransition = (from, to) => (ALLOWED_TRANSITIONS[from] || []).includes(to);

export function isOrderStatus(s) {
    return ['pending', 'processing', 'ready', 'served', 'paid'].includes(s);
}

// Derive a table's display status from its session/orders/bill.
export function deriveTableStatus(state, tableId) {
    const session = state.sessions.find(s => s.tableId === tableId && !s.closedAt);
    if (!session) return 'available';

    const bill = state.bills.find(b => b.sessionId === session.id && b.status === 'unpaid');
    if (bill) return 'billing';

    const orders = state.orders.filter(o => o.tableId === tableId && !['paid'].includes(o.status));
    if (orders.some(o => o.status === 'pending')) return 'order_pending';
    if (orders.some(o => o.status === 'processing')) return 'preparing';
    if (orders.some(o => o.status === 'ready')) return 'ready';
    if (orders.some(o => o.status === 'served')) return 'served';
    return 'occupied';
}

const syncTableStatuses = (state) => ({
    ...state,
    tables: state.tables.map(t => ({ ...t, status: deriveTableStatus(state, t.id) }))
});

function reducer(state = initialRestaurantState, action) {
    switch (action.type) {
        case 'RS_SET_USER': {
            const user = state.users.find(u => u.id === action.userId) || null;
            return { ...state, currentUser: user };
        }
        case 'RS_LOGOUT':
            return { ...state, currentUser: null };

        // Waiter places an order: appends to the table's active session, or starts one.
        case 'RS_PLACE_ORDER': {
            const { tableId, items, waiter } = action.payload;
            const table = state.tables.find(t => t.id === tableId);
            if (!table) return state;

            const existingUnpaid = state.bills.find(b =>
                state.sessions.find(s => s.tableId === tableId && s.id === b.sessionId) && b.status === 'unpaid'
            );
            if (existingUnpaid) return state; // cannot order on a table waiting for payment

            let sessions = [...state.sessions];
            let session = sessions.find(s => s.tableId === tableId && !s.closedAt);
            if (!session) {
                session = { id: `s-${Date.now()}-${tableId}`, tableId, openedAt: new Date().toISOString(), closedAt: null, billId: null };
                sessions = [...sessions, session];
            }

            const number = state.nextOrderNumber;

            const order = {
                id: `o-${number}`,
                number,
                tableId,
                tableNumber: table.number,
                waiter,
                items,
                subtotal: items.reduce((sum, i) => sum + i.price * i.qty, 0),
                status: 'pending',
                createdTime: new Date().toISOString()
            };

            return syncTableStatuses({
                ...state,
                sessions,
                orders: [...state.orders, order],
                tables: state.tables.map(t => t.id === tableId ? { ...t, sessionId: session.id } : t),
                nextOrderNumber: number + 1
            });
        }

        case 'RS_KITCHEN_START': {
            const order = state.orders.find(o => o.id === action.orderId);
            if (!order || order.status !== 'pending') return state;
            return syncTableStatuses({
                ...state,
                orders: state.orders.map(o => o.id === order.id ? { ...o, status: 'processing' } : o)
            });
        }

        case 'RS_KITCHEN_READY': {
            const order = state.orders.find(o => o.id === action.orderId);
            if (!order || !canTransition(order.status, 'ready')) return state;
            return syncTableStatuses({
                ...state,
                orders: state.orders.map(o => o.id === order.id ? { ...o, status: 'ready' } : o)
            });
        }

        case 'RS_SERVE_ORDER': {
            const order = state.orders.find(o => o.id === action.orderId);
            if (!order || !canTransition(order.status, 'served')) return state;
            return syncTableStatuses({
                ...state,
                orders: state.orders.map(o => o.id === order.id ? { ...o, status: 'served' } : o)
            });
        }

        // Combine all served orders of the active session into one bill.
        case 'RS_START_BILLING': {
            const { tableId } = action.payload;
            const table = state.tables.find(t => t.id === tableId);
            if (!table) return state;

            const session = state.sessions.find(s => s.tableId === tableId && !s.closedAt);
            if (!session) return state;

            const existing = state.bills.find(b => b.sessionId === session.id && b.status === 'unpaid');
            if (existing) return state;

            const served = state.orders.filter(o => o.tableId === tableId && o.status === 'served');
            if (served.length === 0) return state;

            const combined = {};
            served.forEach(o => {
                o.items.forEach(i => {
                    const key = i.menuId;
                    if (!combined[key]) {
                        combined[key] = { menuId: i.menuId, name: i.name, price: i.price, qty: 0 };
                    }
                    combined[key].qty += i.qty;
                });
            });
            const items = Object.values(combined).map(i => ({ menuId: i.menuId, name: i.name, price: i.price, qty: i.qty }));
            const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
            const tax = Math.round(subtotal * TAX_RATE);
            const discount = 0;
            const billNumber = state.nextBillNumber;

            const bill = {
                id: `b-${billNumber}`,
                number: `B-${billNumber}`,
                tableId,
                sessionId: session.id,
                items,
                subtotal,
                tax,
                discount,
                total: subtotal + tax - discount,
                status: 'unpaid',
                createdAt: new Date().toISOString(),
                paidAt: null
            };

            return syncTableStatuses({
                ...state,
                bills: [...state.bills, bill],
                sessions: state.sessions.map(s => s.id === session.id ? { ...s, billId: bill.id } : s),
                orders: state.orders.map(o =>
                    o.tableId === tableId && o.status === 'served' ? { ...o, status: 'billing' } : o
                ),
                nextBillNumber: billNumber + 1
            });
        }

        // Cash/Card payment: bill -> paid, receipt generated, session closed, table freed.
        case 'RS_PAY_BILL': {
            const { billId, method, received } = action.payload;
            const bill = state.bills.find(b => b.id === billId);
            if (!bill || bill.status === 'paid') return state;
            if (!['Cash', 'Card'].includes(method)) return state;
            if (method === 'Cash' && received < bill.total) return state;

            const session = state.sessions.find(s => s.id === bill.sessionId);
            const receiptNumber = state.nextReceiptNumber;
            const payment = {
                id: `pay-${receiptNumber}`,
                billId,
                method,
                received,
                change: method === 'Cash' ? received - bill.total : 0,
                at: new Date().toISOString()
            };
            const receipt = {
                id: `r-${receiptNumber}`,
                number: `R-${receiptNumber}`,
                billId,
                paymentId: payment.id,
                at: new Date().toISOString()
            };

            const paidOrders = state.orders.map(o =>
                o.tableId === bill.tableId ? { ...o, status: 'paid' } : o
            );

            return syncTableStatuses({
                ...state,
                bills: state.bills.map(b => b.id === bill.id ? { ...b, status: 'paid', paidAt: payment.at } : b),
                payments: [...state.payments, payment],
                receipts: [...state.receipts, receipt],
                sessions: state.sessions.map(s => s.id === session.id ? { ...s, closedAt: payment.at, billId: bill.id } : s),
                orders: paidOrders,
                tables: state.tables.map(t => t.id === bill.tableId ? { ...t, status: 'available', sessionId: null } : t),
                nextReceiptNumber: receiptNumber + 1
            });
        }

        case 'RS_RESET_DEMO':
            return { ...initialRestaurantState };

        // Admin: add a new menu item (appears everywhere: menu grid, billing, receipts).
        case 'RS_ADD_MENU_ITEM': {
            const { name, category, price, image } = action.payload || {};
            if (!name || !name.trim() || !category || !category.trim() || !price || price <= 0) return state;
            const id = `m${state.nextMenuId}`;
            const item = {
                id,
                name: name.trim(),
                category: category.trim(),
                price,
                image: (image && image.trim()) || '🍽️'
            };
            return {
                ...state,
                menuItems: [...state.menuItems, item],
                nextMenuId: state.nextMenuId + 1
            };
        }

        // Admin: remove a menu item (historical orders keep their own copies).
        case 'RS_REMOVE_MENU_ITEM': {
            return {
                ...state,
                menuItems: state.menuItems.filter(m => m.id !== action.itemId)
            };
        }

        // Admin: add a new table to the dining floor.
        case 'RS_ADD_TABLE': {
            const number = state.tables.reduce((max, t) => Math.max(max, t.number), 0) + 1;
            return {
                ...state,
                tables: [...state.tables, { id: `t${number}`, number, status: 'available', sessionId: null }]
            };
        }

        default:
            return state;
    }
}

export default reducer;