import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Layout = lazy(() => import('./components/Layout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const POS = lazy(() => import('./pages/POS'));
const DueCollection = lazy(() => import('./pages/DueCollection'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Reports = lazy(() => import('./pages/Reports'));
const Profile = lazy(() => import('./pages/Profile'));
const Customers = lazy(() => import('./pages/Customers'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Returns = lazy(() => import('./pages/Returns'));
const Purchases = lazy(() => import('./pages/Purchases'));
const StockAdjustments = lazy(() => import('./pages/StockAdjustments'));
const DiscountCodes = lazy(() => import('./pages/DiscountCodes'));
const EndOfDay = lazy(() => import('./pages/EndOfDay'));
const SalesTargets = lazy(() => import('./pages/SalesTargets'));
const Staff = lazy(() => import('./pages/Staff'));
const Help = lazy(() => import('./pages/Help'));
const SuperAdminLogin = lazy(() => import('./pages/SuperAdminLogin'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));

const TitleManager = () => {
  const location = useLocation();

  React.useEffect(() => {
    const path = location.pathname;
    let title = 'Hisabi-POS';

    if (path.includes('/dashboard')) title = 'Dashboard | Hisabi-POS';
    else if (path.includes('/pos')) title = 'Point of Sale | Hisabi-POS';
    else if (path.includes('/products')) title = 'Inventory Management | Hisabi-POS';
    else if (path.includes('/invoices')) title = 'Billing & Invoices | Hisabi-POS';
    else if (path.includes('/reports')) title = 'Business Analytics | Hisabi-POS';
    else if (path.includes('/login')) title = 'Merchant Login | Hisabi-POS';
    else if (path.includes('/super-admin')) title = 'System Administration | Hisabi-POS';

    document.title = title;
  }, [location]);

  return null;
};

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Hisabi-POS...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <TitleManager />
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="pos" element={<POS />} />
              <Route path="due-collection" element={<DueCollection />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
              <Route path="customers" element={<Customers />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="returns" element={<Returns />} />
              <Route path="purchases" element={<Purchases />} />
              <Route path="stock-adjustments" element={<StockAdjustments />} />
              <Route path="discount-codes" element={<DiscountCodes />} />
              <Route path="targets" element={<SalesTargets />} />
              <Route path="staff" element={<Staff />} />
              <Route path="end-of-day" element={<EndOfDay />} />
              <Route path="help" element={<Help />} />
            </Route>

            {/* Hidden Super Admin Routes */}
            <Route path="/super-admin-login" element={<SuperAdminLogin />} />
            <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
