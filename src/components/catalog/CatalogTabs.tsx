import { NavLink, useLocation } from 'react-router-dom';

const TABS: readonly { to: string; label: string }[] = [
  { to: '/catalog/zones', label: 'Zonas' },
  { to: '/catalog/locations', label: 'Ubicaciones' },
  { to: '/catalog/pallets', label: 'Pallets' },
  { to: '/catalog/device-types', label: 'Tipos de dispositivo' },
  { to: '/catalog/spare-lots', label: 'Lotes de repuestos' },
];

/**
 * Horizontal tab bar for switching between catalog sections. Rendered at the
 * top of every catalog page so section changes don't require the sidebar.
 */
export function CatalogTabs() {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Secciones del catálogo" className="mt-6 border-b border-border">
      <div className="flex flex-wrap gap-1">
        {TABS.map((tab) => {
          const active = pathname === tab.to;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`-mb-px rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-violet-800 bg-surface text-violet-800'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
