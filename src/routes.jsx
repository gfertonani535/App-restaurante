import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '@/components/layouts/AdminLayout.jsx';
import { MenuPage } from '@/pages/MenuPage.jsx';
import { NotFoundPage } from '@/pages/NotFoundPage.jsx';
import { ProductDetailPage } from '@/pages/ProductDetailPage.jsx';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage.jsx';
import { CashClosurePage } from '@/pages/admin/CashClosurePage.jsx';
import { OrderDetailPage } from '@/pages/admin/OrderDetailPage.jsx';
import { OrdersPage } from '@/pages/admin/OrdersPage.jsx';
import { ProductCreatePage } from '@/pages/admin/ProductCreatePage.jsx';
import { ProductEditPage } from '@/pages/admin/ProductEditPage.jsx';
import { ProductsPage } from '@/pages/admin/ProductsPage.jsx';
import { SettingsPage } from '@/pages/admin/SettingsPage.jsx';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cuenta" element={<Navigate to="/admin/productos" replace />} />
        <Route path="/account" element={<Navigate to="/admin/productos" replace />} />
        <Route path="/producto/:productId" element={<ProductDetailPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="cierre-de-caja" element={<CashClosurePage />} />
          <Route path="cierre-caja" element={<Navigate to="/admin/cierre-de-caja" replace />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="pedidos/:orderId" element={<OrderDetailPage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="productos/nuevo" element={<ProductCreatePage />} />
          <Route path="productos/:productId/editar" element={<ProductEditPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="configuracion" element={<Navigate to="/admin/settings" replace />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
