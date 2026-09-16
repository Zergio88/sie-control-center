import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AdminRoute } from '@/auth/AdminRoute';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import PlaceholderPage from '@/pages/PlaceholderPage';

/**
 * Single source of truth for the app's route tree.
 *
 * Phase 1: /login + guarded shell. Phases 2–6 replace the PlaceholderPage
 * elements with real pages.
 */
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/devices" replace /> },
      { path: 'devices', element: <PlaceholderPage title="Dispositivos" /> },
      { path: 'inventory', element: <PlaceholderPage title="Registrar inventario" /> },
      { path: 'serial-numbers/search', element: <PlaceholderPage title="Buscar serial" /> },
      {
        path: 'users',
        element: (
          <AdminRoute>
            <PlaceholderPage title="Usuarios" />
          </AdminRoute>
        ),
      },
      {
        path: 'catalog',
        children: [
          { index: true, element: <Navigate to="/catalog/zones" replace /> },
          { path: 'zones', element: <PlaceholderPage title="Zonas" /> },
          { path: 'locations', element: <PlaceholderPage title="Ubicaciones" /> },
          { path: 'pallets', element: <PlaceholderPage title="Pallets" /> },
          { path: 'device-types', element: <PlaceholderPage title="Tipos de dispositivo" /> },
          { path: 'spare-lots', element: <PlaceholderPage title="Lotes de repuestos" /> },
        ],
      },
    ],
  },
  { path: '*', element: <PlaceholderPage title="Página no encontrada" /> },
]);
