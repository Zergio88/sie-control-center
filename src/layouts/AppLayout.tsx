import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { Button } from '@/components/ui/Button';
import type { UserRole } from '@/types/auth';

interface NavItem {
  to: string;
  label: string;
  adminOnly: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/devices', label: 'Dispositivos', adminOnly: false },
  { to: '/inventory', label: 'Registrar inventario', adminOnly: false },
  { to: '/serial-numbers/search', label: 'Buscar serial', adminOnly: false },
  { to: '/catalog/zones', label: 'Catálogo', adminOnly: false },
  { to: '/users', label: 'Usuarios', adminOnly: true },
];

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
};

function isNavActive(to: string, pathname: string): boolean {
  // The catalog section has its own index redirect; keep its link highlighted
  // across every /catalog/* sub-page.
  if (to === '/catalog/zones') return pathname.startsWith('/catalog');
  return pathname === to;
}

export function AppLayout() {
  const { session, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === 'ADMIN');
  const handleLogout = (): void => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-60 flex-col bg-violet-950 text-white">
        <div className="px-5 py-5">
          <p className="text-lg font-semibold tracking-wide">SIE</p>
          <p className="text-xs text-violet-100/60">Sistema Integral de Inventario</p>
        </div>

        <nav aria-label="Navegación principal" className="flex-1 space-y-1 px-3 pt-2">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={`sidebar-link ${isNavActive(item.to, location.pathname) ? 'sidebar-link-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="truncate text-sm font-medium text-white">{session?.email}</p>
          <p className="mb-3 text-xs text-violet-100/60">{role ? ROLE_LABEL[role] : ''}</p>
          <Button variant="ghost" className="w-full" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="ml-60 min-w-0 flex-1 bg-surface-muted p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
