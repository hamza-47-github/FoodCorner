// src/App.js
import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
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
import RestaurantLogin from './Pages/RestaurantLogin';
import RestaurantHome from './Pages/RestaurantHome';
import RestaurantTables from './Pages/RestaurantTables';
import RestaurantTakeOrder from './Pages/RestaurantTakeOrder';
import RestaurantOrders from './Pages/RestaurantOrders';
import RestaurantKitchen from './Pages/RestaurantKitchen';
import RestaurantBilling from './Pages/RestaurantBilling';
import RestaurantReceipt from './Pages/RestaurantReceipt';
import RestaurantOrderHistory from './Pages/RestaurantOrderHistory';
import RestaurantMenu from './Pages/RestaurantMenu';
import RestaurantQueue from './Pages/RestaurantQueue';
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
          <Route path="/restaurant/login" element={<RestaurantLogin />} />
          <Route path="/restaurant/queue" element={<RestaurantQueue />} />
          <Route path="/restaurant" element={<RestaurantHome />} />
          <Route path="/restaurant/tables" element={<RestaurantTables />} />
          <Route path="/restaurant/order/:tableId" element={<RestaurantTakeOrder />} />
          <Route path="/restaurant/orders" element={<RestaurantOrders />} />
          <Route path="/restaurant/kitchen" element={<RestaurantKitchen />} />
          <Route path="/restaurant/billing/:tableId" element={<RestaurantBilling />} />
          <Route path="/restaurant/receipt/:billId" element={<RestaurantReceipt />} />
          <Route path="/restaurant/menu" element={<RestaurantMenu />} />
          <Route path="/restaurant/history" element={<RestaurantOrderHistory />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
