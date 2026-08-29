// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import WeatherDashboard from './WeatherDashboard';
import LocationTracker from './components/LocationTracker';
import CalendarComponent from './components/CalendarComponent';
import PrayerTimes from './namaz/PrayerTimes';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Layout from './Layout';
import Home from './Pages/Home';
import FoodDetail from './Pages/FoodDetail';
import Cart from './Pages/Cart';
import Checkout from './Pages/Checkout';
import History from './Pages/History';
import OrderTracking from './Pages/OrderTracking';
import RestaurantDetail from './Pages/RestaurantDetail';
import SalesLogin from './Pages/SalesLogin';
import SalesDashboard from './Pages/SalesDashboard';
import SalesReceipt from './Pages/SalesReceipt';
import SalesMenu from './Pages/SalesMenu';
import SalesReports from './Pages/SalesReports';
import SalesHistory from './Pages/SalesHistory';
import { useTheme } from './theme/ThemeContext';

function ThemedToasts() {
  const { theme } = useTheme();
  return <ToastContainer position="top-center" theme={theme} autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />;
}

function App() {
  return (
    <Router>
      <Layout>
        <ThemedToasts />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/weather" element={<WeatherDashboard />} />
          <Route path="/location" element={<LocationTracker />} />
          <Route path="/calendar" element={<CalendarComponent />} />
          <Route path="/prayer-times" element={<PrayerTimes />} />
          <Route path="/food/:id" element={<FoodDetail />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/history" element={<History />} />
          <Route path="/tracking/:orderId?" element={<OrderTracking />} />
          <Route path="/sales/login" element={<SalesLogin />} />
          <Route path="/sales/dashboard" element={<SalesDashboard />} />
          <Route path="/sales/receipt/:orderId" element={<SalesReceipt />} />
          <Route path="/sales/history" element={<SalesHistory />} />
          <Route path="/sales/menu" element={<SalesMenu />} />
          <Route path="/sales/reports" element={<SalesReports />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
