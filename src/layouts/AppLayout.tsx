import { useCallback, useEffect, useRef, useState } from 'react';
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
  { to: '/catalog/zones', label: 'Catálogo', adminOnly: true },
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

/** True below the desktop breakpoint — drives the collapsible drawer behavior. */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const onChange = (): void => setIsMobile(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

export function AppLayout() {
  const { session, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === 'ADMIN');
  const handleLogout = useCallback((): void => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const closeDrawer = useCallback((): void => {
    setSidebarOpen(false);
    // Focus returns to the toggle after the drawer's inert flag is lifted.
    requestAnimationFrame(() => toggleRef.current?.focus());
  }, []);

  // Close the drawer whenever the route changes (nav click or URL bar).
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!sidebarOpen || !isMobile) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen, isMobile, closeDrawer]);

  // Send focus into the drawer when it opens (the toggle is now inert).
  useEffect(() => {
    if (!sidebarOpen || !isMobile) return;
    const frame = requestAnimationFrame(() => {
      document.querySelector<HTMLAnchorElement>('aside nav a')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [sidebarOpen, isMobile]);

  const drawerHidden = isMobile && !sidebarOpen;

  return (
    <div className="flex min-h-screen">
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={closeDrawer}
          className="fixed inset-0 z-30 cursor-pointer bg-black/40"
        />
      )}

      <aside
        id="app-sidebar"
        inert={drawerHidden}
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-violet-950 text-white transition-transform duration-200 md:static md:transition-none ${
          drawerHidden ? '-translate-x-full' : ''
        }`}
      >
        <div className="px-5 py-5">
          <p className="text-lg font-semibold tracking-wide">SIE</p>
          <p className="text-xs text-violet-100/60">Sistema Integral de Inventario</p>
        </div>

        <nav aria-label="Navegación principal" className="flex-1 space-y-1 px-3 pt-2">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
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

      <main inert={isMobile && sidebarOpen} className="min-w-0 flex-1 bg-surface-muted p-6 lg:p-8">
        <Button
          ref={toggleRef}
          variant="secondary"
          className="mb-4 md:hidden"
          aria-controls="app-sidebar"
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="ms-2">Menú</span>
        </Button>
        <Outlet />
      </main>
    </div>
  );
}
