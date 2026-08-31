// src/restaurant/useRestaurantAuth.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser as setUserAction } from './restaurantActions';

const RESTAURANT_USER_KEY = 'restaurant_user';

export const getStoredUser = () => {
    try {
        return JSON.parse(window.localStorage.getItem(RESTAURANT_USER_KEY) || 'null');
    } catch (e) {
        return null;
    }
};

// Returns the logged-in user (from Redux, hydrated from localStorage) or null.
export function useRestaurantUser() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.restaurant.currentUser);

    useEffect(() => {
        if (!user) {
            const stored = getStoredUser();
            if (stored && stored.id) {
                dispatch(setUserAction(stored.id));
            }
        }
    }, [user, dispatch]);

    return user;
}

// Redirects to login when there is no authenticated user.
export function useRequireRestaurantAuth() {
    const user = useRestaurantUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user && !getStoredUser()) {
            navigate('/restaurant/login', { replace: true });
        }
    }, [user, navigate]);

    return user;
}

export const hasRole = (user, allowed) => !allowed || (user && allowed.includes(user.role));

// Role-wise permissions for the restaurant module.
// Admin is a superuser on everything EXCEPT placing orders (waiters only).
export const PERMISSIONS = {
    placeOrder: ['Waiter'],
    serveOrder: ['Waiter', 'Admin'],
    kitchenWork: ['Kitchen Staff', 'Admin'],
    billing: ['Admin', 'Cashier'],
    payment: ['Admin', 'Cashier'],
    history: ['Admin', 'Cashier'],
    manageMenu: ['Admin'],
    manageTables: ['Admin']
};

export const can = (user, perm) => {
    if (!user) return false;
    const allowed = PERMISSIONS[perm];
    return !allowed || allowed.includes(user.role);
};