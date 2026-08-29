// src/utils/format.js
export const formatPKR = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
