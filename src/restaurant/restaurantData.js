// src/restaurant/restaurantData.js
// Hardcoded mock data for the Restaurant Management System.
// Replace with API calls later without changing components.

export const TABLE_STATUS_LABELS = {
    available: 'Available',
    occupied: 'Occupied',
    order_pending: 'Order Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    billing: 'Billing'
};

export const ORDER_STATUS_LABELS = {
    pending: 'Pending',
    processing: 'Processing',
    ready: 'Ready',
    served: 'Served',
    billing: 'Billing',
    paid: 'Paid'
};

export const TAX_RATE = 0.1;

export const users = [
    { id: 'u1', name: 'Hamza Ahmed', username: 'admin', password: 'admin123', role: 'Admin' },
    { id: 'u2', name: 'Ali Raza', username: 'waiter', password: 'waiter123', role: 'Waiter' },
    { id: 'u3', name: 'Bilal Khan', username: 'kitchen', password: 'kitchen123', role: 'Kitchen Staff' },
    { id: 'u4', name: 'Sara Malik', username: 'cashier', password: 'cashier123', role: 'Cashier' }
];

export const tables = Array.from({ length: 8 }, (_, i) => ({
    id: `t${i + 1}`,
    number: i + 1,
    status: 'available',
    sessionId: null
}));

export const CATEGORY_TONES = {
    Burgers: 'linear-gradient(135deg, #f59e0b, #f97316)',
    Pizza: 'linear-gradient(135deg, #ef4444, #f97316)',
    Drinks: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    Fries: 'linear-gradient(135deg, #facc15, #f59e0b)',
    BBQ: 'linear-gradient(135deg, #ea580c, #dc2626)',
    Extras: 'linear-gradient(135deg, #a78bfa, #6366f1)'
};

export const menuItems = [
    // Burgers
    { id: 'm1', name: 'Chicken Burger', category: 'Burgers', price: 650, image: '🍔' },
    { id: 'm2', name: 'Zinger Burger', category: 'Burgers', price: 750, image: '🍔' },
    { id: 'm3', name: 'Beef Burger', category: 'Burgers', price: 700, image: '🍔' },
    // Pizza
    { id: 'm4', name: 'Chicken Pizza', category: 'Pizza', price: 1200, image: '🍕' },
    { id: 'm5', name: 'Cheese Pizza', category: 'Pizza', price: 1100, image: '🍕' },
    { id: 'm6', name: 'Veggie Pizza', category: 'Pizza', price: 1000, image: '🍕' },
    { id: 'm7', name: 'BBQ Chicken Pizza', category: 'Pizza', price: 1350, image: '🍕' },
    // Drinks
    { id: 'm8', name: 'Coke', category: 'Drinks', price: 150, image: '🥤' },
    { id: 'm9', name: 'Sprite', category: 'Drinks', price: 150, image: '🥤' },
    { id: 'm10', name: 'Water', category: 'Drinks', price: 100, image: '💧' },
    { id: 'm11', name: 'Fresh Juice', category: 'Drinks', price: 350, image: '🧃' },
    // Fries
    { id: 'm12', name: 'Regular Fries', category: 'Fries', price: 350, image: '🍟' },
    { id: 'm13', name: 'Loaded Fries', category: 'Fries', price: 550, image: '🍟' },
    // BBQ
    { id: 'm14', name: 'Chicken Tikka', category: 'BBQ', price: 950, image: '🍗' },
    { id: 'm15', name: 'Seekh Kabab', category: 'BBQ', price: 800, image: '🍢' },
    // Extras
    { id: 'm16', name: 'Garlic Bread', category: 'Extras', price: 400, image: '🥖' },
    { id: 'm17', name: 'Brownie', category: 'Extras', price: 450, image: '🍫' },
    { id: 'm18', name: 'Ice Cream', category: 'Extras', price: 300, image: '🍦' }
];

// --- Sample live data (used on first load so the demo has content) ---

