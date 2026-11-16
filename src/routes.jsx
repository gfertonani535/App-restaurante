import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '@/components/layouts/AdminLayout.jsx';
import { MenuPage } from '@/pages/public/MenuPage.jsx';
import { NotFoundPage } from '@/pages/NotFoundPage.jsx';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage.jsx';
import { CategoriesPage } from '@/pages/admin/CategoriesPage.jsx';
import { CashClosurePage } from '@/pages/admin/CashClosurePage.jsx';
import { OrdersPage } from '@/pages/admin/OrdersPage.jsx';
import { ProductCreatePage } from '@/pages/admin/ProductCreatePage.jsx';
import { ProductEditPage } from '@/pages/admin/ProductEditPage.jsx';
import { ProductsPage } from '@/pages/admin/ProductsPage.jsx';
import { SettingsPage } from '@/pages/admin/SettingsPage.jsx';
import { LoginPage } from '@/pages/auth/LoginPage.jsx';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute.jsx';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cuenta" element={<Navigate to="/menu" replace />} />
        <Route path="/account" element={<Navigate to="/menu" replace />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="cierre-de-caja" element={<CashClosurePage />} />
          <Route path="cierre-caja" element={<Navigate to="/admin/cierre-de-caja" replace />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="productos/nuevo" element={<ProductCreatePage />} />
          <Route path="productos/:productId/editar" element={<ProductEditPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
          <Route path="settings" element={<Navigate to="/admin/configuracion" replace />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
