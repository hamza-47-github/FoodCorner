// src/restaurant/restaurantActions.js
export const setUser = (userId) => ({ type: 'RS_SET_USER', userId });
export const logout = () => ({ type: 'RS_LOGOUT' });
export const placeOrder = (payload) => ({ type: 'RS_PLACE_ORDER', payload });
export const kitchenStart = (orderId) => ({ type: 'RS_KITCHEN_START', orderId });
export const kitchenReady = (orderId) => ({ type: 'RS_KITCHEN_READY', orderId });
export const serveOrder = (orderId) => ({ type: 'RS_SERVE_ORDER', orderId });
export const startBilling = (tableId) => ({ type: 'RS_START_BILLING', payload: { tableId } });
export const payBill = (payload) => ({ type: 'RS_PAY_BILL', payload });
export const resetDemo = () => ({ type: 'RS_RESET_DEMO' });