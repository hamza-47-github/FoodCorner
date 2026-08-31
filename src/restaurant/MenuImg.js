// src/restaurant/MenuImg.js
// Renders a real food image when the item has one; otherwise falls back to an
// emoji on a category-tinted background.
import React from 'react';
import { CATEGORY_TONES } from './restaurantData';

// Resolve a menu image path to an absolute URL under the app's public base.
const resolveImg = (src) => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src;      // absolute URL
    if (/\.(png|jpe?g|webp|gif|svg)$/i.test(src)) {
        return `${process.env.PUBLIC_URL || ''}/${src.replace(/^\/+/, '')}`;
    }
    return null; // looks like an emoji/sticker
};

export function MenuImg({ item, className }) {
    const src = resolveImg(item.image);
    if (src) {
        return (
            <img
                src={src}
                alt={item.name}
                className={className || 'menu-img'}
                loading="lazy"
            />
        );
    }
    const fallback = item.image || '🍽️';
    return (
        <div className={className || 'menu-img'} style={{ background: CATEGORY_TONES[item.category] || 'var(--primary-soft)' }}>
            <span style={{ fontSize: '2.4rem' }}>{fallback}</span>
        </div>
    );
}

export default MenuImg;