import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ReactNode } from 'react';
import OwnerLayout from './components/layout/OwnerLayout';
import LandingPage from './pages/public/LandingPage';
import RegisterPage from './pages/owner/RegisterPage';
import LoginPage from './pages/owner/LoginPage';
import SetupPage from './pages/owner/SetupPage';
import DashboardPage from './pages/owner/DashboardPage';
import MenuPage from './pages/owner/MenuPage';
import MenuImportPage from './pages/owner/MenuImportPage';
import TablesPage from './pages/owner/TablesPage';
import OrdersPage from './pages/owner/OrdersPage';
import CustomerMenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import OrderStatusPage from './pages/customer/OrderStatusPage';
import DemoRedirect from './pages/customer/DemoRedirect';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-green border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/owner/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/demo" element={<DemoRedirect />} />
            <Route path="/owner/register" element={<RegisterPage />} />
            <Route path="/owner/login" element={<LoginPage />} />
            <Route path="/owner" element={<ProtectedRoute><OwnerLayout /></ProtectedRoute>}>
              <Route path="setup" element={<SetupPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="menu/import" element={<MenuImportPage />} />
              <Route path="tables" element={<TablesPage />} />
              <Route path="orders" element={<OrdersPage />} />
            </Route>
            <Route path="/order/:tableToken" element={<CustomerMenuPage />} />
            <Route path="/order/:tableToken/cart" element={<CartPage />} />
            <Route path="/order-status/:orderId" element={<OrderStatusPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
