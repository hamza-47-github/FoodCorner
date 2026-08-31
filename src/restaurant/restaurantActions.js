// src/restaurant/restaurantActions.js
export const setUser = (userId) => ({ type: 'RS_SET_USER', userId });
export const logout = () => ({ type: 'RS_LOGOUT' });
export const placeOrder = (payload) => ({ type: 'RS_PLACE_ORDER', payload });
export const kitchenStart = (orderId) => ({ type: 'RS_KITCHEN_START', orderId });
export const kitchenReady = (orderId) => ({ type: 'RS_KITCHEN_READY', orderId });
export const serveOrder = (orderId) => ({ type: 'RS_SERVE_ORDER', orderId });
export const startBilling = (tableId) => ({ type: 'RS_START_BILLING', payload: { tableId } });
export const payBill = (payload) => ({ type: 'RS_PAY_BILL', payload });
export const addMenuItem = (payload) => ({ type: 'RS_ADD_MENU_ITEM', payload });
export const removeMenuItem = (itemId) => ({ type: 'RS_REMOVE_MENU_ITEM', itemId });
export const addTable = () => ({ type: 'RS_ADD_TABLE' });
export const resetDemo = () => ({ type: 'RS_RESET_DEMO' });