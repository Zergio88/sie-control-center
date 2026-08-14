import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <main>
      <h1>{title}</h1>
      <p>Fase 0 — esta página todavía es un marcador de posición.</p>
      <nav aria-label="Navegación">
        <ul>
          <li>
            <Link to="/devices">Dispositivos</Link>
          </li>
          <li>
            <Link to="/inventory">Registrar inventario</Link>
          </li>
          <li>
            <Link to="/users">Usuarios</Link>
          </li>
          <li>
            <Link to="/serial-numbers/search">Buscar serial</Link>
          </li>
          <li>
            <Link to="/catalog/zones">Catálogo</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
