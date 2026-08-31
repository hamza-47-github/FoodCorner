// src/store.js
import { createStore } from 'redux';
import restaurantReducer from './restaurant/restaurantReducer';
import { initialRestaurantState } from './restaurant/restaurantData';

const initialState = {
    cart: {
        items: []
    },
    promo: {
        code: null,
        discount: 0,
        type: null,
        value: 0
    },
    delivery: {
        name: '',
        phone: '',
        address: '',
        notes: '',
        paymentMethod: 'Cash on Delivery'
    },
    orderHistory: [],
    restaurant: initialRestaurantState
};

function reducer(state = initialState, action) {
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

const store = createStore(reducer);

// Persist the restaurant slice so the public Order Queue page (even in another
// browser tab) can show live order/table status without requiring a login.
store.subscribe(() => {
    try {
        window.localStorage.setItem('restaurant_snapshot', JSON.stringify(store.getState().restaurant));
    } catch (e) {
        // ignore storage errors (private mode / quota)
    }
});

export default store;