export const sampleOrders = [
    {
        id: 'o-1001',
        number: 1001,
        tableId: 't3',
        tableNumber: 3,
        waiter: 'Ali Raza',
        items: [
            { menuId: 'm1', name: 'Chicken Burger', price: 650, qty: 2, notes: '' },
            { menuId: 'm8', name: 'Coke', price: 150, qty: 2, notes: 'Extra ice' }
        ],
        subtotal: 1600,
        status: 'pending',
        createdTime: '2026-08-31T12:10:00.000Z'
    },
    {
        id: 'o-1002',
        number: 1002,
        tableId: 't6',
        tableNumber: 6,
        waiter: 'Ali Raza',
        items: [
            { menuId: 'm12', name: 'Regular Fries', price: 350, qty: 1, notes: 'Well done' },
            { menuId: 'm4', name: 'Chicken Pizza', price: 1200, qty: 1, notes: '' }
        ],
        subtotal: 1550,
        status: 'processing',
        createdTime: '2026-08-31T12:20:00.000Z'
    },
    {
        id: 'o-1003',
        number: 1003,
        tableId: 't7',
        tableNumber: 7,
        waiter: 'Ali Raza',
        items: [
            { menuId: 'm2', name: 'Zinger Burger', price: 750, qty: 1, notes: '' },
            { menuId: 'm10', name: 'Water', price: 100, qty: 1, notes: '' }
        ],
        subtotal: 850,
        status: 'ready',
        createdTime: '2026-08-31T12:30:00.000Z'
    },
    {
        id: 'o-1004',
        number: 1004,
        tableId: 't8',
        tableNumber: 8,
        waiter: 'Sara Malik',
        items: [
            { menuId: 'm4', name: 'Chicken Pizza', price: 1200, qty: 1, notes: '' },
            { menuId: 'm8', name: 'Coke', price: 150, qty: 1, notes: '' }
        ],
        subtotal: 1350,
        status: 'served',
        createdTime: '2026-08-31T12:40:00.000Z'
    }
];

export const sampleSessions = [
    { id: 's-t3', tableId: 't3', openedAt: '2026-08-31T12:10:00.000Z', closedAt: null, billId: null },
    { id: 's-t6', tableId: 't6', openedAt: '2026-08-31T12:20:00.000Z', closedAt: null, billId: null },
    { id: 's-t7', tableId: 't7', openedAt: '2026-08-31T12:30:00.000Z', closedAt: null, billId: null },
    { id: 's-t8', tableId: 't8', openedAt: '2026-08-31T12:40:00.000Z', closedAt: null, billId: 'b-1001' }
];

export const sampleBills = [
    {
        id: 'b-1001',
        number: 'B-1001',
        tableId: 't8',
        sessionId: 's-t8',
        items: [
            { menuId: 'm4', name: 'Chicken Pizza', price: 1200, qty: 1 },
            { menuId: 'm8', name: 'Coke', price: 150, qty: 1 }
        ],
        subtotal: 1350,
        tax: 135,
        discount: 0,
        total: 1485,
        status: 'unpaid',
        createdAt: '2026-08-31T12:45:00.000Z',
        paidAt: null
    }
];

export const sampleTables = tables.map(t => {
    const statusMap = { t3: 'order_pending', t6: 'preparing', t7: 'ready', t8: 'billing' };
    const sessionMap = { t3: 's-t3', t6: 's-t6', t7: 's-t7', t8: 's-t8' };
    return {
        ...t,
        status: statusMap[t.id] || 'available',
        sessionId: sessionMap[t.id] || null
    };
});

export const initialRestaurantState = {
    currentUser: null,
    users,
    menuItems,
    tables: sampleTables,
    sessions: sampleSessions,
    orders: sampleOrders,
    bills: sampleBills,
    payments: [],
    receipts: [],
    nextOrderNumber: 1005,
    nextBillNumber: 1002,
    nextReceiptNumber: 1001
};