// src/store.js
import { createStore } from 'redux';
import restaurantReducer from './restaurant/restaurantReducer';
import { initialRestaurantState } from './restaurant/restaurantData';

const PERSIST_KEY = 'foodcorner_state';

// Rehydrate the full app from localStorage so every refresh keeps the demo
// state intact — orders, bills, menus, tables, cart, delivery, promo.
const loadPersistedState = () => {
    try {
        const raw = window.localStorage.getItem(PERSIST_KEY);
        if (raw) {
            const p = JSON.parse(raw);
            if (p && p.restaurant && Array.isArray(p.restaurant.orders) && Array.isArray(p.restaurant.tables)) {
                return {
                    cart: { items: [], ...(p.cart || {}) },
                    promo: { code: null, discount: 0, type: null, value: 0, ...(p.promo || {}) },
                    delivery: { name: '', phone: '', address: '', notes: '', paymentMethod: 'Cash on Delivery', ...(p.delivery || {}) },
                    orderHistory: Array.isArray(p.orderHistory) ? p.orderHistory : [],
                    restaurant: p.restaurant
                };
            }
        }
    } catch (e) {
        // corrupted storage — fall back to defaults
    }
    return null;
};

const initialState = {
    cart: { items: [] },
    promo: { code: null, discount: 0, type: null, value: 0 },
    delivery: { name: '', phone: '', address: '', notes: '', paymentMethod: 'Cash on Delivery' },
    orderHistory: [],
    restaurant: initialRestaurantState
};

const preloadedState = loadPersistedState() || initialState;

function reducer(state = preloadedState, action) {
    if (action.type && action.type.startsWith('RS_')) {
        return {
            ...state,
            restaurant: restaurantReducer(state.restaurant, action)
        };
    }
    switch (action.type) {
        case 'ADD_TO_CART': {
            const food = action.food;
            const existing = state.cart.items.find(i => i.id === food.id);
            if (existing) {
                return {
                    ...state,
                    cart: {
                        ...state.cart,
                        items: state.cart.items.map(i =>
                            i.id === food.id ? { ...i, qty: (i.qty || 1) + 1 } : i
                        )
                    }
                };
            }
            return {
                ...state,
                cart: { ...state.cart, items: [...state.cart.items, { ...food, qty: 1 }] }
            };
        }
        case 'INCREMENT_QTY':
            return {
                ...state,
                cart: {
                    ...state.cart,
                    items: state.cart.items.map(i =>
                        i.id === action.id ? { ...i, qty: (i.qty || 1) + 1 } : i
                    )
                }
            };
        case 'DECREMENT_QTY':
            return {
                ...state,
                cart: {
                    ...state.cart,
                    items: state.cart.items.map(i => {
                        if (i.id !== action.id) return i;
                        const q = (i.qty || 1) - 1;
                        return q <= 0 ? i : { ...i, qty: q };
                    })
                }
            };
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cart: { ...state.cart, items: state.cart.items.filter(item => item.id !== action.id) }
            };
        case 'CLEAR_CART':
            return { ...state, cart: { ...state.cart, items: [] }, promo: { code: null, discount: 0, type: null, value: 0 } };
        case 'APPLY_PROMO':
            return {
                ...state,
                promo: {
                    code: action.payload.code,
                    discount: action.payload.discount,
                    type: action.payload.type,
                    value: action.payload.value
                }
            };
        case 'REMOVE_PROMO':
            return {
                ...state,
                promo: { code: null, discount: 0, type: null, value: 0 }
            };
        case 'SET_DELIVERY':
            return {
                ...state,
                delivery: { ...state.delivery, ...action.payload }
            };
        case 'PLACE_ORDER': {
            const order = action.payload;
            const savedOrders = JSON.parse(window.localStorage.getItem('hamzafood-orders') || '[]');
            const newOrder = {
                ...order,
                orderId: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
                placedAt: new Date().toISOString()
            };
            const updatedOrders = [newOrder, ...savedOrders].slice(0, 50);
            window.localStorage.setItem('hamzafood-orders', JSON.stringify(updatedOrders));
            return {
                ...state,
                orderHistory: updatedOrders,
                cart: { ...state.cart, items: [] },
                promo: { code: null, discount: 0, type: null, value: 0 },
                delivery: { name: '', phone: '', address: '', notes: '', paymentMethod: 'Cash on Delivery' }
            };
        }
        case 'LOAD_ORDERS':
            return {
                ...state,
                orderHistory: action.payload
            };
        default:
            return state;
    }
}

const store = createStore(reducer, preloadedState);

// Persist the entire Redux state so everything survives page refresh and
// multiple browser tabs share the same demo data for the whole day.
store.subscribe(() => {
    try {
        const state = store.getState();
        window.localStorage.setItem(PERSIST_KEY, JSON.stringify(state));
        // Keep restaurant_snapshot for backward compat with the public queue page
        window.localStorage.setItem('restaurant_snapshot', JSON.stringify(state.restaurant));
    } catch (e) {
        // ignore storage errors (private mode / quota)
    }
});

export default store;
