import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AdminRoute } from '@/auth/AdminRoute';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppLayout } from '@/layouts/AppLayout';
import { DevicesPage } from '@/pages/DevicesPage';
import { DeviceTypesPage } from '@/pages/DeviceTypesPage';
import { InventoryEntryPage } from '@/pages/InventoryEntryPage';
import { LocationsPage } from '@/pages/LocationsPage';
import { LoginPage } from '@/pages/LoginPage';
import { PalletsPage } from '@/pages/PalletsPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import { SpareLotsPage } from '@/pages/SpareLotsPage';
import { UsersPage } from '@/pages/UsersPage';
import { ZonesPage } from '@/pages/ZonesPage';

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
      { path: 'devices', element: <DevicesPage /> },
      { path: 'inventory', element: <InventoryEntryPage /> },
      { path: 'serial-numbers/search', element: <PlaceholderPage title="Buscar serial" /> },
      {
        path: 'users',
        element: (
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        ),
      },
      {
        path: 'catalog',
        children: [
          { index: true, element: <Navigate to="/catalog/zones" replace /> },
          {
            path: 'zones',
            element: (
              <AdminRoute>
                <ZonesPage />
              </AdminRoute>
            ),
          },
          {
            path: 'locations',
            element: (
              <AdminRoute>
                <LocationsPage />
              </AdminRoute>
            ),
          },
          {
            path: 'pallets',
            element: (
              <AdminRoute>
                <PalletsPage />
              </AdminRoute>
            ),
          },
          {
            path: 'device-types',
            element: (
              <AdminRoute>
                <DeviceTypesPage />
              </AdminRoute>
            ),
          },
          {
            path: 'spare-lots',
            element: (
              <AdminRoute>
                <SpareLotsPage />
              </AdminRoute>
            ),
          },
        ],
      },
    ],
  },
  { path: '*', element: <PlaceholderPage title="Página no encontrada" /> },
]);
