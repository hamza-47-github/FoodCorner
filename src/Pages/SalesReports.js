// src/pages/SalesReports.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChartBar, FaSignOutAlt, FaDownload } from 'react-icons/fa';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatPKR } from '../utils/format';
import './Sales.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AUTH_KEY = 'sales_auth';
const SALES_ORDERS_KEY = 'sales_orders';

const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};

const endOfDay = (d) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
};

function SalesReports() {
    const [orders, setOrders] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem(AUTH_KEY)) {
            navigate('/sales/login');
            return;
        }
        try {
            const saved = JSON.parse(window.localStorage.getItem(SALES_ORDERS_KEY) || '[]');
            setOrders(saved);
            if (saved.length > 0) {
                const dates = saved.map(o => new Date(o.date).getTime());
                const min = new Date(Math.min(...dates));
                const max = new Date(Math.max(...dates));
                setFromDate(min.toISOString().slice(0, 10));
                setToDate(max.toISOString().slice(0, 10));
            } else {
                const today = new Date();
                setFromDate(today.toISOString().slice(0, 10));
                setToDate(today.toISOString().slice(0, 10));
            }
        } catch (e) {
            setOrders([]);
        }
    }, [navigate]);

    const applyPreset = (preset) => {
        const today = new Date();
        if (preset === 'today') {
            setFromDate(today.toISOString().slice(0, 10));
            setToDate(today.toISOString().slice(0, 10));
        } else if (preset === 'week') {
            const start = new Date(today);
            start.setDate(today.getDate() - 6);
            setFromDate(start.toISOString().slice(0, 10));
            setToDate(today.toISOString().slice(0, 10));
        } else if (preset === 'month') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            setFromDate(start.toISOString().slice(0, 10));
            setToDate(today.toISOString().slice(0, 10));
        } else {
            const dates = orders.map(o => new Date(o.date).getTime());
            const min = dates.length ? new Date(Math.min(...dates)) : today;
            const max = dates.length ? new Date(Math.max(...dates)) : today;
            setFromDate(min.toISOString().slice(0, 10));
            setToDate(max.toISOString().slice(0, 10));
        }
    };

    const filteredOrders = useMemo(() => {
        if (!fromDate || !toDate) return orders;
        const from = startOfDay(fromDate);
        const to = endOfDay(toDate);
        return orders.filter(o => {
            const d = new Date(o.date);
            return d >= from && d <= to;
        });
    }, [orders, fromDate, toDate]);

    const summary = useMemo(() => {
        const totalOrders = filteredOrders.length;
        const totalRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);
        const totalProfit = filteredOrders.reduce((s, o) => s + (o.profit || 0), 0);
        const totalItems = filteredOrders.reduce((s, o) => s + o.items.reduce((is, i) => is + i.qty, 0), 0);
        const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        return { totalOrders, totalRevenue, totalProfit, totalItems, avgOrder };
    }, [filteredOrders]);

    const dailyData = useMemo(() => {
        const map = new Map();
        filteredOrders.forEach(o => {
            const d = new Date(o.date);
            const key = d.toISOString().slice(0, 10);
            const entry = map.get(key) || { revenue: 0, profit: 0, count: 0, label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }) };
            entry.revenue += o.total;
            entry.profit += (o.profit || 0);
            entry.count += 1;
            map.set(key, entry);
        });
        const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
        return {
            labels: sorted.map(([, v]) => v.label),
            revenue: sorted.map(([, v]) => v.revenue),
            profit: sorted.map(([, v]) => v.profit),
        };
    }, [filteredOrders]);

    const chartData = {
        labels: dailyData.labels,
        datasets: [
            {
                label: 'Revenue',
                data: dailyData.revenue,
                backgroundColor: 'rgba(249, 115, 22, 0.75)',
                borderRadius: 6,
            },
            {
                label: 'Profit',
                data: dailyData.profit,
                backgroundColor: 'rgba(16, 185, 129, 0.75)',
                borderRadius: 6,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${formatPKR(ctx.parsed.y)}`,
                },
            },
        },
        scales: {
            y: {
                ticks: { callback: (v) => formatPKR(v) },
            },
        },
    };

    const handleLogout = () => {
        localStorage.removeItem(AUTH_KEY);
        navigate('/sales/login');
    };

    const exportCSV = () => {
        const header = 'Invoice,Date,Customer,Type,Items,Total,Profit\n';
        const rows = filteredOrders.map(o => [
            o.invoiceNo,
            new Date(o.date).toLocaleString(),
            `"${o.customer}"`,
            o.orderType,
            o.items.reduce((s, i) => s + i.qty, 0),
            o.total,
            o.profit || 0,
        ].join(',')).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${fromDate}-to-${toDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!localStorage.getItem(AUTH_KEY)) {
        return null;
    }

    return (
        <div className="sales-page">
            <div className="sales-header">
                <div>
                    <h1>Sales Reports</h1>
                    <p className="section-subtitle" style={{ margin: 0 }}>Analyze performance with a date range filter</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link to="/sales/dashboard" className="btn-modern btn-outline-modern sales-logout-btn">
                        <FaChartBar /> POS
                    </Link>
                    <button className="btn-modern btn-outline-modern sales-logout-btn" onClick={exportCSV}>
                        <FaDownload /> Export
                    </button>
                    <button className="btn-modern btn-outline-modern sales-logout-btn" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            <div className="report-filter-card surface-card">
                <div className="report-filter-row">
                    <div className="report-date-field">
                        <label htmlFor="from-date">From</label>
                        <input
                            id="from-date"
                            type="date"
                            value={fromDate}
                            max={toDate || undefined}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="report-date-field">
                        <label htmlFor="to-date">To</label>
                        <input
                            id="to-date"
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div className="report-presets">
                        <button className="btn-modern btn-outline-modern report-preset" onClick={() => applyPreset('today')}>Today</button>
                        <button className="btn-modern btn-outline-modern report-preset" onClick={() => applyPreset('week')}>Last 7 Days</button>
                        <button className="btn-modern btn-outline-modern report-preset" onClick={() => applyPreset('month')}>This Month</button>
                        <button className="btn-modern btn-outline-modern report-preset" onClick={() => applyPreset('all')}>All Time</button>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <FaChartBar />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Orders</span>
                        <span className="stat-value">{summary.totalOrders}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                        <FaChartBar />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Revenue</span>
                        <span className="stat-value">{formatPKR(summary.totalRevenue)}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                        <FaChartBar />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Profit</span>
                        <span className="stat-value">{formatPKR(summary.totalProfit)}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                        <FaChartBar />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Items Sold</span>
                        <span className="stat-value">{summary.totalItems}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <FaChartBar />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Avg Order</span>
                        <span className="stat-value">{formatPKR(summary.avgOrder)}</span>
                    </div>
                </div>
            </div>

            <div className="report-chart-card surface-card">
                <h2>Daily Revenue & Profit</h2>
                <div className="report-chart-wrap">
                    {dailyData.labels.length > 0 ? (
                        <Bar data={chartData} options={chartOptions} />
                    ) : (
                        <div className="pos-cart-empty">
                            <FaChartBar />
                            <p>No sales in selected range</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="table-wrap">
                <table className="sales-table">
                    <thead>
                        <tr>
                            <th>Invoice</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Type</th>
                            <th>Items</th>
                            <th className="amount-col">Total</th>
                            <th className="amount-col">Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No orders in this date range
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.invoiceNo}</td>
                                    <td>{new Date(order.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                                    <td>{order.customer}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{order.orderType}</td>
                                    <td>{order.items.reduce((s, i) => s + i.qty, 0)}</td>
                                    <td className="amount-col">{formatPKR(order.total)}</td>
                                    <td className="amount-col">{formatPKR(order.profit || 0)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SalesReports;
